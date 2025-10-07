/**
 * Profile Screen
 * Displays user profile information, Elo rating, and match history
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { SERVER_URL } from "@/config";
import { formatElo, formatDate } from "@/utils/formatting";
import type { MatchHistoryEntry } from "@/types";
import { colors, typography, spacing } from "@/theme";

export default function ProfileScreen() {
  const { user, token } = useAuth();
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMatchHistory();
    }
  }, [user]);

  const loadMatchHistory = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual endpoint when server implements it
      const response = await fetch(`${SERVER_URL}/api/matches?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatchHistory(data.matches || []);
      }
    } catch (error) {
      console.error("Error loading match history:", error);
      // Silently fail for now as this endpoint may not exist yet
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not loaded</Text>
      </View>
    );
  }

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        {/* Header shows logged-in username only */}
        <Text style={styles.username}>@{user.username}</Text>
        
        {/* Display Name (non-editable) */}
        {user.displayName && (
          <Text style={styles.displayName}>{user.displayName}</Text>
        )}
        
        <View style={styles.eloContainer}>
          <Text style={styles.eloLabel}>Elo Rating</Text>
          <Text style={styles.eloValue}>{formatElo(user.elo)}</Text>
        </View>
      </View>

      {/* Match History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Match History</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : matchHistory.length === 0 ? (
          <Text style={styles.emptyText}>No matches played yet</Text>
        ) : (
          <FlatList
            data={matchHistory}
            keyExtractor={(item) => item.matchId.toString()}
            renderItem={({ item }) => (
              <View style={styles.matchItem}>
                <View style={styles.matchHeader}>
                  <Text style={[styles.matchResult, item.won ? styles.won : styles.lost]}>
                    {item.won ? "WIN" : "LOSS"}
                  </Text>
                  <Text style={styles.matchElo}>
                    {item.eloDelta > 0 ? "+" : ""}
                    {item.eloDelta} Elo
                  </Text>
                </View>
                <Text style={styles.matchOpponent}>vs {item.opponentEmail}</Text>
                <Text style={styles.matchDetails}>
                  {Math.round(item.finalMeters)}m · {formatDate(item.createdAt)}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  username: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.primary,
    marginBottom: spacing.sp2,
  },
  displayName: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
    color: colors.textSecondary,
    marginBottom: spacing.sp4,
  },
  eloContainer: {
    alignItems: "center",
  },
  eloLabel: {
    fontSize: 16,
    color: "#999",
    marginBottom: 4,
  },
  eloValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007AFF",
  },
  historySection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 32,
  },
  matchItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  matchResult: {
    fontSize: 16,
    fontWeight: "bold",
  },
  won: {
    color: "#34C759",
  },
  lost: {
    color: "#FF3B30",
  },
  matchElo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  matchOpponent: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  matchDetails: {
    fontSize: 12,
    color: "#999",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 24,
  },
});
