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

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTraining } from "@/hooks/useTraining";
import { metersToPct } from "@/utils/formatting";
import { theme } from "@/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TrainingStackParamList } from "@/navigation/AppNavigator";
import type { TrainingRecord } from "@/types";

const { colors, typography, spacing, radii, shadows, components } = theme;

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

/**
 * Get position suffix (1st, 2nd, 3rd, 4th, etc.)
 */
function getPositionSuffix(position: number): string {
  if (position % 100 >= 11 && position % 100 <= 13) {
    return "th";
  }
  switch (position % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export default function TrainingRaceScreen({ route, navigation }: Props) {
  const { config } = route.params;
  const { raceState, start, tap, result, abort, isLocallyEnded, localEndResult, finalPlacings, rerace } = useTraining();
  const [countdown, setCountdown] = useState<CountdownState>("3");
  const [raceStarted, setRaceStarted] = useState(false);
  const [personalBest, setPersonalBest] = useState<TrainingRecord | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState(false);
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
   * Check personal best when result is available
   */
  useEffect(() => {
    if (!result) return;
    
    const checkPersonalBest = async () => {
      try {
        const stored = await AsyncStorage.getItem("@sprint100_training_records");
        const records: TrainingRecord[] = stored ? JSON.parse(stored) : [];
        const key = `${config.difficulty}-${config.aiCount}`;
        const existing = records.find((r) => `${r.difficulty}-${r.aiCount}` === key);
        
        const playerResult = result.runners.find((r) => r.isPlayer);
        if (playerResult) {
          setPersonalBest(existing || null);
          
          // Check if this is a new personal best
          if (!existing || 
              playerResult.position < existing.bestPosition ||
              (playerResult.position === existing.bestPosition && playerResult.finishTime < existing.bestTime)) {
            setIsPersonalBest(true);
          }
        }
      } catch (error) {
        console.error("Error checking personal best:", error);
      }
    };
    
    checkPersonalBest();
  }, [result, config]);

  /**
   * Return to TrainingSetupScreen and cleanup all timers/AI runners
   */
  const handleReturnHome = () => {
    countdownTimeouts.current.forEach(clearTimeout);
    abort(); // Cleanup all timers and state
    navigation.goBack();
  };

  /**
   * Handle rerun - start a new race with same config
   */
  const handleRerun = () => {
    countdownTimeouts.current.forEach(clearTimeout);
    abort(); // Cleanup current race
    setCountdown("3");
    setRaceStarted(false);
    setIsPersonalBest(false);
    setPersonalBest(null);
    // Restart race with same config
    start(config);
    
    // Reset countdown
    const timeout1 = setTimeout(() => setCountdown("2"), 700);
    const timeout2 = setTimeout(() => setCountdown("1"), 1400);
    const timeout3 = setTimeout(() => setCountdown("Go"), 2100);
    const timeout4 = setTimeout(() => {
      setCountdown(null);
      setRaceStarted(true);
    }, 2350);
    
    countdownTimeouts.current = [timeout1, timeout2, timeout3, timeout4];
  };

  // Sort runners: use finalPlacings if available (race ended), otherwise sort by progress
  const sortedRunners = useMemo(() => {
    if (finalPlacings.length > 0) {
      // Race has ended - use finalPlacings order (includes unfinished racers ranked by progress)
      const runnerMap = new Map(raceState.runners.map(r => [r.id, r]));
      return finalPlacings
        .map(id => runnerMap.get(id))
        .filter((r): r is RunnerState => r !== undefined);
    }
    
    // Race still active - sort by current state
    return [...raceState.runners].sort((a, b) => {
      if (a.finishPosition && b.finishPosition) {
        // Both finished: sort by finish position (lower = better)
        return a.finishPosition - b.finishPosition;
      }
      if (a.finishPosition) return -1; // Finished racers come first
      if (b.finishPosition) return 1;
      // Both unfinished: sort by current meters (descending)
      return b.meters - a.meters;
    });
  }, [raceState.runners, finalPlacings]);

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

      {/* Results Overlay - New Template Design */}
      {raceState.status === "finished" && result && (() => {
        const playerResult = result.runners.find((r) => r.isPlayer);
        const totalRacers = result.runners.length;
        const playerPosition = playerResult?.position || 1;
        const playerTime = playerResult?.finishTime ? (playerResult.finishTime / 1000).toFixed(2) : "0.00";
        const raceElapsedTime = (raceState.elapsedMs / 1000).toFixed(2);
        
        return (
          <View style={styles.resultOverlay}>
            {/* Top Section */}
            <View style={styles.topSection}>
              {/* Timer Icon + Time on Left */}
              <View style={styles.timerSection}>
                <Text style={styles.timerIcon}>⏱</Text>
                <Text style={styles.timerText}>{raceElapsedTime}</Text>
              </View>
              
              {/* Position Indicator Centered */}
              <View style={styles.positionIndicator}>
                <Text style={styles.positionText}>{playerPosition}{getPositionSuffix(playerPosition)} / {totalRacers}</Text>
              </View>
              
              {/* Flag Icon on Right */}
              <View style={styles.flagSection}>
                <Text style={styles.flagIcon}>🏁</Text>
              </View>
            </View>

            {/* Progress Bar with Avatars */}
            <View style={styles.progressSectionTop}>
              <View style={styles.progressBarContainerTop}>
                <View style={styles.progressBarTop}>
                  <View style={[styles.progressBarFilled, { width: `${metersToPct(playerResult?.finalMeters || 0)}%` }]} />
                </View>
                {result.runners.map((runner, index) => {
                  const progress = metersToPct(runner.finalMeters);
                  const isPlayer = runner.isPlayer;
                  
                  return (
                    <View 
                      key={runner.id} 
                      style={[
                        styles.avatarMarker,
                        { left: `${Math.min(progress, 98)}%` }, // Cap at 98% to keep avatar visible
                        isPlayer && styles.playerAvatarMarker
                      ]}
                    >
                      <View style={[styles.avatar, isPlayer && styles.playerAvatar]}>
                        <Text style={styles.avatarText}>
                          {isPlayer ? "U" : runner.name.substring(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Middle Section - Dark Blue Background (Race Area) */}
            <View style={styles.middleSection} />

            {/* Bottom Results Card */}
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>Race Finished!</Text>
              
              <View style={styles.resultCardContent}>
                <Text style={styles.resultCardSubtitle}>You finished</Text>
                <Text style={styles.resultCardPosition}>{playerPosition}{getPositionSuffix(playerPosition)}</Text>
                
                <View style={styles.resultCardStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Time</Text>
                    <Text style={styles.statValue}>{playerTime}s</Text>
                  </View>
                  
                  {isPersonalBest && (
                    <View style={styles.statItem}>
                      <View style={styles.personalBestBadge}>
                        <Text style={styles.starIcon}>⭐</Text>
                        <Text style={styles.newBadgeText}>New</Text>
                      </View>
                      <Text style={styles.personalBestText}>Personal Best!</Text>
                    </View>
                  )}
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
    backgroundColor: colors.background,
  },
  quitButton: {
    position: "absolute",
    top: 50,
    right: spacing.sp2,
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
    fontSize: typography.h4.fontSize,
    fontWeight: typography.body.fontWeight,
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressSection: {
    paddingTop: 60,
    paddingHorizontal: spacing.sp2,
    paddingBottom: spacing.sp3,
    backgroundColor: colors.card,
  },
  header: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
    textAlign: "center",
  },
  subheader: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.sp3,
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
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textMuted,
    width: 30,
  },
  runnerName: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textMuted,
    flex: 1,
  },
  playerText: {
    color: colors.secondary,
    fontWeight: typography.h3.fontWeight,
  },
  progressBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: colors.surface,
    borderRadius: radii.base,
    overflow: "hidden",
    marginHorizontal: spacing.sp2,
  },
  progressBar: {
    height: "100%",
    borderRadius: radii.base,
  },
  playerProgressBar: {
    backgroundColor: colors.secondary,
  },
  aiProgressBar: {
    backgroundColor: colors.danger,
  },
  metersText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    width: 60,
    textAlign: "right",
  },
  medalText: {
    fontSize: typography.h4.fontSize,
    width: 60,
    textAlign: "right",
  },
  finishedText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.warning,
    width: 60,
    textAlign: "right",
  },
  timer: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sp2,
  },
  buttonArea: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 80,
    paddingHorizontal: spacing.sp5, // 20px - off 8px grid but matches design
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sp5, // 20px - off 8px grid but matches design
  },
  button: {
    width: width * 0.42,
    height: height * 0.22,
    borderRadius: radii.full,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  leftButton: {
    backgroundColor: "#0051D5", // primaryDark - not in theme.colors, using basePalette value
  },
  rightButton: {
    backgroundColor: "#CC2E24", // dangerDark - not in theme.colors, using basePalette value
  },
  buttonText: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textInverse,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  earlyFinishText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.warning,
    textAlign: "center",
    marginTop: spacing.sp2,
  },
  countdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: typography.hero.fontSize * 2.5, // Large countdown
    fontWeight: typography.hero.fontWeight,
    color: colors.text,
  },
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp5, // 20px - off 8px grid but matches design
    paddingTop: 60,
    paddingBottom: spacing.sp3,
  },
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp2,
  },
  timerIcon: {
    fontSize: typography.h4.fontSize,
    color: colors.text,
  },
  timerText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
  },
  positionIndicator: {
    flex: 1,
    alignItems: "center",
  },
  positionText: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
  },
  flagSection: {
    alignItems: "flex-end",
  },
  flagIcon: {
    fontSize: typography.h4.fontSize,
  },
  progressSectionTop: {
    paddingHorizontal: spacing.sp5, // 20px - off 8px grid but matches design
    paddingBottom: spacing.sp2,
  },
  progressBarContainerTop: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    position: "relative",
    overflow: "visible",
  },
  progressBarTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
  },
  progressBarFilled: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
  },
  avatarMarker: {
    position: "absolute",
    top: -12,
    marginLeft: -spacing.sp2,
    zIndex: 10,
  },
  playerAvatarMarker: {
    zIndex: 11,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  playerAvatar: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  avatarText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
  },
  middleSection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  resultCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.sp6,
    paddingBottom: spacing.sp10,
    ...shadows.lg,
  },
  resultCardTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sp2,
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
    fontWeight: typography.h3.fontWeight,
    color: colors.primary,
    marginBottom: spacing.sp6,
  },
  resultCardStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: spacing.sp8,
    paddingHorizontal: spacing.sp5, // 20px - off 8px grid but matches design
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
  personalBestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sp3,
    paddingVertical: spacing.sp1,
    borderRadius: radii.card,
    marginBottom: spacing.sp1,
    gap: spacing.sp1,
  },
  starIcon: {
    fontSize: typography.bodySmall.fontSize,
  },
  newBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.textInverse,
  },
  personalBestText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textInverse,
    fontWeight: typography.body.fontWeight,
  },
  resultCardButtons: {
    flexDirection: "row",
    gap: spacing.sp3,
    width: "100%",
  },
  returnHomeButtonCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.sp2,
    alignItems: "center",
    minHeight: components.button.height,
    ...shadows.sm,
  },
  returnHomeButtonText: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  rerunButtonCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: spacing.sp2,
    alignItems: "center",
    minHeight: components.button.height,
    ...shadows.base,
  },
  rerunButtonText: {
    color: colors.textInverse,
    fontSize: typography.body.fontSize,
    fontWeight: typography.label.fontWeight,
  },
});
