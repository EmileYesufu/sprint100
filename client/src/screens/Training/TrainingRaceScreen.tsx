/**
 * Training Race Screen
 * Portrait offline race with AI opponents
 * Reuses same UI layout and mechanics as online RaceScreen
 * 
 * Portrait mode enforced via app.json: "orientation": "portrait"
 * Test: Start a training race and confirm: 3 -> 2 -> 1 -> Go -> overlay disappears -> race visible and taps register.
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useTraining } from "@/hooks/useTraining";
import { metersToPct } from "@/utils/formatting";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TrainingStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<TrainingStackParamList, "TrainingRace">;

const { width, height } = Dimensions.get("window");

type CountdownState = "3" | "2" | "1" | "Go" | null;

export default function TrainingRaceScreen({ route, navigation }: Props) {
  const { config } = route.params;
  const { raceState, start, tap, result, replay, rerace, abort, isReplayMode } = useTraining();
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
    // Block taps during countdown overlay
    if (!raceStarted || countdown !== null) return;
    
    if (raceState.status === "racing" && !isReplayMode) {
      tap(side);
    }
  };

  /**
   * Rerace with same config - uses same seed for deterministic behavior
   * IMPORTANT: This passes the exact same seed, so AI will behave identically
   */
  const handleRerace = () => {
    // Clear existing countdown timeouts
    countdownTimeouts.current.forEach(clearTimeout);
    countdownTimeouts.current = [];
    
    // Reset countdown state
    setCountdown("3");
    setRaceStarted(false);
    
    // Start new race with same config (preserves seed)
    rerace();
    
    // Restart countdown sequence
    const timeout1 = setTimeout(() => setCountdown("2"), 700);
    const timeout2 = setTimeout(() => setCountdown("1"), 1400);
    const timeout3 = setTimeout(() => setCountdown("Go"), 2100);
    const timeout4 = setTimeout(() => {
      setCountdown(null);
      setRaceStarted(true);
    }, 2350);
    
    countdownTimeouts.current = [timeout1, timeout2, timeout3, timeout4];
  };

  /**
   * Return to TrainingSetupScreen and cleanup all timers/AI runners
   */
  const handleReturnHome = () => {
    countdownTimeouts.current.forEach(clearTimeout);
    abort(); // Cleanup all timers and state
    navigation.goBack();
  };

  const handleReplay = () => {
    replay();
  };

  // Get player and sort runners by position
  const sortedRunners = [...raceState.runners].sort((a, b) => b.meters - a.meters);

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.header}>Training Race</Text>
        <Text style={styles.subheader}>
          {config.difficulty} • {config.aiCount} AI • {config.personality}
        </Text>

        <ScrollView style={styles.runnersContainer}>
          {sortedRunners.map((runner, idx) => (
            <View key={runner.id} style={styles.runnerRow}>
              <View style={styles.runnerInfo}>
                <Text style={[styles.position, runner.isPlayer && styles.playerText]}>
                  #{idx + 1}
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
              <Text style={styles.metersText}>{Math.round(runner.meters)}m</Text>
            </View>
          ))}
        </ScrollView>

        {/* Timer */}
        {raceState.status === "racing" && raceStarted && (
          <Text style={styles.timer}>
            {(raceState.elapsedMs / 1000).toFixed(2)}s
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

            {result.runners.map((runner) => (
              <View key={runner.id} style={styles.resultRow}>
                <Text style={[styles.resultPosition, runner.isPlayer && styles.playerText]}>
                  #{runner.position}
                </Text>
                <Text style={[styles.resultName, runner.isPlayer && styles.playerText]}>
                  {runner.name}
                </Text>
                <Text style={styles.resultTime}>
                  {(runner.finishTime / 1000).toFixed(2)}s
                </Text>
                <Text style={styles.resultMeters}>{Math.round(runner.finalMeters)}m</Text>
              </View>
            ))}

            <View style={styles.resultButtons}>
              <TouchableOpacity style={styles.resultButton} onPress={handleReplay}>
                <Text style={styles.resultButtonText}>🔁 Replay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultButton, styles.reraceButton]}
                onPress={handleRerace}
              >
                <Text style={styles.resultButtonText}>↻ Rerace (Same Config)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultButton, styles.returnHomeButton]}
                onPress={handleReturnHome}
              >
                <Text style={styles.resultButtonText}>🏠 Return Home</Text>
              </TouchableOpacity>
            </View>

            {isReplayMode && (
              <Text style={styles.replayIndicator}>🎬 REPLAY MODE</Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Tap Buttons - Smaller, positioned at bottom third */}
      {raceState.status === "racing" && !result && raceStarted && (
        <View style={styles.buttonArea}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.leftButton]}
              onPress={() => handleTap("left")}
              activeOpacity={0.7}
              disabled={isReplayMode}
            >
              <Text style={styles.buttonText}>LEFT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rightButton]}
              onPress={() => handleTap("right")}
              activeOpacity={0.7}
              disabled={isReplayMode}
            >
              <Text style={styles.buttonText}>RIGHT</Text>
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
    width: 40,
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
  reraceButton: {
    backgroundColor: "#34C759",
  },
  returnHomeButton: {
    backgroundColor: "#666",
  },
  resultButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  replayIndicator: {
    fontSize: 16,
    color: "#FF9500",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "bold",
  },
});
