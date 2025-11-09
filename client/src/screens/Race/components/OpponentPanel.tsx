import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { getAvatarInitials, getColorFromString } from "@/utils/uiHelpers";

export interface RaceOpponentSnapshot {
  userId: number;
  email: string;
  meters: number;
  steps: number;
  position: number;
  isPlayer: boolean;
}

interface OpponentPanelProps {
  players: RaceOpponentSnapshot[];
  currentUserId?: number;
  style?: ViewStyle;
}

export function OpponentPanelComponent({ players, currentUserId, style }: OpponentPanelProps) {
  if (!players.length) {
    return null;
  }

  return (
    <View
      style={[styles.panel, style]}
      accessibilityRole="summary"
      accessibilityLabel="Race positions"
    >
      <Text style={styles.title}>Race Positions</Text>
      <View style={styles.list}>
        {players.map((player) => {
          const initials = getAvatarInitials(player.email);
          const color = getColorFromString(player.email);
          const progress = Math.min(100, Math.round(player.meters));
          const isCurrent = player.userId === currentUserId;
          return (
            <View
              key={player.userId}
              style={[styles.row, isCurrent && styles.rowCurrent]}
              accessibilityRole="text"
              accessibilityLabel={`${isCurrent ? "You" : player.email}, position ${player.position}, ${progress} meters`}
            >
              <View
                style={[styles.avatar, { backgroundColor: color }]}
                accessibilityLabel={`Avatar for ${isCurrent ? "you" : player.email}`}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.rowHeader}>
                  <Text style={[styles.name, isCurrent && styles.nameCurrent]} numberOfLines={1}>
                    {isCurrent ? "You" : player.email}
                  </Text>
                  <Text style={styles.position}>
                    {player.position}
                    {getPositionSuffix(player.position)}
                  </Text>
                </View>
                <View
                  style={styles.progressBar}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: progress }}
                >
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export const OpponentPanel = React.memo(OpponentPanelComponent);

function getPositionSuffix(position: number): string {
  if (position % 100 >= 11 && position % 100 <= 13) return "th";
  switch (position % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    backgroundColor: "rgba(15, 25, 45, 0.85)",
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 12,
    color: "#A0AEC0",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(10, 18, 32, 0.9)",
  },
  rowCurrent: {
    borderWidth: 1,
    borderColor: "#00E0FF",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: "#E2E8F0",
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  nameCurrent: {
    fontWeight: "bold",
    color: "#00E0FF",
  },
  position: {
    color: "#A0AEC0",
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00E0FF",
  },
});
