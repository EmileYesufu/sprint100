/**
 * Race Screen
 * Portrait race interface with tap buttons for left/right foot taps
 * Shows real-time race progress and handles tap events
 * 
 * Portrait mode enforced via app.json: "orientation": "portrait"
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { metersToPct } from "@/utils/formatting";
import { computeFinishThreshold, hasReachedThreshold } from "@/utils/finishThreshold";
import { computeFinalPlacings, type RacerProgress } from "@/utils/computeFinalPlacings";
import type { RaceUpdate, MatchResult, PlayerState, LocalEndResult } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RaceStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<RaceStackParamList, "Race">;

const { width, height } = Dimensions.get("window");

export default function RaceScreen({ route, navigation }: Props) {
  const { matchId, opponent } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();

  const [countdown, setCountdown] = useState<number | null>(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [myMeters, setMyMeters] = useState(0);
  const [opponentMeters, setOpponentMeters] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);
  
  // Client-local early end threshold logic — does not replace server authoritative end.
  // For online matches we show a local early finish overlay but wait for server.match_end to reconcile.
  const [isLocallyEnded, setIsLocallyEnded] = useState(false);
  const [localEndResult, setLocalEndResult] = useState<LocalEndResult | null>(null);
  const [serverResultReceived, setServerResultReceived] = useState(false);
  const [clientPlacings, setClientPlacings] = useState<string[]>([]); // Client-computed placings
  
  const lastSide = useRef<"left" | "right" | null>(null);
  const finishedPlayers = useRef<Set<number>>(new Set()); // Track who has finished
  const playerStates = useRef<Map<number, PlayerState>>(new Map()); // Track all player states

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      setRaceStarted(true);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleRaceUpdate = (update: RaceUpdate) => {
      if (update.matchId !== matchId) return;

      // Update meters for players and store all player states
      update.players.forEach((player: PlayerState) => {
        // Store player state for final placings computation
        playerStates.current.set(player.userId, player);
        
        if (player.userId === user?.id) {
          setMyMeters(player.meters);
        } else {
          setOpponentMeters(player.meters);
        }
        
        // Track finished players (crossed 100m line)
        if (player.meters >= 100) {
          finishedPlayers.current.add(player.userId);
        }
      });

      // Check if local threshold is reached (for client-side early end UI)
      const totalPlayers = update.players.length;
      const finishedCount = finishedPlayers.current.size;
      
      if (!isLocallyEnded && hasReachedThreshold(finishedCount, totalPlayers)) {
        // Compute final placings for ALL players (finished + unfinished by progress)
        const racerProgress: RacerProgress[] = Array.from(playerStates.current.values()).map(p => ({
          id: String(p.userId),
          distance: p.meters,
          hasFinished: p.meters >= 100,
          finishTime: p.meters >= 100 ? update.timestamp : undefined,
        }));

        const threshold = computeFinishThreshold(totalPlayers);
        const placings = computeFinalPlacings(racerProgress, totalPlayers, threshold);
        setClientPlacings(placings);

        if (__DEV__) {
          console.log('[RaceScreen] Local end triggered - final placings:', placings);
          console.log('[RaceScreen] Player states:', Array.from(playerStates.current.entries()));
        }

        // Mark race as locally ended (disable taps, show early finish overlay)
        setIsLocallyEnded(true);
        setLocalEndResult({
          endedAt: Date.now(),
          finishOrder: placings, // Use computed placings instead of just finished IDs
          threshold,
          totalRacers: totalPlayers,
          runners: [], // We don't have RunnerState in online mode, only PlayerState
        });
      }
    };

    const handleMatchEnd = (matchResult: MatchResult) => {
      if (matchResult.matchId !== matchId) return;

      // Server result received - this is authoritative
      setServerResultReceived(true);
      setRaceFinished(true);
      setResult(matchResult);

      // Show result for 3 seconds then navigate back
      setTimeout(() => {
        navigation.navigate("Queue");
      }, 3000);
    };

    socket.on("race_update", handleRaceUpdate);
    socket.on("match_end", handleMatchEnd);

    return () => {
      socket.off("race_update", handleRaceUpdate);
      socket.off("match_end", handleMatchEnd);
    };
  }, [socket, matchId, user, navigation, isLocallyEnded]);

  const handleTap = (side: "left" | "right") => {
    // Disable taps when locally ended (threshold reached) or race finished
    if (!raceStarted || raceFinished || isLocallyEnded || !socket) return;

    // Alternate sides mechanic (optional, can be removed if any tap works)
    if (lastSide.current === side) {
      // Optionally penalize for same-side taps
      return;
    }

    lastSide.current = side;
    socket.emit("tap", { matchId, side, ts: Date.now() });
  };

  const myProgress = metersToPct(myMeters);
  const opponentProgress = metersToPct(opponentMeters);

  // Result display
  const getResultText = () => {
    if (!result || !user) return "";
    const myResult = result.players.find((p) => p.userId === user.id);
    const won = result.winnerId === user.id;
    return won ? `You Won! +${myResult?.eloDelta || 0} Elo` : `You Lost ${myResult?.eloDelta || 0} Elo`;
  };

  return (
    <View style={styles.container}>
      {/* Progress Bars */}
      <View style={styles.progressSection}>
        {/* Opponent Progress */}
        <View style={styles.playerContainer}>
          <Text style={styles.playerLabel}>{opponent.email}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${opponentProgress}%` }]} />
          </View>
          <Text style={styles.metersText}>{Math.round(opponentMeters)}m</Text>
        </View>

        {/* My Progress */}
        <View style={styles.playerContainer}>
          <Text style={[styles.playerLabel, styles.myLabel]}>You</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, styles.myProgressBar, { width: `${myProgress}%` }]} />
          </View>
          <Text style={styles.metersText}>{Math.round(myMeters)}m</Text>
        </View>
      </View>

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* Local Early Finish Overlay (waiting for server confirmation) */}
      {isLocallyEnded && !serverResultReceived && localEndResult && (
        <View style={styles.localEndOverlay}>
          <Text style={styles.localEndTitle}>Race ended — top {localEndResult.threshold} finished</Text>
          <Text style={styles.localEndSubtext}>Waiting for official results...</Text>
        </View>
      )}

      {/* Race Finished Overlay (server authoritative result) */}
      {raceFinished && result && serverResultReceived && (
        <View style={styles.resultOverlay}>
          <Text style={styles.resultText}>{getResultText()}</Text>
          <Text style={styles.resultSubtext}>
            {isLocallyEnded && localEndResult ? "Official results updated" : "Returning to queue..."}
          </Text>
        </View>
      )}

      {/* Tap Buttons - Smaller, positioned at bottom third */}
      {!raceFinished && (
        <View style={styles.buttonArea}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.leftButton,
                isLocallyEnded && styles.buttonDisabled,
              ]}
              onPress={() => handleTap("left")}
              activeOpacity={isLocallyEnded ? 1 : 0.7}
              disabled={isLocallyEnded}
            >
              <Text style={[styles.buttonText, isLocallyEnded && styles.buttonTextDisabled]}>
                LEFT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.rightButton,
                isLocallyEnded && styles.buttonDisabled,
              ]}
              onPress={() => handleTap("right")}
              activeOpacity={isLocallyEnded ? 1 : 0.7}
              disabled={isLocallyEnded}
            >
              <Text style={[styles.buttonText, isLocallyEnded && styles.buttonTextDisabled]}>
                RIGHT
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  progressSection: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: "#1C1C1E",
  },
  playerContainer: {
    marginBottom: 24,
  },
  playerLabel: {
    fontSize: 16,
    color: "#999",
    marginBottom: 8,
  },
  myLabel: {
    color: "#007AFF",
    fontWeight: "600",
  },
  progressBarContainer: {
    height: 30,
    backgroundColor: "#2C2C2E",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF3B30",
    borderRadius: 15,
  },
  myProgressBar: {
    backgroundColor: "#34C759",
  },
  metersText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "right",
  },
  buttonArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  button: {
    width: width * 0.42,
    height: height * 0.22,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leftButton: {
    backgroundColor: "#1E3A8A",
  },
  rightButton: {
    backgroundColor: "#7C2D12",
  },
  buttonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "#fff",
  },
  localEndOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  localEndTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  localEndSubtext: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  resultSubtext: {
    fontSize: 16,
    color: "#999",
  },
});
