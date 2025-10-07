/**
 * Settings Screen
 * App settings, logout, and development utilities
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Disconnect socket
          if (socket) {
            socket.disconnect();
          }
          // Clear auth state
          await logout();
        },
      },
    ]);
  };

  const handleResetLocalDB = () => {
    // Placeholder for development utility
    Alert.alert("Reset Local DB", "This feature is not yet implemented");
  };

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "This feature is not yet implemented");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* User Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{user?.id}</Text>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: "#767577", true: "#34C759" }}
            thumbColor="#fff"
          />
        </View>
        <Text style={styles.settingDescription}>
          Enable or disable sound effects during races (placeholder)
        </Text>
      </View>

      {/* Developer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        
        <TouchableOpacity style={styles.devButton} onPress={handleResetLocalDB}>
          <Text style={styles.devButtonText}>Reset Local DB</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.devButton} onPress={handleClearCache}>
          <Text style={styles.devButtonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Build</Text>
          <Text style={styles.value}>1</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sprint100 - Multiplayer Racing Game</Text>
      </View>
    </ScrollView>
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
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  settingDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  devButton: {
    backgroundColor: "#FF9500",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  devButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
});

