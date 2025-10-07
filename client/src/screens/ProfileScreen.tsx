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
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { SERVER_URL } from "@/config";
import { formatElo, formatDate } from "@/utils/formatting";
import type { MatchHistoryEntry } from "@/types";

export default function ProfileScreen() {
  const { user, token } = useAuth();
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");

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

  const handleSaveDisplayName = () => {
    // TODO: Implement display name update endpoint
    console.log("Save display name:", displayName);
    setEditingName(false);
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
      {/* Profile Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        
        {/* Display Name */}
        <View style={styles.nameContainer}>
          {editingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display name"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveDisplayName}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditingName(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={styles.displayName}>
                {user.displayName || "Tap to add display name"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.email}>{user.email}</Text>
        
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
    </View>
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
    marginBottom: 16,
    color: "#333",
  },
  nameContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  editNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  displayName: {
    fontSize: 18,
    color: "#007AFF",
    fontStyle: "italic",
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#999",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
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

