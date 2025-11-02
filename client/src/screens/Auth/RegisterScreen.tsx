/**
 * Register Screen
 * Handles new user registration with email/password
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { getServerUrl } from "@/config";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AppNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 alphanumeric characters or underscores");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Debug: Log all config sources
      const Constants = require('expo-constants').default;
      console.log('🔍 DEBUG Config Sources:', {
        expoConfigUrl: Constants.expoConfig?.extra?.API_URL,
        envUrl: process.env.EXPO_PUBLIC_API_URL,
        defaultFromConfig: require('@/config').DEFAULT_SERVER_URL,
      });
      
      const serverUrl = getServerUrl();
      const fullUrl = `${serverUrl}/api/register`;
      console.log(`🌐 Attempting registration to: ${fullUrl}`);
      console.log(`📱 Current network state check...`);
      console.log(`🔗 Final serverUrl used: ${serverUrl}`);
      
      // Add timeout and better error handling for React Native
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`📡 Response status: ${response.status}`);
      
      // Check if response has JSON before parsing
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server returned non-JSON: ${response.status} ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Registration failed: ${response.status}`);
      }

      // Store token and decode user info
      await login(data.token);
      // Navigation will happen automatically via AppNavigator when auth state changes
    } catch (err: any) {
      console.error("Registration error:", err);
      console.error("Error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
        code: err.code,
        cause: err.cause,
      });
      
      // More specific error messages
      let errorMessage = "An error occurred during registration";
      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === "TypeError" && err.message?.includes("Network request failed")) {
        errorMessage = `Cannot connect to server. Make sure the server is running at ${getServerUrl()}`;
      } else if (err.name === "TypeError" && err.message?.includes("JSON")) {
        errorMessage = "Server returned invalid response. Check server logs.";
      }
      
      setError(errorMessage);
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
      <View style={styles.content}>
        <Text style={styles.title}>Sprint100</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Username (3-20 chars, alphanumeric + _)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          textContentType="username"
          autoComplete="username"
          editable={!isLoading}
          maxLength={20}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          passwordRules="minlength: 6;"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          editable={!isLoading}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Login")}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 100, // Extra padding to accommodate password autofill overlay
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    minHeight: 44, // Ensure touchable area is large enough
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 16,
    padding: 8,
  },
  linkText: {
    color: "#007AFF",
    textAlign: "center",
    fontSize: 14,
  },
  errorText: {
    color: "#ff3b30",
    marginBottom: 12,
    textAlign: "center",
  },
});

