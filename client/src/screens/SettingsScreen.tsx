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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { theme } from "@/theme";
const { colors, typography, spacing, radii, shadows, components } = theme;

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
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
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
            trackColor={{ false: colors.disabled, true: colors.secondary }}
            thumbColor={colors.textInverse}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.sp6,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sp2,
    padding: spacing.sp2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.h4.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sp3,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.text,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sp3,
  },
  settingLabel: {
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  settingDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginTop: spacing.sp1,
  },
  devButton: {
    backgroundColor: colors.warning,
    padding: spacing.sp3,
    borderRadius: radii.button,
    alignItems: "center",
    marginBottom: spacing.sp2,
    minHeight: components.button.heightSmall,
  },
  devButtonText: {
    color: colors.textInverse,
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    margin: spacing.sp2,
    padding: spacing.sp2,
    borderRadius: radii.button,
    alignItems: "center",
    minHeight: components.button.height,
    ...shadows.sm,
  },
  logoutButtonText: {
    color: colors.textInverse,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
  },
  footer: {
    padding: spacing.sp6,
    alignItems: "center",
  },
  footerText: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
  },
});

