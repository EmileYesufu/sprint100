/**
 * Training Race Screen
 * Portrait offline race with AI opponents
 * Reuses same UI layout and mechanics as online RaceScreen
 * 
 * Portrait mode enforced via app.json: "orientation": "portrait"
 * 
 * TEST: Start a training race, ensure a racer that crosses first keeps first position
 * in leaderboard and final results even after others finish. Repeat with player finishing
 * first and finishing last to verify immutable position assignment.
 * 
 * TEST: Verify top-3 finishers show medals (🥇🥈🥉) and others show "finished" text.
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useTraining } from "@/hooks/useTraining";
import { metersToPct } from "@/utils/formatting";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TrainingStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<TrainingStackParamList, "TrainingRace">;

const { width, height } = Dimensions.get("window");

type CountdownState = "3" | "2" | "1" | "Go" | null;

/**
 * Get medal emoji for finish position
 * Returns medal for top-3, null for others
 */
function getMedalForPosition(position: number | undefined): string | null {
  if (!position) return null;
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return null;
}

/**
 * Get accessibility label for medal position
 */
function getAccessibilityLabel(position: number | undefined): string {
  if (!position) return "";
  if (position === 1) return "First place, gold medal";
  if (position === 2) return "Second place, silver medal";
  if (position === 3) return "Third place, bronze medal";
  return `Position ${position}, finished`;
}

