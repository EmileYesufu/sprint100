/**
 * App Entry Point
 * Wraps the app with providers and renders AppNavigator with global network state
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { AuthProvider } from "@/hooks/useAuth";
import { NetworkProvider } from "@/hooks/useNetwork";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorToastProvider } from "@/components/ErrorToast";
import { OfflineBanner } from "@/components/OfflineBanner";
import AppNavigator from "@/navigation/AppNavigator";

export default function App() {
  return (
    <ErrorBoundary>
      <NetworkProvider>
        <AuthProvider>
          <ErrorToastProvider>
            <View style={styles.container}>
              <StatusBar style="auto" />
              <OfflineBanner />
              <AppNavigator />
            </View>
          </ErrorToastProvider>
        </AuthProvider>
      </NetworkProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
