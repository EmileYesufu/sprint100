/**
 * App Entry Point
 * Wraps the app with AuthProvider and renders AppNavigator
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/hooks/useAuth";
import AppNavigator from "@/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}
