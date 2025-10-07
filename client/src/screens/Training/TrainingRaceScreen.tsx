/**
 * Training Race Screen
 * Full-screen portrait offline race with AI opponents
 * Reuses same UI layout and mechanics as online RaceScreen
 * 
 * Portrait mode enforced via app.json: "orientation": "portrait"
 */

import React, { useEffect, useState } from "react";
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

const { width } = Dimensions.get("window");

export default function TrainingRaceScreen({ route, navigation }: Props) {
  const { config } = route.params;
  const { raceState, start, tap, result, replay, isReplayMode } = useTraining();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Start race on mount
    start(config);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (raceState.status === "countdown") {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [raceState.status]);

  const handleTap = (side: "left" | "right") => {
    if (raceState.status === "racing" && !isReplayMode) {
      tap(side);
    }
  };

  const handleRematch = () => {
    start(config);
    setCountdown(null);
  };

  const handleBackToSetup = () => {
    navigation.goBack();
  };

  const handleReplay = () => {
    replay();
  };

  // Get player and sort runners by position
  const player = raceState.runners.find((r) => r.isPlayer);
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
        {raceState.status === "racing" && (
          <Text style={styles.timer}>
            {(raceState.elapsedMs / 1000).toFixed(2)}s
          </Text>
        )}
      </View>

      {/* Countdown Overlay */}
      {countdown !== null && countdown > 0 && (
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
                style={[styles.resultButton, styles.rematchButton]}
                onPress={handleRematch}
              >
                <Text style={styles.resultButtonText}>↻ Rematch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultButton, styles.backButton]}
                onPress={handleBackToSetup}
              >
                <Text style={styles.resultButtonText}>← Setup</Text>
              </TouchableOpacity>
            </View>

            {isReplayMode && (
              <Text style={styles.replayIndicator}>🎬 REPLAY MODE</Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Touch Zones */}
      {raceState.status === "racing" && !result && (
        <View style={styles.touchZonesContainer}>
          <TouchableOpacity
            style={[styles.touchZone, styles.leftZone]}
            onPress={() => handleTap("left")}
            activeOpacity={0.6}
            disabled={isReplayMode}
          >
            <Text style={styles.zoneText}>LEFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.touchZone, styles.rightZone]}
            onPress={() => handleTap("right")}
            activeOpacity={0.6}
            disabled={isReplayMode}
          >
            <Text style={styles.zoneText}>RIGHT</Text>
          </TouchableOpacity>
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
  touchZonesContainer: {
    flex: 1,
    flexDirection: "row",
  },
  touchZone: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  leftZone: {
    backgroundColor: "#1E3A8A",
  },
  rightZone: {
    backgroundColor: "#7C2D12",
  },
  zoneText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
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
  rematchButton: {
    backgroundColor: "#34C759",
  },
  backButton: {
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

