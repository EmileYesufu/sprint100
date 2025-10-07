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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generateSeed } from "@/utils/seededRandom";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { TrainingStackParamList } from "@/navigation/AppNavigator";
import type { AIDifficulty, AIPersonality } from "@/types";

type Props = NativeStackScreenProps<TrainingStackParamList, "TrainingSetup">;

export default function TrainingSetupScreen({ navigation }: Props) {
  const [aiCount, setAiCount] = useState<1 | 3 | 7>(3);
  const [difficulty, setDifficulty] = useState<AIDifficulty>("Medium");
  const [personality, setPersonality] = useState<AIPersonality>("Consistent");
  const [seed, setSeed] = useState<string>(generateSeed().toString());

  const handleStart = () => {
    const config = {
      aiCount,
      difficulty,
      personality,
      seed: parseInt(seed, 10) || generateSeed(),
    };

    navigation.navigate("TrainingRace", { config });
  };

  const handleRandomSeed = () => {
    setSeed(generateSeed().toString());
  };

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }} edges={["top"]}>
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

        {/* Seed Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Race Seed (for replay)</Text>
          <View style={styles.seedRow}>
            <TextInput
              style={styles.seedInput}
              value={seed}
              onChangeText={setSeed}
              keyboardType="number-pad"
              placeholder="Random seed"
            />
            <TouchableOpacity style={styles.randomButton} onPress={handleRandomSeed}>
              <Text style={styles.randomButtonText}>🎲 Random</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            Same seed = same race outcome (reproducible)
          </Text>
        </View>

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
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  optionButtonTextActive: {
    color: "#fff",
  },
  helpText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
  seedRow: {
    flexDirection: "row",
    gap: 8,
  },
  seedInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  randomButton: {
    backgroundColor: "#FF9500",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  randomButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: "#1976D2",
  },
});

