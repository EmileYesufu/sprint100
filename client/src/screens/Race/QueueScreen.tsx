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
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { getServerUrl } from "@/config";
import { formatElo } from "@/utils/formatting";
import type { QueuedPlayer, MatchResult, UserSearchResult, Challenge } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RaceStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<RaceStackParamList, "Queue">;
type MatchMode = "queue" | "challenge";

export default function QueueScreen({ navigation }: Props) {
  const { user, updateUser, token } = useAuth();
  const { socket, isConnected, joinQueue, leaveQueue } = useSocket();
  
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
        Alert.alert("Search Failed", "Could not search users");
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Search Failed", "Could not search users");
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
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>User not loaded</Text>
      </SafeAreaView>
    );
  }

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Text style={styles.title}>Sprint100</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.eloContainer}>
          <Text style={styles.eloLabel}>Elo Rating:</Text>
          <Text style={styles.eloValue}>{formatElo(user.elo)}</Text>
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
                style={[styles.button, styles.joinButton, !isConnected && styles.buttonDisabled]}
                onPress={handleJoinQueue}
                disabled={!isConnected}
              >
                <Text style={styles.buttonText}>Join Queue</Text>
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
                  <ActivityIndicator size="small" color="#007AFF" />
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
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchUsers}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
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
                      style={styles.challengeButton}
                      onPress={() => handleSendChallenge(item.username)}
                    >
                      <Text style={styles.challengeButtonText}>Challenge</Text>
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
    backgroundColor: "#f5f5f5",
  },
  profileSection: {
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
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  eloContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eloLabel: {
    fontSize: 18,
    color: "#666",
    marginRight: 8,
  },
  eloValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#fff",
    marginTop: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999",
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: "#34C759",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
  },
  modeSelectorContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: "#007AFF",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  queueSection: {
    padding: 24,
    alignItems: "center",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  joinButton: {
    backgroundColor: "#34C759",
  },
  leaveButton: {
    backgroundColor: "#FF3B30",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  searchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  playersSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  playerEmail: {
    fontSize: 14,
    color: "#333",
  },
  playerElo: {
    fontSize: 14,
    color: "#666",
  },
  challengeSection: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  resultsSection: {
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  resultInfo: {
    flex: 1,
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  resultElo: {
    fontSize: 12,
    color: "#666",
  },
  challengeButton: {
    backgroundColor: "#FF9500",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  challengeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  invitesSection: {
    marginTop: 16,
  },
  inviteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  inviteInfo: {
    flex: 1,
  },
  inviteUsername: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  inviteElo: {
    fontSize: 12,
    color: "#666",
  },
  inviteActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    backgroundColor: "#34C759",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  declineButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 24,
  },
});
