/**
 * Training Setup Screen
 * Configure offline/training race parameters
 * 
 * Portrait mode enforced via app.json: "orientation": "portrait"
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TrainingStackParamList } from "@/navigation/AppNavigator";
import type { AIDifficulty, AIPersonality } from "@/types";

const { colors, typography, spacing, radii, shadows, components } = theme;

type Props = NativeStackScreenProps<TrainingStackParamList, "TrainingSetup">;

export default function TrainingSetupScreen({ navigation }: Props) {
  const [aiCount, setAiCount] = useState<1 | 3 | 7>(3);
  const [difficulty, setDifficulty] = useState<AIDifficulty>("Medium");
  const [personality, setPersonality] = useState<AIPersonality>("Consistent");

  const handleStart = () => {
    const config = {
      aiCount,
      difficulty,
      personality,
      seed: Date.now(), // Generate fresh seed each time
    };

    navigation.navigate("TrainingRace", { config });
  };

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
      <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Training Mode</Text>
        <Text style={styles.subtitle}>Configure your offline training race</Text>

        {/* AI Count Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of AI Opponents</Text>
          <View style={styles.buttonRow}>
            {[1, 3, 7].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.optionButton,
                  aiCount === count && styles.optionButtonActive,
                ]}
                onPress={() => setAiCount(count as 1 | 3 | 7)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    aiCount === count && styles.optionButtonTextActive,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={styles.buttonRow}>
            {(["Easy", "Medium", "Hard"] as AIDifficulty[]).map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.optionButton,
                  difficulty === diff && styles.optionButtonActive,
                ]}
                onPress={() => setDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    difficulty === diff && styles.optionButtonTextActive,
                  ]}
                >
                  {diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>
            {difficulty === "Easy" && "Slower pace, more mistakes"}
            {difficulty === "Medium" && "Balanced challenge"}
            {difficulty === "Hard" && "Fast pace, minimal mistakes"}
          </Text>
        </View>

        {/* Personality Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Personality</Text>
          <View style={styles.buttonRow}>
            {(["Consistent", "Erratic", "Aggressive"] as AIPersonality[]).map((pers) => (
              <TouchableOpacity
                key={pers}
                style={[
                  styles.optionButton,
                  personality === pers && styles.optionButtonActive,
                ]}
                onPress={() => setPersonality(pers)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    personality === pers && styles.optionButtonTextActive,
                  ]}
                >
                  {pers}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>
            {personality === "Consistent" && "Steady and predictable"}
            {personality === "Erratic" && "Unpredictable performance"}
            {personality === "Aggressive" && "Strong finishing sprint"}
          </Text>
        </View>

        {/* Race Seed and Replay functionality removed for Training Mode */}

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start Training Race</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Training mode is offline only. No ELO changes or server interaction.
          </Text>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.sp5, // 20px - off 8px grid but matches design
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp1,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sp6,
  },
  section: {
    marginBottom: spacing.sp6,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp3,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sp2,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.sp3,
    paddingHorizontal: spacing.sp2,
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    minHeight: components.button.heightSmall,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textSecondary,
  },
  optionButtonTextActive: {
    color: colors.textInverse,
  },
  helpText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.sp2,
    fontStyle: "italic",
  },
  startButton: {
    backgroundColor: colors.secondary,
    borderRadius: radii.card,
    padding: spacing.sp4,
    alignItems: "center",
    marginTop: spacing.sp2,
    minHeight: components.button.height,
    ...shadows.base,
  },
  startButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
  infoBox: {
    backgroundColor: colors.card,
    borderRadius: radii.button,
    padding: spacing.sp3,
    marginTop: spacing.sp2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    fontSize: typography.caption.fontSize,
    color: colors.primary,
  },
});
