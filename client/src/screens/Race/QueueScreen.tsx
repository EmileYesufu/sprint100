/**
 * Queue Screen
 * Shows user profile, queue status, and list of queued players
 * Handles joining/leaving matchmaking queue
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { formatElo } from "@/utils/formatting";
import type { QueuedPlayer, MatchResult } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RaceStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<RaceStackParamList, "Queue">;

export default function QueueScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const { socket, isConnected, joinQueue, leaveQueue } = useSocket();
  const [inQueue, setInQueue] = useState(false);
  const [queuedPlayers, setQueuedPlayers] = useState<QueuedPlayer[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleQueueJoined = () => {
      setInQueue(true);
    };

    const handleQueueLeft = () => {
      setInQueue(false);
      setQueuedPlayers([]);
    };

    const handleQueueUpdate = (players: QueuedPlayer[]) => {
      setQueuedPlayers(players);
    };

    const handleMatchStart = (data: {
      matchId: number;
      opponent: { userId: number; email: string; elo: number };
    }) => {
      setInQueue(false);
      setQueuedPlayers([]);
      // Navigate to race screen
      navigation.navigate("Race", {
        matchId: data.matchId,
        opponent: data.opponent,
      });
    };

    const handleMatchEnd = (result: MatchResult) => {
      // Update user's Elo based on match result
      const myResult = result.players.find((p) => p.userId === user?.id);
      if (myResult) {
        updateUser({ elo: myResult.newElo });
      }
    };

    socket.on("queue_joined", handleQueueJoined);
    socket.on("queue_left", handleQueueLeft);
    socket.on("queue_update", handleQueueUpdate);
    socket.on("match_start", handleMatchStart);
    socket.on("match_end", handleMatchEnd);

    return () => {
      socket.off("queue_joined", handleQueueJoined);
      socket.off("queue_left", handleQueueLeft);
      socket.off("queue_update", handleQueueUpdate);
      socket.off("match_start", handleMatchStart);
      socket.off("match_end", handleMatchEnd);
    };
  }, [socket, navigation, user, updateUser]);

  const handleJoinQueue = () => {
    joinQueue();
  };

  const handleLeaveQueue = () => {
    leaveQueue();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not loaded</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Text style={styles.title}>Sprint100</Text>
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

      {/* Queue Controls */}
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

      {/* Queued Players List */}
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
    </View>
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
    marginBottom: 8,
    color: "#333",
  },
  email: {
    fontSize: 16,
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
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 24,
  },
});

