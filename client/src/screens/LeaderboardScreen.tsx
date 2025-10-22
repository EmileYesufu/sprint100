/**
 * Leaderboard Screen
 * Displays top players ranked by Elo rating
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { getServerUrl } from "@/config";
import { formatElo } from "@/utils/formatting";
import type { LeaderboardEntry } from "@/types";

export default function LeaderboardScreen() {
  const { token, user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async (isRefresh = false) => {
    if (!token) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // TODO: Replace with actual endpoint when server implements it
      const response = await fetch(`${getServerUrl()}/api/leaderboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      // Set placeholder data for development
      setLeaderboard([
        { userId: 1, email: "player1@example.com", elo: 1500, rank: 1 },
        { userId: 2, email: "player2@example.com", elo: 1450, rank: 2 },
        { userId: 3, email: "player3@example.com", elo: 1400, rank: 3 },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadLeaderboard(true);
  };

  const renderRankBadge = (rank: number) => {
    let badgeStyle = styles.rankBadge;
    let badgeText = rank.toString();

    if (rank === 1) {
      badgeStyle = [styles.rankBadge, styles.goldBadge];
      badgeText = "🥇";
    } else if (rank === 2) {
      badgeStyle = [styles.rankBadge, styles.silverBadge];
      badgeText = "🥈";
    } else if (rank === 3) {
      badgeStyle = [styles.rankBadge, styles.bronzeBadge];
      badgeText = "🥉";
    }

    return (
      <View style={badgeStyle}>
        <Text style={styles.rankText}>{badgeText}</Text>
      </View>
    );
  };

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top Players by Elo</Text>
      </View>

      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No players on leaderboard yet</Text>
          }
          renderItem={({ item }) => {
            const isCurrentUser = item.userId === user?.id;
            return (
              <View style={[styles.playerItem, isCurrentUser && styles.currentUserItem]}>
                {renderRankBadge(item.rank)}
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerEmail, isCurrentUser && styles.currentUserText]}>
                    {item.email}
                    {isCurrentUser && " (You)"}
                  </Text>
                </View>
                <Text style={[styles.playerElo, isCurrentUser && styles.currentUserText]}>
                  {formatElo(item.elo)}
                </Text>
              </View>
            );
          }}
        />
      )}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  loader: {
    marginTop: 32,
  },
  listContainer: {
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 32,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentUserItem: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  goldBadge: {
    backgroundColor: "#FFD700",
  },
  silverBadge: {
    backgroundColor: "#C0C0C0",
  },
  bronzeBadge: {
    backgroundColor: "#CD7F32",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  playerInfo: {
    flex: 1,
  },
  playerEmail: {
    fontSize: 16,
    color: "#333",
  },
  playerElo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  currentUserText: {
    fontWeight: "bold",
  },
});

