/**
 * Queue Screen
 * Shows user profile, queue status, and list of queued players
 * Handles joining/leaving matchmaking queue AND challenging users directly
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/hooks/useAuth";
import { useElo } from "@/hooks/useElo";
import { useSocket } from "@/hooks/useSocket";
import { useNetwork } from "@/hooks/useNetwork";
import { getServerUrl } from "@/config";
import { formatElo } from "@/utils/formatting";
import { handleError } from "@/utils/errorHandler";
import { theme } from "@/theme";
import type { QueuedPlayer, MatchResult, UserSearchResult, Challenge } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RaceStackParamList } from "@/navigation/AppNavigator";

const { colors, typography, spacing, radii, shadows, components } = theme;

type Props = NativeStackScreenProps<RaceStackParamList, "Queue">;
type MatchMode = "queue" | "challenge";

export default function QueueScreen({ navigation }: Props) {
  const { user, updateUser, token } = useAuth();
  const { elo, refreshElo } = useElo();
  const { socket, isConnected, joinQueue, leaveQueue } = useSocket();
  const { isOnline, isOfflineMode } = useNetwork();
  
  // Queue state
  const [inQueue, setInQueue] = useState(false);
  const [queuedPlayers, setQueuedPlayers] = useState<QueuedPlayer[]>([]);
  
  // Mode selection
  const [mode, setMode] = useState<MatchMode>("queue");
  
  // Challenge state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);

  // Refresh ELO when screen comes into focus (e.g., returning from a race)
  useFocusEffect(
    React.useCallback(() => {
      refreshElo();
    }, [refreshElo])
  );

  useEffect(() => {
    if (!socket) return;

    // Queue events
    const handleQueueJoined = () => setInQueue(true);
    const handleQueueLeft = () => {
      setInQueue(false);
      setQueuedPlayers([]);
    };
    const handleQueueUpdate = (players: QueuedPlayer[]) => setQueuedPlayers(players);

    // Match events
    const handleMatchStart = (data: {
      matchId: number;
      opponent: string;
    }) => {
      setInQueue(false);
      setQueuedPlayers([]);
      navigation.navigate("Race", {
        matchId: data.matchId,
        opponent: { userId: 0, email: data.opponent, elo: 0 }, // Simplified
      });
    };

    const handleMatchEnd = (result: MatchResult) => {
      const myResult = result.players.find((p) => p.userId === user?.id);
      if (myResult) {
        updateUser({ elo: myResult.newElo });
        // Refresh ELO from server to ensure consistency
        refreshElo();
      }
    };

    // Challenge events
    const handleChallengeReceived = (challenge: Challenge) => {
      setIncomingChallenges(prev => {
        // Avoid duplicates
        if (prev.find(c => c.fromId === challenge.fromId)) return prev;
        return [...prev, challenge];
      });
    };

    const handleChallengeSent = (data: { to: string }) => {
      Alert.alert("Challenge Sent", `Challenge sent to ${data.to}`);
    };

    const handleChallengeDeclined = (data: { by: string }) => {
      Alert.alert("Challenge Declined", `${data.by} declined your challenge`);
    };

    const handleChallengeError = (data: { error: string }) => {
      Alert.alert("Challenge Error", data.error);
    };

    // Register listeners
    socket.on("queue_joined", handleQueueJoined);
    socket.on("queue_left", handleQueueLeft);
    socket.on("queue_update", handleQueueUpdate);
    socket.on("match_start", handleMatchStart);
    socket.on("match_end", handleMatchEnd);
    socket.on("challenge_received", handleChallengeReceived);
    socket.on("challenge_sent", handleChallengeSent);
    socket.on("challenge_declined", handleChallengeDeclined);
    socket.on("challenge_error", handleChallengeError);

    return () => {
      socket.off("queue_joined", handleQueueJoined);
      socket.off("queue_left", handleQueueLeft);
      socket.off("queue_update", handleQueueUpdate);
      socket.off("match_start", handleMatchStart);
      socket.off("match_end", handleMatchEnd);
      socket.off("challenge_received", handleChallengeReceived);
      socket.off("challenge_sent", handleChallengeSent);
      socket.off("challenge_declined", handleChallengeDeclined);
      socket.off("challenge_error", handleChallengeError);
    };
  }, [socket, navigation, user, updateUser]);

  const handleJoinQueue = () => joinQueue();
  const handleLeaveQueue = () => leaveQueue();

  const handleSearchUsers = async () => {
    if (searchQuery.length < 2) {
      Alert.alert("Search Error", "Enter at least 2 characters");
      return;
    }

    if (isOfflineMode) {
      Alert.alert("Offline Mode", "Search is not available when offline");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${getServerUrl()}/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        throw new Error(`Search failed with status: ${response.status}`);
      }
    } catch (error) {
      handleError(error, "User search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendChallenge = (targetUsername: string) => {
    if (socket) {
      socket.emit("send_challenge", { targetUsername });
    }
  };

  const handleAcceptChallenge = (fromId: number) => {
    if (socket) {
      socket.emit("accept_challenge", { fromId });
      // Remove from local list
      setIncomingChallenges(prev => prev.filter(c => c.fromId !== fromId));
    }
  };

  const handleDeclineChallenge = (fromId: number) => {
    if (socket) {
      socket.emit("decline_challenge", { fromId });
      // Remove from local list
      setIncomingChallenges(prev => prev.filter(c => c.fromId !== fromId));
    }
  };

  if (!user) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Text style={styles.errorText}>User not loaded</Text>
      </SafeAreaView>
    );
  }

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Text style={styles.title}>Sprint100</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.eloContainer}>
          <Text style={styles.eloLabel}>Elo Rating:</Text>
          <Text style={styles.eloValue}>{formatElo(elo ?? user.elo)}</Text>
        </View>
      </View>

      {/* Connection Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, isConnected && styles.statusDotConnected]} />
        <Text style={styles.statusText}>
          {isConnected ? "Connected" : "Connecting..."}
        </Text>
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelectorContainer}>
        <TouchableOpacity
          style={[styles.modeButton, mode === "queue" && styles.modeButtonActive]}
          onPress={() => setMode("queue")}
        >
          <Text style={[styles.modeButtonText, mode === "queue" && styles.modeButtonTextActive]}>
            Quick Match
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === "challenge" && styles.modeButtonActive]}
          onPress={() => setMode("challenge")}
        >
          <Text style={[styles.modeButtonText, mode === "challenge" && styles.modeButtonTextActive]}>
            Challenge
          </Text>
        </TouchableOpacity>
      </View>

      {/* Queue Mode */}
      {mode === "queue" && (
        <>
          <View style={styles.queueSection}>
            {!inQueue ? (
              <TouchableOpacity
                style={[styles.button, styles.joinButton, (!isConnected || isOfflineMode) && styles.buttonDisabled]}
                onPress={handleJoinQueue}
                disabled={!isConnected || isOfflineMode}
              >
                <Text style={[styles.buttonText, (!isConnected || isOfflineMode) && styles.buttonTextDisabled]}>
                  {isOfflineMode ? "Offline Mode" : "Join Queue"}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.leaveButton]}
                  onPress={handleLeaveQueue}
                >
                  <Text style={styles.buttonText}>Leave Queue</Text>
                </TouchableOpacity>
                <View style={styles.searchingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.searchingText}>Searching for opponent...</Text>
                </View>
              </>
            )}
          </View>

          {inQueue && queuedPlayers.length > 0 && (
            <View style={styles.playersSection}>
              <Text style={styles.sectionTitle}>Players in Queue ({queuedPlayers.length})</Text>
              <FlatList
                data={queuedPlayers}
                keyExtractor={(item) => item.userId.toString()}
                renderItem={({ item }) => (
                  <View style={styles.playerItem}>
                    <Text style={styles.playerEmail}>{item.email}</Text>
                    <Text style={styles.playerElo}>Elo: {formatElo(item.elo)}</Text>
                  </View>
                )}
              />
            </View>
          )}
        </>
      )}

      {/* Challenge Mode */}
      {mode === "challenge" && (
        <View style={styles.challengeSection}>
          {/* Search Box */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username..."
              placeholderTextColor={colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.searchButton, isOfflineMode && styles.buttonDisabled]}
              onPress={handleSearchUsers}
              disabled={isSearching || isOfflineMode}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={[styles.searchButtonText, isOfflineMode && styles.buttonTextDisabled]}>
                  {isOfflineMode ? "Offline" : "Search"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.searchResultItem}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultUsername}>@{item.username}</Text>
                      <Text style={styles.resultElo}>Elo: {formatElo(item.elo)}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.challengeButton, isOfflineMode && styles.buttonDisabled]}
                      onPress={() => handleSendChallenge(item.username)}
                      disabled={isOfflineMode}
                    >
                      <Text style={[styles.challengeButtonText, isOfflineMode && styles.buttonTextDisabled]}>
                        {isOfflineMode ? "Offline" : "Challenge"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          {/* Incoming Challenges */}
          {incomingChallenges.length > 0 && (
            <View style={styles.invitesSection}>
              <Text style={styles.sectionTitle}>Incoming Challenges ({incomingChallenges.length})</Text>
              <FlatList
                data={incomingChallenges}
                keyExtractor={(item) => item.fromId.toString()}
                renderItem={({ item }) => (
                  <View style={styles.inviteItem}>
                    <View style={styles.inviteInfo}>
                      <Text style={styles.inviteUsername}>@{item.from}</Text>
                      <Text style={styles.inviteElo}>Elo: {formatElo(item.fromElo)}</Text>
                    </View>
                    <View style={styles.inviteActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptChallenge(item.fromId)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDeclineChallenge(item.fromId)}
                      >
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileSection: {
    backgroundColor: colors.surface,
    padding: spacing.sp6,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    marginBottom: spacing.sp1,
    color: colors.text,
  },
  username: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.primary,
    marginBottom: spacing.sp1,
  },
  email: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sp2,
  },
  eloContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eloLabel: {
    fontSize: typography.bodyLarge.fontSize,
    color: colors.textSecondary,
    marginRight: spacing.sp2,
  },
  eloValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.primary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sp3,
    backgroundColor: colors.surface,
    marginTop: spacing.sp1,
  },
  statusDot: {
    width: spacing.sp2,
    height: spacing.sp2,
    borderRadius: radii.sm,
    backgroundColor: colors.disabled,
    marginRight: spacing.sp2,
  },
  statusDotConnected: {
    backgroundColor: colors.secondary,
  },
  statusText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  modeSelectorContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    margin: spacing.sp2,
    borderRadius: radii.button,
    padding: spacing.sp1,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sp3,
    alignItems: "center",
    borderRadius: radii.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.textInverse,
  },
  queueSection: {
    padding: spacing.sp6,
    alignItems: "center",
  },
  button: {
    paddingVertical: spacing.sp2,
    paddingHorizontal: spacing.sp12,
    borderRadius: radii.button,
    minWidth: 200,
    alignItems: "center",
    minHeight: components.button.height,
    ...shadows.sm,
  },
  joinButton: {
    backgroundColor: colors.secondary,
  },
  leaveButton: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  searchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sp2,
  },
  searchingText: {
    marginLeft: spacing.sp2,
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  playersSection: {
    flex: 1,
    padding: spacing.sp2,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    marginBottom: spacing.sp3,
    color: colors.text,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.sp3,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    marginBottom: spacing.sp2,
    ...shadows.sm,
  },
  playerEmail: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text,
  },
  playerElo: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
  },
  challengeSection: {
    flex: 1,
    padding: spacing.sp2,
  },
  searchContainer: {
    flexDirection: "row",
    gap: spacing.sp2,
    marginBottom: spacing.sp2,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    padding: spacing.sp3,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text, // White text on dark backgrounds
    minHeight: components.input.height,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingHorizontal: spacing.sp5,
    justifyContent: "center",
    minWidth: 80,
    minHeight: components.button.heightSmall,
  },
  searchButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  resultsSection: {
    marginBottom: spacing.sp2,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.sp3,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    marginBottom: spacing.sp2,
    ...shadows.sm,
  },
  resultInfo: {
    flex: 1,
  },
  resultUsername: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
  },
  resultElo: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  challengeButton: {
    backgroundColor: colors.warning,
    borderRadius: radii.sm,
    paddingVertical: spacing.sp2,
    paddingHorizontal: spacing.sp2,
    minHeight: components.button.heightSmall,
  },
  challengeButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  invitesSection: {
    marginTop: spacing.sp2,
  },
  inviteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.sp3,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    marginBottom: spacing.sp2,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  inviteInfo: {
    flex: 1,
  },
  inviteUsername: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.primary,
  },
  inviteElo: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  inviteActions: {
    flexDirection: "row",
    gap: spacing.sp2,
  },
  acceptButton: {
    backgroundColor: colors.secondary,
    borderRadius: radii.sm,
    paddingVertical: spacing.sp2,
    paddingHorizontal: spacing.sp2,
    minHeight: components.button.heightSmall,
  },
  acceptButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  declineButton: {
    backgroundColor: colors.danger,
    borderRadius: radii.sm,
    paddingVertical: spacing.sp2,
    paddingHorizontal: spacing.sp2,
    minHeight: components.button.heightSmall,
  },
  declineButtonText: {
    color: colors.textInverse,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.sp6,
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
});
