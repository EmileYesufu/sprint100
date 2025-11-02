/**
 * Race Screen - Stitch Design
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
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { metersToPct } from "@/utils/formatting";
import { computeFinishThreshold, hasReachedThreshold } from "@/utils/finishThreshold";
import { computeFinalPlacings, type RacerProgress } from "@/utils/computeFinalPlacings";
import { getPositionSuffix, getMedalForPosition, getAvatarInitials, getColorFromString } from "@/utils/uiHelpers";
import type { RaceUpdate, MatchResult, PlayerState, LocalEndResult } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RaceStackParamList } from "@/navigation/AppNavigator";
import { colors, typography, spacing, shadows, radii, accessibility } from "@/theme";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = NativeStackScreenProps<RaceStackParamList, "Race">;

const { width, height } = Dimensions.get("window");

interface PlayerDisplay {
  userId: number;
  username: string;
  meters: number;
  isPlayer: boolean;
}

export default function RaceScreen({ route, navigation }: Props) {
  const { matchId, opponent } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();
  const reduceMotion = useReducedMotion();

  const [countdown, setCountdown] = useState<number | null>(3);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [myMeters, setMyMeters] = useState(0);
  const [allPlayers, setAllPlayers] = useState<PlayerDisplay[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<number>(1);
  const [totalPlayers, setTotalPlayers] = useState(2);
  
  // Client-local early end threshold logic
  const [isLocallyEnded, setIsLocallyEnded] = useState(false);
  const [localEndResult, setLocalEndResult] = useState<LocalEndResult | null>(null);
  const [serverResultReceived, setServerResultReceived] = useState(false);
  const [clientPlacings, setClientPlacings] = useState<string[]>([]);
  
  const lastSide = useRef<"left" | "right" | null>(null);
  const finishedPlayers = useRef<Set<number>>(new Set());
  const playerStates = useRef<Map<number, PlayerState>>(new Map());
  const countdownAnim = useRef(new Animated.Value(0)).current;
  const elapsedTimeInterval = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer with animation
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0) {
        // "GO!" moment (skip animation if reduce motion is enabled)
        if (reduceMotion) {
          countdownAnim.setValue(1);
          setTimeout(() => {
            setRaceStarted(true);
            setRaceStartTime(Date.now());
            setCountdown(null);
          }, 500);
        } else {
          Animated.sequence([
            Animated.timing(countdownAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(countdownAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setRaceStarted(true);
            setRaceStartTime(Date.now());
            setCountdown(null);
          });
        }
      } else {
        setRaceStarted(true);
        setRaceStartTime(Date.now());
        setCountdown(null);
      }
      return;
    }

    // Animate countdown number (skip animation if reduce motion is enabled)
    if (reduceMotion) {
      countdownAnim.setValue(1); // Just show it, no animation
    } else {
      countdownAnim.setValue(0);
      Animated.sequence([
        Animated.timing(countdownAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(400),
        Animated.timing(countdownAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, reduceMotion]);

  // Track elapsed time during race
  useEffect(() => {
    if (!raceStarted || raceFinished || raceStartTime === null) {
      if (elapsedTimeInterval.current) {
        clearInterval(elapsedTimeInterval.current);
        elapsedTimeInterval.current = null;
      }
      return;
    }

    elapsedTimeInterval.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - raceStartTime) / 100) / 10);
    }, 100);

    return () => {
      if (elapsedTimeInterval.current) {
        clearInterval(elapsedTimeInterval.current);
      }
    };
  }, [raceStarted, raceFinished, raceStartTime]);

  // Update position and players list from player states
  useEffect(() => {
    if (playerStates.current.size === 0) return;

    const playersArray: PlayerDisplay[] = Array.from(playerStates.current.values()).map(p => ({
      userId: p.userId,
      username: p.email || `Player ${p.userId}`,
      meters: p.meters,
      isPlayer: p.userId === user?.id,
    }));

    // Sort by meters (descending) to determine position
    playersArray.sort((a, b) => b.meters - a.meters);
    
    // Find current player's position
    const playerIndex = playersArray.findIndex(p => p.isPlayer);
    if (playerIndex !== -1) {
      setCurrentPosition(playerIndex + 1);
    }

    setAllPlayers(playersArray);
    setTotalPlayers(playersArray.length);
  }, [myMeters, user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleRaceUpdate = (update: RaceUpdate) => {
      if (update.matchId !== matchId) return;

      // Update meters for players and store all player states
      update.players.forEach((player: PlayerState) => {
        playerStates.current.set(player.userId, player);
        
        if (player.userId === user?.id) {
          setMyMeters(player.meters);
        }
        
        if (player.meters >= 100) {
          finishedPlayers.current.add(player.userId);
        }
      });

      // Check if local threshold is reached
      const totalPlayers = update.players.length;
      const finishedCount = finishedPlayers.current.size;
      
      if (!isLocallyEnded && hasReachedThreshold(finishedCount, totalPlayers)) {
        const racerProgress: RacerProgress[] = Array.from(playerStates.current.values()).map(p => ({
          id: String(p.userId),
          distance: p.meters,
          hasFinished: p.meters >= 100,
          finishTime: p.meters >= 100 ? update.timestamp : undefined,
        }));

        const threshold = computeFinishThreshold(totalPlayers);
        const placings = computeFinalPlacings(racerProgress, totalPlayers, threshold);
        setClientPlacings(placings);

        setIsLocallyEnded(true);
        setLocalEndResult({
          endedAt: Date.now(),
          finishOrder: placings,
          threshold,
          totalRacers: totalPlayers,
          runners: [],
        });
      }
    };

    const handleMatchEnd = (matchResult: MatchResult) => {
      if (matchResult.matchId !== matchId) return;

      setServerResultReceived(true);
      setRaceFinished(true);
      setResult(matchResult);

      // Clear elapsed time interval
      if (elapsedTimeInterval.current) {
        clearInterval(elapsedTimeInterval.current);
        elapsedTimeInterval.current = null;
      }
    };

    socket.on("race_update", handleRaceUpdate);
    socket.on("match_end", handleMatchEnd);

    return () => {
      socket.off("race_update", handleRaceUpdate);
      socket.off("match_end", handleMatchEnd);
    };
  }, [socket, matchId, user, isLocallyEnded]);

  const handleTap = (side: "left" | "right") => {
    if (!raceStarted || raceFinished || isLocallyEnded || !socket) return;

    if (lastSide.current === side) {
      return; // Alternate sides mechanic
    }

    lastSide.current = side;
    socket.emit("tap", { matchId, side, ts: Date.now() });
  };

  const handleReturnHome = () => {
    navigation.navigate("Queue");
  };

  const handleRerun = () => {
    // Navigate back and rejoin queue or challenge same opponent
    navigation.navigate("Queue");
  };

  // Format elapsed time
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2).padStart(5, '0');
    return mins > 0 ? `${mins}:${secs}` : `00:${secs}`;
  };

  // Get player result from match result
  const getPlayerResult = () => {
    if (!result || !user) return null;
    return result.players.find((p) => p.userId === user.id);
  };

  // Countdown scale animation
  const countdownScale = countdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.2],
  });

  const countdownOpacity = countdownAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header: Race Info Bar */}
      {raceStarted && !raceFinished && (
        <View style={styles.header}>
          {/* Top info bar */}
          <View style={styles.headerTop}>
            <View style={styles.timerSection}>
              <Text style={styles.timerIcon}>⏱</Text>
              <Text style={styles.timerText}>{formatElapsedTime(elapsedTime)}</Text>
            </View>
            
            <View style={styles.positionIndicator}>
              <Text style={styles.positionText}>
                {currentPosition}{getPositionSuffix(currentPosition)} / {totalPlayers}
              </Text>
            </View>
            
            <View style={styles.flagSection}>
              <Text style={styles.flagIcon}>🏁</Text>
            </View>
          </View>

          {/* Progress Bar with Avatars */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFilled, { width: `${metersToPct(myMeters)}%` }]} />
              </View>
              {allPlayers.map((player, index) => {
                const progress = metersToPct(player.meters);
                const isPlayer = player.isPlayer;
                const avatarInitials = getAvatarInitials(player.username);
                const avatarColor = getColorFromString(player.username);
                
                return (
                  <View
                    key={player.userId}
                    style={[
                      styles.avatarMarker,
                      { left: `${Math.min(progress, 98)}%` },
                      isPlayer && styles.playerAvatarMarker
                    ]}
                  >
                    <View style={[styles.avatar, isPlayer && styles.playerAvatar, { backgroundColor: avatarColor }]}>
                      <Text style={styles.avatarText}>
                        {isPlayer ? "U" : avatarInitials.substring(0, 1)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Middle: Race Visualization (Dark Background) */}
      <View style={styles.middleSection} />

      {/* Bottom: Control Buttons */}
      {raceStarted && !raceFinished && (
        <View style={styles.buttonArea}>
          <TouchableOpacity
            style={[
              styles.tapButton,
              styles.leftButton,
              isLocallyEnded && styles.buttonDisabled,
            ]}
            onPress={() => handleTap("left")}
            activeOpacity={0.7}
            disabled={isLocallyEnded}
            accessibilityLabel="Tap Left"
            accessibilityHint="Increases your running pace when you tap the left button"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLocallyEnded }}
            hitSlop={accessibility.hitSlop}
          >
            <Text 
              style={[styles.buttonLabel, isLocallyEnded && styles.buttonLabelDisabled]}
              allowFontScaling={accessibility.allowFontScaling}
            >
              L
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tapButton,
              styles.rightButton,
              isLocallyEnded && styles.buttonDisabled,
            ]}
            onPress={() => handleTap("right")}
            activeOpacity={0.7}
            disabled={isLocallyEnded}
            accessibilityLabel="Tap Right"
            accessibilityHint="Increases your running pace when you tap the right button"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLocallyEnded }}
            hitSlop={accessibility.hitSlop}
          >
            <Text 
              style={[styles.buttonLabel, isLocallyEnded && styles.buttonLabelDisabled]}
              allowFontScaling={accessibility.allowFontScaling}
            >
              R
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
        <View style={styles.countdownOverlay}>
          <Animated.View
            style={{
              transform: [{ scale: countdownScale }],
              opacity: countdownOpacity,
            }}
          >
            <Text style={styles.countdownText}>{countdown}</Text>
          </Animated.View>
        </View>
      )}

      {/* "GO!" Overlay */}
      {countdown === 0 && (
        <View style={styles.countdownOverlay}>
          <Animated.View
            style={{
              transform: [{ scale: countdownScale }],
              opacity: countdownOpacity,
            }}
          >
            <Text style={styles.goText}>GO!</Text>
          </Animated.View>
        </View>
      )}

      {/* Race Finish Summary Overlay */}
      {raceFinished && result && serverResultReceived && (() => {
        const playerResult = getPlayerResult();
        if (!playerResult || !user) return null;

        const placement = result.players
          .sort((a, b) => (b.finalMeters || 0) - (a.finalMeters || 0))
          .findIndex(p => p.userId === user.id) + 1;
        
        const totalRacers = result.players.length;
        const playerTime = playerResult.finalMeters >= 100 
          ? (elapsedTime || 0).toFixed(2) 
          : "N/A";
        const medal = getMedalForPosition(placement);

        return (
          <View style={styles.resultOverlay}>
            {/* Top Section */}
            <View style={styles.resultTopSection}>
              <View style={styles.timerSection}>
                <Text style={styles.timerIcon}>⏱</Text>
                <Text style={styles.timerText}>{formatElapsedTime(elapsedTime || 0)}</Text>
              </View>
              
              <View style={styles.positionIndicator}>
                <Text style={styles.positionText}>
                  {placement}{getPositionSuffix(placement)} / {totalRacers}
                </Text>
              </View>
              
              <View style={styles.flagSection}>
                <Text style={styles.flagIcon}>🏁</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSectionTop}>
              <View style={styles.progressBarContainerTop}>
                <View style={styles.progressBarTop}>
                  <View style={[styles.progressBarFilled, { width: `${metersToPct(playerResult.finalMeters || 0)}%` }]} />
                </View>
                {result.players.map((p) => {
                  const progress = metersToPct(p.finalMeters || 0);
                  const isPlayer = p.userId === user.id;
                  const avatarInitials = getAvatarInitials(p.email || `Player ${p.userId}`);
                  const avatarColor = getColorFromString(p.email || `Player ${p.userId}`);
                  
                  return (
                    <View
                      key={p.userId}
                      style={[
                        styles.avatarMarker,
                        { left: `${Math.min(progress, 98)}%` },
                        isPlayer && styles.playerAvatarMarker
                      ]}
                    >
                      <View style={[styles.avatar, isPlayer && styles.playerAvatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarText}>
                          {isPlayer ? "U" : avatarInitials.substring(0, 1)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Middle Section - Dark Background */}
            <View style={styles.resultMiddleSection} />

            {/* Bottom Results Card */}
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>Race Finished!</Text>
              
              <View style={styles.resultCardContent}>
                <Text style={styles.resultCardSubtitle}>You finished</Text>
                <Text style={styles.resultCardPosition}>
                  {placement}{getPositionSuffix(placement)}
                </Text>
                
                <View style={styles.resultCardStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Time</Text>
                    <Text style={styles.statValue}>{playerTime}s</Text>
                  </View>
                  
                  {/* Personal Best section - matching TrainingRaceScreen design */}
                  {/* Note: Online races don't track personal bests, but we show empty space for visual parity */}
                  <View style={styles.statItem}>
                    {/* Could add ELO delta here instead for online races */}
                    {medal && (
                      <View style={styles.medalContainer}>
                        <Text style={styles.medalIcon}>{medal}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.resultCardButtons}>
                  <TouchableOpacity
                    style={styles.returnHomeButtonCard}
                    onPress={handleReturnHome}
                  >
                    <Text style={styles.returnHomeButtonText}>Return Home</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.rerunButtonCard}
                    onPress={handleRerun}
                  >
                    <Text style={styles.rerunButtonText}>Rerun</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      })()}

      {/* Local Early Finish Overlay (waiting for server) */}
      {isLocallyEnded && !serverResultReceived && localEndResult && (
        <View style={styles.localEndOverlay}>
          <Text style={styles.localEndTitle}>Race ended — top {localEndResult.threshold} finished</Text>
          <Text style={styles.localEndSubtext}>Waiting for official results...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dark background
  },
  header: {
    paddingTop: spacing.sp4,
    paddingBottom: spacing.sp3,
    paddingHorizontal: spacing.sp6,
    backgroundColor: colors.background,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sp3,
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp1,
  },
  timerIcon: {
    fontSize: 20,
    color: colors.text,
  },
  timerText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text,
  },
  positionIndicator: {
    flex: 1,
    alignItems: "center",
  },
  positionText: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text,
  },
  flagSection: {
    alignItems: "flex-end",
  },
  flagIcon: {
    fontSize: 24,
  },
  progressSection: {
    paddingTop: spacing.sp2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#1C2A3A",
    borderRadius: 4,
    position: "relative",
    overflow: "visible",
  },
  progressBarTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "#1C2A3A",
    borderRadius: 4,
  },
  progressBarFilled: {
    height: "100%",
    backgroundColor: colors.accent, // Electric blue
    borderRadius: 4,
  },
  avatarMarker: {
    position: "absolute",
    top: -12,
    marginLeft: -16,
    zIndex: 10,
  },
  playerAvatarMarker: {
    zIndex: 11,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1C2A3A",
  },
  playerAvatar: {
    borderColor: colors.accent,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.text,
  },
  middleSection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  buttonArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp6,
    paddingBottom: spacing.sp8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  tapButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  leftButton: {
    marginRight: spacing.sp2,
  },
  rightButton: {
    marginLeft: spacing.sp2,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonLabel: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.accent,
  },
  buttonLabelDisabled: {
    opacity: 0.5,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: colors.accent,
    textShadowColor: `${colors.accent}80`,
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  goText: {
    fontSize: 96,
    fontWeight: "bold",
    color: colors.accent,
    textShadowColor: `${colors.accent}80`,
    textShadowRadius: 16,
  },
  localEndOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  localEndTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.warning,
    marginBottom: spacing.sp4,
    textAlign: "center",
    paddingHorizontal: spacing.sp6,
  },
  localEndSubtext: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
  },
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0A1628", // Dark blue background
  },
  resultTopSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp6,
    paddingTop: spacing.sp10,
    paddingBottom: spacing.sp3,
  },
  progressSectionTop: {
    paddingHorizontal: spacing.sp6,
    paddingBottom: spacing.sp4,
  },
  progressBarContainerTop: {
    height: 8,
    backgroundColor: "#1C2A3A",
    borderRadius: 4,
    position: "relative",
    overflow: "visible",
  },
  progressBarTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "#1C2A3A",
    borderRadius: 4,
  },
  resultMiddleSection: {
    flex: 1,
    backgroundColor: "#0A1628",
  },
  resultCard: {
    backgroundColor: "#1C2A3A",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.sp6,
    paddingBottom: spacing.sp10,
  },
  resultCardTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sp4,
  },
  resultCardContent: {
    alignItems: "center",
  },
  resultCardSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.text,
    marginBottom: spacing.sp2,
  },
  resultCardPosition: {
    fontSize: 72,
    fontWeight: "bold",
    color: colors.accent,
    marginBottom: spacing.sp6,
  },
  resultCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: spacing.sp8,
    paddingHorizontal: spacing.sp5,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
    marginBottom: spacing.sp1,
  },
  statValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
  },
  medalContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  medalIcon: {
    fontSize: 32,
  },
  resultCardButtons: {
    flexDirection: "row",
    gap: spacing.sp3,
    width: "100%",
  },
  returnHomeButtonCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: spacing.sp4,
    alignItems: "center",
  },
  returnHomeButtonText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  rerunButtonCard: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radii.card,
    padding: spacing.sp4,
    alignItems: "center",
  },
  rerunButtonText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
  },
});