export default function TrainingRaceScreen({ route, navigation }: Props) {
  const { config } = route.params;
  const { raceState, start, tap, result, abort, isLocallyEnded, localEndResult } = useTraining();
  const [countdown, setCountdown] = useState<CountdownState>("3");
  const [raceStarted, setRaceStarted] = useState(false);
  const countdownTimeouts = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Start race on mount with deterministic countdown sequence
    start(config);

    // Deterministic countdown: 3 (700ms) -> 2 (700ms) -> 1 (700ms) -> Go (250ms) -> Start
    const timeout1 = setTimeout(() => setCountdown("2"), 700);
    const timeout2 = setTimeout(() => setCountdown("1"), 1400);
    const timeout3 = setTimeout(() => setCountdown("Go"), 2100);
    const timeout4 = setTimeout(() => {
      setCountdown(null); // Hide overlay completely
      setRaceStarted(true); // Start race only after overlay hidden
    }, 2350);

    countdownTimeouts.current = [timeout1, timeout2, timeout3, timeout4];

    // Cleanup on unmount - abort race and clear all timers
    return () => {
      countdownTimeouts.current.forEach(clearTimeout);
      abort();
    };
  }, []);

  const handleTap = (side: "left" | "right") => {
    // Block taps during countdown overlay or when locally ended (threshold reached)
    if (!raceStarted || countdown !== null || isLocallyEnded) return;
    
    if (raceState.status === "racing") {
      tap(side);
    }
  };

  /**
   * Handle quit button press - show confirmation before aborting
   */
  const handleQuitPress = () => {
    Alert.alert(
      "Quit Race?",
      "Your current run will be aborted and not recorded.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Quit",
          style: "destructive",
          onPress: handleConfirmQuit,
        },
      ]
    );
  };

  /**
   * Confirmed quit - cleanup and navigate home
   */
  const handleConfirmQuit = () => {
    try {
      // Clean up timers & AI runners here
      countdownTimeouts.current.forEach(clearTimeout);
      countdownTimeouts.current = [];
      
      // Abort training race (cleans up animation frames, AI runners, timers)
      abort();
      
      // Navigate back to training setup
      navigation.goBack();
    } catch (error) {
      console.error("Error quitting race:", error);
      Alert.alert("Failed to quit race — try again");
    }
  };

  // Race Seed and Replay functionality removed for Training Mode

  /**
   * Return to TrainingSetupScreen and cleanup all timers/AI runners
   */
  const handleReturnHome = () => {
    countdownTimeouts.current.forEach(clearTimeout);
    abort(); // Cleanup all timers and state
    navigation.goBack();
  };

  // Sort runners: finished by finishPosition (immutable), then unfinished by meters (descending)
  // This ensures positions are stable once assigned at moment of crossing
  const sortedRunners = [...raceState.runners].sort((a, b) => {
    if (a.finishPosition && b.finishPosition) {
      // Both finished: sort by finish position (lower = better)
      return a.finishPosition - b.finishPosition;
    }
    if (a.finishPosition) return -1; // Finished racers come first
    if (b.finishPosition) return 1;
    // Both unfinished: sort by current meters (descending)
    return b.meters - a.meters;
  });

  // Show quit button during countdown or active race (not on results screen)
  const showQuitButton = raceState.status !== "finished" || !result;

  return (
    <View style={styles.container}>
      {/* Quit Button - Top Right (subtle) */}
      {showQuitButton && (
        <TouchableOpacity
          style={styles.quitButton}
          onPress={handleQuitPress}
          accessibilityLabel="Quit race"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.4}
        >
          <Text style={styles.quitButtonText}>✕</Text>
        </TouchableOpacity>
      )}

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.header}>Training Race</Text>
        <Text style={styles.subheader}>
          {config.difficulty} • {config.aiCount} AI • {config.personality}
        </Text>

        <ScrollView style={styles.runnersContainer}>
          {sortedRunners.map((runner, idx) => {
            // Get medal emoji for top-3 finishers
            const medal = getMedalForPosition(runner.finishPosition);
            
            return (
              <View key={runner.id} style={styles.runnerRow}>
                <View style={styles.runnerInfo}>
                  <Text style={[styles.position, runner.isPlayer && styles.playerText]}>
                    #{runner.finishPosition || idx + 1}
                  </Text>
                  <Text style={[styles.runnerName, runner.isPlayer && styles.playerText]}>
                    {runner.name}
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${metersToPct(runner.meters)}%` },
                      runner.isPlayer
                        ? styles.playerProgressBar
                        : styles.aiProgressBar,
                    ]}
                  />
                </View>
                {/* Show medal/finished for completed racers, meters for racing */}
                {runner.finished ? (
                  medal ? (
                    <Text 
                      style={styles.medalText}
                      accessibilityLabel={getAccessibilityLabel(runner.finishPosition)}
                    >
                      {medal}
                    </Text>
                  ) : (
                    <Text 
                      style={styles.finishedText}
                      accessibilityLabel={getAccessibilityLabel(runner.finishPosition)}
                    >
                      finished
                    </Text>
                  )
                ) : (
                  <Text style={styles.metersText}>{Math.round(runner.meters)}m</Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Timer */}
        {raceState.status === "racing" && raceStarted && (
          <Text style={styles.timer}>
            {(raceState.elapsedMs / 1000).toFixed(2)}s
          </Text>
        )}

        {/* Local early finish indicator (training mode: local end is final) */}
        {isLocallyEnded && localEndResult && !result && (
          <Text style={styles.earlyFinishText}>
            Race ended — top {localEndResult.threshold} finished
          </Text>
        )}
      </View>

      {/* Countdown Overlay - Fully unmounts when null */}
      {countdown !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}

      {/* Results Overlay */}
      {raceState.status === "finished" && result && (
        <View style={styles.resultOverlay}>
          <ScrollView contentContainerStyle={styles.resultContent}>
            <Text style={styles.resultTitle}>Race Complete!</Text>

            {result.runners.map((runner) => {
              const medal = getMedalForPosition(runner.position);
              
              return (
                <View key={runner.id} style={styles.resultRow}>
                  {/* Show medal for top-3, numeric position for others */}
                  {medal ? (
                    <Text 
                      style={styles.resultMedal}
                      accessibilityLabel={getAccessibilityLabel(runner.position)}
                    >
                      {medal}
                    </Text>
                  ) : (
                    <Text style={[styles.resultPosition, runner.isPlayer && styles.playerText]}>
                      #{runner.position}
                    </Text>
                  )}
                  <Text style={[styles.resultName, runner.isPlayer && styles.playerText]}>
                    {runner.name}
                  </Text>
                  <Text style={styles.resultTime}>
                    {(runner.finishTime / 1000).toFixed(2)}s
                  </Text>
                  <Text style={styles.resultMeters}>{Math.round(runner.finalMeters)}m</Text>
                </View>
              );
            })}

            <View style={styles.resultButtons}>
              {/* Race Seed and Replay functionality removed for Training Mode */}
              <TouchableOpacity
                style={[styles.resultButton, styles.returnHomeButton]}
                onPress={handleReturnHome}
              >
                <Text style={styles.resultButtonText}>🏠 Return Home</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Tap Buttons - Smaller, positioned at bottom third */}
      {raceState.status === "racing" && !result && raceStarted && (
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
  quitButton: {
    position: "absolute",
    top: 50,
    right: 16,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(60, 60, 60, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  quitButtonText: {
    fontSize: 20,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressSection: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#1C1C1E",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subheader: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 12,
  },
  runnersContainer: {
    maxHeight: 200,
  },
  runnerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  runnerInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  position: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    width: 30,
  },
  runnerName: {
    fontSize: 14,
    color: "#999",
    flex: 1,
  },
  playerText: {
    color: "#34C759",
    fontWeight: "700",
  },
  progressBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: "#2C2C2E",
    borderRadius: 10,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 10,
  },
  playerProgressBar: {
    backgroundColor: "#34C759",
  },
  aiProgressBar: {
    backgroundColor: "#FF3B30",
  },
  metersText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    width: 60,
    textAlign: "right",
  },
  medalText: {
    fontSize: 20,
    width: 60,
    textAlign: "right",
  },
  finishedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFD700",
    width: 60,
    textAlign: "right",
  },
  timer: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
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
  earlyFinishText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
    textAlign: "center",
    marginTop: 8,
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
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  resultContent: {
    padding: 24,
    paddingTop: 60,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultPosition: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    width: 40,
  },
  resultMedal: {
    fontSize: 28,
    width: 40,
    textAlign: "center",
  },
  resultName: {
    flex: 1,
    fontSize: 16,
    color: "#999",
  },
  resultTime: {
    fontSize: 14,
    color: "#fff",
    marginRight: 12,
  },
  resultMeters: {
    fontSize: 14,
    color: "#666",
  },
  resultButtons: {
    marginTop: 24,
    gap: 12,
  },
  resultButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  returnHomeButton: {
    backgroundColor: "#666",
  },
  resultButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
