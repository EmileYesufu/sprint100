/**
 * Profile Screen - Stitch Design
 * Displays user profile information, Elo rating, and match history
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { getServerUrl } from "@/config";
import { formatElo, formatDate } from "@/utils/formatting";
import { getPositionSuffix, getMedalForPosition, getAvatarInitials, getColorFromString } from "@/utils/uiHelpers";
import type { MatchHistoryEntry } from "@/types";
import { colors, typography, spacing, shadows, radii } from "@/theme";

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      loadMatchHistory();
    }
  }, [user]);

  // Fade-in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMatchHistory = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${getServerUrl()}/api/users/${user.id}/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const matches = await response.json();
        // Transform server response to MatchHistoryEntry format with placement
        const formattedMatches: MatchHistoryEntry[] = matches.map((match: any) => {
          // Get placement (1st, 2nd, 3rd, etc.)
          const placement = match.placement || null;
          // Determine if user won (placement 1 means first place)
          const won = placement === 1;
          // Get first opponent for display (multiplayer races have multiple opponents)
          const opponent = match.opponents && match.opponents.length > 0 
            ? match.opponents[0] 
            : { username: 'Unknown', elo: 0 };
          
          return {
            matchId: match.matchId,
            opponentEmail: opponent.username || opponent.email || 'Unknown',
            won: won,
            eloDelta: match.eloDelta || 0,
            finalMeters: 100, // Standard race distance (server doesn't return this)
            createdAt: match.timestamp || new Date().toISOString(),
            placement: placement, // Add placement for display
          };
        });
        setMatchHistory(formattedMatches);
      } else {
        console.error("Failed to load match history:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error loading match history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not loaded</Text>
      </View>
    );
  }

  const displayUsername = user.username || "Loading...";
  const avatarInitials = getAvatarInitials(displayUsername);
  const avatarColor = getColorFromString(displayUsername);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Profile Header with Dark Background */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { borderColor: "#E8D5C4" }]}>
            <View style={[styles.avatarInner, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{avatarInitials}</Text>
            </View>
          </View>
        </View>
        
        {/* Username */}
        <Text style={styles.username}>{displayUsername}</Text>
        
        {/* ELO Rating */}
        <Text style={styles.eloRating}>ELO {formatElo(user.elo)}</Text>
      </Animated.View>

      {/* Match History Section */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Match History</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
        ) : matchHistory.length === 0 ? (
          <Text style={styles.emptyText}>No matches played yet</Text>
        ) : (
          <FlatList
            data={matchHistory}
            keyExtractor={(item) => item.matchId.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item, index }) => {
              const placement = (item as any).placement as number | null;
              const medal = placement ? getMedalForPosition(placement) : null;
              const positionText = placement ? `${placement}${getPositionSuffix(placement)} Place` : "N/A";
              const opponentInitials = getAvatarInitials(item.opponentEmail);
              const opponentColor = getColorFromString(item.opponentEmail);
              
              return (
                <View style={[styles.matchCard, shadows.base]}>
                  {/* Avatar on left */}
                  <View style={styles.matchAvatarContainer}>
                    <View style={[styles.matchAvatar, { backgroundColor: opponentColor }]}>
                      <Text style={styles.matchAvatarText}>{opponentInitials}</Text>
                    </View>
                  </View>
                  
                  {/* Match Info */}
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchOpponent}>vs {item.opponentEmail}</Text>
                    <Text style={styles.matchResult}>{positionText}</Text>
                  </View>
                  
                  {/* ELO Change and Medal on right */}
                  <View style={styles.matchRight}>
                    <Text style={[
                      styles.matchElo,
                      item.eloDelta > 0 ? styles.eloPositive : styles.eloNegative
                    ]}>
                      {item.eloDelta > 0 ? "+" : ""}{item.eloDelta}
                    </Text>
                    {medal && (
                      <Text style={styles.matchMedal}>{medal}</Text>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Dark background
  },
  header: {
    backgroundColor: colors.background, // Dark gradient base
    paddingTop: spacing.sp6,
    paddingBottom: spacing.sp6,
    paddingHorizontal: spacing.sp6,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: spacing.sp4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#E8D5C4", // Light pinkish-beige border
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
  },
  username: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp2,
    textAlign: "center",
  },
  eloRating: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.textSecondary,
    textAlign: "center",
  },
  historySection: {
    flex: 1,
    paddingHorizontal: spacing.sp6,
    paddingTop: spacing.sp4,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp4,
  },
  listContainer: {
    paddingBottom: spacing.sp6,
  },
  loader: {
    marginTop: spacing.sp8,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sp8,
  },
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: spacing.sp4,
    borderRadius: radii.card,
    marginBottom: spacing.sp2,
    ...shadows.base,
  },
  matchAvatarContainer: {
    marginRight: spacing.sp4,
  },
  matchAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  matchAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  matchInfo: {
    flex: 1,
    marginRight: spacing.sp2,
  },
  matchOpponent: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp1,
  },
  matchResult: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  matchRight: {
    alignItems: "flex-end",
  },
  matchElo: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
    marginBottom: spacing.sp1,
  },
  eloPositive: {
    color: colors.success, // Green for positive
  },
  eloNegative: {
    color: colors.danger, // Red for negative
  },
  matchMedal: {
    fontSize: 24,
  },
  footer: {
    paddingHorizontal: spacing.sp6,
    paddingBottom: spacing.sp8,
    paddingTop: spacing.sp4,
    alignItems: "center",
  },
  logoutButton: {
    paddingHorizontal: spacing.sp8,
    paddingVertical: spacing.sp3,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  logoutText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.sp6,
  },
});
