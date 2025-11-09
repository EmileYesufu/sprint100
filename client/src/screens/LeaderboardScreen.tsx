/**
 * Leaderboard Screen - Stitch Design
 * Displays top players ranked by Elo rating
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useElo } from "@/hooks/useElo";
import { getServerUrl } from "@/config";
import { formatElo } from "@/utils/formatting";
import { getAvatarInitials, getColorFromString } from "@/utils/uiHelpers";
import type { LeaderboardEntry } from "@/types";
import { colors, typography, spacing, shadows, radii, accessibility } from "@/theme";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function LeaderboardScreen() {
  const { token, user } = useAuth();
  const { elo } = useElo();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Refresh leaderboard when user ELO changes (e.g., after a race)
  useEffect(() => {
    if (elo !== null) {
      loadLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elo]);

  // Fade-in animation on mount (skip if reduce motion enabled)
  useEffect(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [reduceMotion]);

  const loadLeaderboard = useCallback(async (options?: { refresh?: boolean; cursor?: number | null }) => {
    if (!token || (isLoading && !options?.refresh)) return;

    const isRefresh = Boolean(options?.refresh);
    const nextCursor = options?.cursor ?? (isRefresh ? null : cursor);

    if (isRefresh) {
      setIsRefreshing(true);
      setHasMore(true);
      setCursor(null);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (nextCursor) {
        params.set("cursor", String(nextCursor));
      }
      params.set("limit", "20");

      const response = await fetch(`${getServerUrl()}/api/leaderboard?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load leaderboard (${response.status})`);
      }

      const data = await response.json();
      const entries = data.data || data.leaderboard || [];
      const endCursor = data.nextCursor ?? null;

      const formattedEntries: LeaderboardEntry[] = entries.map((entry: any, index: number) => ({
        userId: entry.userId || entry.id || index + 1,
        email: entry.email || entry.username || `player${index + 1}`,
        username: entry.username || entry.email || `Player ${index + 1}`,
        elo: entry.elo ?? 1000,
        rank: entry.rank ?? index + 1,
      }));

      setLeaderboard((prev) => (isRefresh ? formattedEntries : [...prev, ...formattedEntries]));
      setCursor(endCursor);
      setHasMore(Boolean(endCursor));
      setError(null);
    } catch (err: any) {
      console.error("Error loading leaderboard:", err);
      setError(err.message || "Unable to load leaderboard.");
      if (isRefresh) {
        setLeaderboard([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, cursor, isLoading]);

  const handleRefresh = () => {
    loadLeaderboard({ refresh: true });
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadLeaderboard({ cursor });
    }
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
          accessibilityLabel="Back"
          accessibilityHint="Returns to previous screen"
          accessibilityRole="button"
          hitSlop={accessibility.hitSlop}
        >
          <Text 
            style={styles.backIcon}
            allowFontScaling={accessibility.allowFontScaling}
          >
            ←
          </Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text 
            style={styles.title}
            allowFontScaling={accessibility.allowFontScaling}
          >
            Sprint100 Leaderboard
          </Text>
          <Text 
            style={styles.subtitle}
            allowFontScaling={accessibility.allowFontScaling}
          >
            Top Racers Worldwide
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Leaderboard List */}
      {isLoading && leaderboard.length === 0 ? (
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && leaderboard.length > 0 ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {error ? (
                <>
                  <Text style={styles.emptyTitle}>Unable to load leaderboard</Text>
                  <Text style={styles.emptySubtitle}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => loadLeaderboard({ refresh: true })}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.emptyText}>No players on leaderboard yet.</Text>
              )}
            </View>
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
                accessibilityRole="text"
                accessibilityLabel={`Rank ${item.rank}, ${isCurrentUser ? 'You' : displayName}, ELO ${formatElo(item.elo).replace(/,/g, ' ')}`}
              >
                {/* Left accent bar for current user */}
                {isCurrentUser && <View style={styles.accentBar} />}
                
                {/* Rank number on left */}
                <View style={styles.rankContainer}>
                  <Text 
                    style={[styles.rankNumber, isCurrentUser && styles.currentUserRank]}
                    allowFontScaling={accessibility.allowFontScaling}
                  >
                    {item.rank}
                  </Text>
                </View>
                
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text 
                      style={styles.avatarText}
                      allowFontScaling={accessibility.allowFontScaling}
                    >
                      {avatarInitials}
                    </Text>
                  </View>
                </View>
                
                {/* Username and ELO */}
                <View style={styles.playerInfo}>
                  <Text 
                    style={[styles.playerUsername, isCurrentUser && styles.currentUserText]}
                    allowFontScaling={accessibility.allowFontScaling}
                  >
                    {isCurrentUser ? "You" : displayName}
                  </Text>
                  <Text 
                    style={[styles.playerElo, isCurrentUser && styles.currentUserText]}
                    allowFontScaling={accessibility.allowFontScaling}
                  >
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
  footer: {
    paddingVertical: spacing.sp4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.sp8,
    gap: spacing.sp3,
  },
  emptyTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.sp6,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sp4,
    paddingVertical: spacing.sp2,
    borderRadius: radii.button,
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
  },
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

