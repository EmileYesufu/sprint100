/**
 * App Entry Point
 * Wraps the app with AuthProvider and ErrorBoundary, renders AppNavigator
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AppNavigator from "@/navigation/AppNavigator";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ErrorBoundary>
  );
}
