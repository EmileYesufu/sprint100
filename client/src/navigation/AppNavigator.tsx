/**
 * App Navigator
 * Root navigation setup with authentication flow
 * - AuthStack: Login/Register screens when not authenticated
 * - MainTabs: Bottom tab navigation when authenticated (Race, Profile, Leaderboard, Settings)
 */

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { useAuth } from "@/hooks/useAuth";

// Auth Screens
import LoginScreen from "@/screens/Auth/LoginScreen";
import RegisterScreen from "@/screens/Auth/RegisterScreen";

// Race Screens
import QueueScreen from "@/screens/Race/QueueScreen";
import RaceScreen from "@/screens/Race/RaceScreen";

// Other Screens
import ProfileScreen from "@/screens/ProfileScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import SettingsScreen from "@/screens/SettingsScreen";

// Navigation Type Definitions
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RaceStackParamList = {
  Queue: undefined;
  Race: {
    matchId: number;
    opponent: {
      userId: number;
      email: string;
      elo: number;
    };
  };
};

export type MainTabsParamList = {
  RaceTab: undefined;
  Profile: undefined;
  Leaderboard: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Stack and Tab Navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RaceStack = createNativeStackNavigator<RaceStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

// Auth Stack Navigator (Login/Register)
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Race Stack Navigator (Queue -> Race)
function RaceNavigator() {
  return (
    <RaceStack.Navigator>
      <RaceStack.Screen
        name="Queue"
        component={QueueScreen}
        options={{ headerShown: false }}
      />
      <RaceStack.Screen
        name="Race"
        component={RaceScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back during race
        }}
      />
    </RaceStack.Navigator>
  );
}

// Main Tabs Navigator (Bottom Tabs)
function MainNavigator() {
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
        },
      }}
    >
      <MainTabs.Screen
        name="RaceTab"
        component={RaceNavigator}
        options={{
          tabBarLabel: "Race",
          tabBarIcon: ({ color }) => <TabIcon name="🏃" color={color} />,
        }}
      />
      <MainTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
        }}
      />
      <MainTabs.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: "Leaderboard",
          tabBarIcon: ({ color }) => <TabIcon name="🏆" color={color} />,
        }}
      />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => <TabIcon name="⚙️" color={color} />,
        }}
      />
    </MainTabs.Navigator>
  );
}

// Simple tab icon component using emoji
function TabIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text style={{ fontSize: 24, opacity: color === "#007AFF" ? 1 : 0.5 }}>
      {name}
    </Text>
  );
}

// Root App Navigator
export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});

