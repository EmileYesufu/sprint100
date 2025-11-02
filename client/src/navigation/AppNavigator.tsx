/**
 * App Navigator
 * Root navigation setup with authentication flow
 * - AuthStack: Onboarding → Login/Register screens when not authenticated
 * - MainTabs: Bottom tab navigation when authenticated (Race, Profile, Leaderboard, Settings)
 */

import React, { useState, useEffect } from "react";
import { NavigationContainer, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/hooks/useAuth";

// Auth Screens
import OnboardingScreen from "@/screens/OnboardingScreen";
import LoginScreen from "@/screens/Auth/LoginScreen";
import RegisterScreen from "@/screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "@/screens/Auth/ForgotPasswordScreen";

// Race Screens
import QueueScreen from "@/screens/Race/QueueScreen";
import RaceScreen from "@/screens/Race/RaceScreen";

// Training Screens
import TrainingSetupScreen from "@/screens/Training/TrainingSetupScreen";
import TrainingRaceScreen from "@/screens/Training/TrainingRaceScreen";

// Other Screens
import ProfileScreen from "@/screens/ProfileScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import SplashScreen from "@/screens/SplashScreen";

// Navigation Type Definitions
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
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

export type TrainingStackParamList = {
  TrainingSetup: undefined;
  TrainingRace: {
    config: {
      aiCount: 1 | 3 | 7;
      difficulty: "Easy" | "Medium" | "Hard";
      personality: "Consistent" | "Erratic" | "Aggressive";
      seed: number;
    };
  };
};

export type MainTabsParamList = {
  RaceTab: undefined;
  TrainingTab: undefined;
  Profile: undefined;
  Leaderboard: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

// Stack and Tab Navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RaceStack = createNativeStackNavigator<RaceStackParamList>();
const TrainingStack = createNativeStackNavigator<TrainingStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

// Auth Stack Navigator (Onboarding/Login/Register)
function AuthNavigator({ initialRouteName = "Onboarding" }: { initialRouteName?: "Onboarding" | "Login" }) {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={initialRouteName}
    >
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: "Forgot Password", headerShown: false }}
      />
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

// Training Stack Navigator (Setup -> Race)
function TrainingNavigator() {
  return (
    <TrainingStack.Navigator>
      <TrainingStack.Screen
        name="TrainingSetup"
        component={TrainingSetupScreen}
        options={{ headerShown: false }}
      />
      <TrainingStack.Screen
        name="TrainingRace"
        component={TrainingRaceScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back during race
        }}
      />
    </TrainingStack.Navigator>
  );
}

// Main Tabs Navigator (Bottom Tabs)
function MainNavigator() {
  return (
    <MainTabs.Navigator
      screenOptions={({ route }) => {
        // Get the currently focused route name from nested navigators
        const routeName = getFocusedRouteNameFromRoute(route) ?? "";
        
        // Hide tab bar when on race screens (both online and training)
        const isRaceScreen = routeName === "Race" || routeName === "TrainingRace";
        
        return {
          headerShown: false,
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: isRaceScreen
            ? { display: "none" }
            : {
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderTopColor: "#e0e0e0",
              },
        };
      }}
    >
      <MainTabs.Screen
        name="RaceTab"
        component={RaceNavigator}
        options={{
          tabBarLabel: "Online",
          tabBarIcon: ({ color }) => <TabIcon name="🌐" color={color} />,
        }}
      />
      <MainTabs.Screen
        name="TrainingTab"
        component={TrainingNavigator}
        options={{
          tabBarLabel: "Training",
          tabBarIcon: ({ color }) => <TabIcon name="🎯" color={color} />,
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
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const navigationRef = React.useRef<any>(null);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem("@sprint100_onboarding_seen");
        setHasSeenOnboarding(seen === "true");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setHasSeenOnboarding(false); // Default to showing onboarding on error
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, []);

  // Navigate after splash finishes and checks complete
  const handleSplashFinish = () => {
    setSplashFinished(true);
  };

  useEffect(() => {
    if (splashFinished && !isLoading && !checkingOnboarding && navigationRef.current) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        if (token) {
          navigationRef.current?.replace("Main");
        } else {
          navigationRef.current?.replace("Auth");
        }
      }, 100);
    }
  }, [splashFinished, isLoading, checkingOnboarding, token]);

  // Show splash screen first, then transition to auth/main
  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Splash"
      >
        <RootStack.Screen name="Splash" options={{ animationEnabled: false }}>
          {() => <SplashScreen onFinish={handleSplashFinish} />}
        </RootStack.Screen>
        
        <RootStack.Screen name="Main" component={MainNavigator} />
        <RootStack.Screen name="Auth" options={{ animationEnabled: false }}>
          {() => (
            <AuthNavigator
              initialRouteName={hasSeenOnboarding ? "Login" : "Onboarding"}
            />
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
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

