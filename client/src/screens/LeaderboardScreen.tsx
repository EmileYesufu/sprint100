/**
 * Leaderboard Screen - Stitch Design
 * Displays top players ranked by Elo rating
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/hooks/useAuth";
import { getServerUrl } from "@/config";
import { formatElo } from "@/utils/formatting";
import { getAvatarInitials, getColorFromString } from "@/utils/uiHelpers";
import type { LeaderboardEntry } from "@/types";
import { colors, typography, spacing, shadows, radii } from "@/theme";

export default function LeaderboardScreen() {
  const { token, user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Fade-in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
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
        // API returns { success: true, data: [...] }
        const entries = data.data || data.leaderboard || [];
        // Transform to include userId if not present
        const formattedEntries: LeaderboardEntry[] = entries.map((entry: any, index: number) => ({
          userId: entry.userId || entry.id || index + 1,
          email: entry.email || entry.username || `player${index + 1}`,
          username: entry.username || entry.email || `Player ${index + 1}`,
          elo: entry.elo || 1000,
          rank: entry.rank || index + 1,
        }));
        setLeaderboard(formattedEntries);
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

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header with back button */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Sprint100 Leaderboard</Text>
          <Text style={styles.subtitle}>Top Racers Worldwide</Text>
        </View>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Leaderboard List */}
      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.userId.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No players on leaderboard yet</Text>
          }
          renderItem={({ item }) => {
            const isCurrentUser = item.userId === user?.id;
            const displayName = (item as any).username || item.email || "Unknown";
            const avatarInitials = getAvatarInitials(displayName);
            const avatarColor = getColorFromString(displayName);
            
            return (
              <View
                style={[
                  styles.playerRow,
                  isCurrentUser && styles.currentUserRow,
                ]}
              >
                {/* Left accent bar for current user */}
                {isCurrentUser && <View style={styles.accentBar} />}
                
                {/* Rank number on left */}
                <View style={styles.rankContainer}>
                  <Text style={[styles.rankNumber, isCurrentUser && styles.currentUserRank]}>
                    {item.rank}
                  </Text>
                </View>
                
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>{avatarInitials}</Text>
                  </View>
                </View>
                
                {/* Username and ELO */}
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerUsername, isCurrentUser && styles.currentUserText]}>
                    {isCurrentUser ? "You" : displayName}
                  </Text>
                  <Text style={[styles.playerElo, isCurrentUser && styles.currentUserText]}>
                    ELO: {formatElo(item.elo)}
                  </Text>
                </View>
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
    backgroundColor: colors.background, // Dark background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sp6,
    paddingTop: spacing.sp4,
    paddingBottom: spacing.sp6,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: "bold",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 40, // Match back button width for centering
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.bodySmall.fontWeight,
    color: colors.textSecondary,
    textAlign: "center",
  },
  loader: {
    marginTop: spacing.sp8,
  },
  listContainer: {
    paddingHorizontal: spacing.sp6,
    paddingBottom: spacing.sp8,
    paddingTop: spacing.sp2,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sp8,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingVertical: spacing.sp4,
    paddingHorizontal: spacing.sp4,
    borderRadius: radii.card,
    marginBottom: spacing.sp2,
    minHeight: 72,
    position: "relative",
  },
  currentUserRow: {
    backgroundColor: "#1C2A3A", // Dark blue highlight
    borderLeftWidth: 4,
    borderLeftColor: colors.accent, // Electric blue accent bar
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accent,
    borderTopLeftRadius: radii.card,
    borderBottomLeftRadius: radii.card,
  },
  rankContainer: {
    width: 40,
    alignItems: "flex-start",
    marginRight: spacing.sp3,
  },
  rankNumber: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
  },
  currentUserRank: {
    color: colors.accent, // Blue for current user
  },
  avatarContainer: {
    marginRight: spacing.sp4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  playerInfo: {
    flex: 1,
    marginRight: spacing.sp4,
  },
  playerUsername: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp1,
  },
  playerElo: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.accent, // Electric blue for ELO
  },
  currentUserText: {
    fontWeight: typography.button.fontWeight,
    color: colors.text,
  },
});

