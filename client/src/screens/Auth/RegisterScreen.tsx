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
import { validateEmail } from "@/utils/validateEmail";
import { theme } from "@/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AppNavigator";

const { colors, typography, spacing, radii, shadows, components } = theme;

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

    // Validate email format and domain whitelist
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message || "Invalid email address");
      Alert.alert("Invalid Email", emailValidation.message || "Please enter a valid email address.");
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
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
          placeholderTextColor={colors.placeholder}
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
          placeholderTextColor={colors.placeholder}
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
          placeholderTextColor={colors.placeholder}
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
          placeholderTextColor={colors.placeholder}
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
            <ActivityIndicator color={colors.textInverse} />
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.sp6,
    paddingBottom: 100, // Extra padding to accommodate password autofill overlay (iOS exception)
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    textAlign: "center",
    marginBottom: spacing.sp2,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginBottom: spacing.sp8,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    padding: spacing.sp3,
    marginBottom: spacing.sp2,
    fontSize: typography.body.fontSize,
    color: colors.text, // White text on dark backgrounds
    minHeight: components.input.height, // Ensure touchable area is large enough
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    padding: spacing.sp2,
    alignItems: "center",
    marginTop: spacing.sp2,
    minHeight: components.button.height,
    ...shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
  },
  linkButton: {
    marginTop: spacing.sp2,
    padding: spacing.sp2,
  },
  linkText: {
    color: colors.primary,
    textAlign: "center",
    fontSize: typography.bodySmall.fontSize,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.sp3,
    textAlign: "center",
    fontSize: typography.bodySmall.fontSize,
  },
});

