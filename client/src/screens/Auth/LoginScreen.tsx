/**
 * Login Screen
 * Handles user login with email/password authentication
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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { getServerUrl } from "@/config";
import { validateEmail } from "@/utils/validateEmail";
import { theme } from "@/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AppNavigator";

const { colors, typography, spacing, radii, shadows, components } = theme;

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    // Validate email format and domain whitelist
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message || "Invalid email address");
      Alert.alert("Invalid Email", emailValidation.message || "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${getServerUrl()}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token and decode user info
      await login(data.token);
      // Navigation will happen automatically via AppNavigator when auth state changes
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred during login");
      Alert.alert("Login Failed", err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // SafeAreaView added to avoid iPhone notch/HUD
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <View style={styles.content}>
        {/* App Branding */}
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../assets/sprint100-logo.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Sprint 100</Text>
        <Text style={styles.subtitle}>Login to start the race</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            disabled={isLoading}
            style={styles.forgotPasswordLink}
            accessibilityLabel="Forgot password"
            accessibilityHint="Navigate to password reset screen"
            accessibilityRole="button"
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Register")}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Don't have an account? </Text>
          <Text style={styles.linkTextBold}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.sp6,
    backgroundColor: colors.card,
    margin: spacing.sp5, // 20px - off 8px grid but matches design
    borderRadius: radii.modal,
    ...shadows.md,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: spacing.sp6,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: radii.lg,
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
  inputContainer: {
    marginBottom: spacing.sp2,
  },
  inputLabel: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp2,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    padding: spacing.sp3,
    fontSize: typography.body.fontSize,
    color: colors.text, // White text on dark backgrounds
    minHeight: components.input.height,
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
    flexDirection: "row",
    justifyContent: "center",
  },
  linkText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: typography.bodySmall.fontSize,
  },
  linkTextBold: {
    color: colors.primary,
    textAlign: "center",
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.label.fontWeight,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.sp3,
    textAlign: "center",
    fontSize: typography.bodySmall.fontSize,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: spacing.sp1,
    padding: spacing.sp1,
  },
  forgotPasswordText: {
    fontSize: typography.caption.fontSize,
    color: colors.accent,
    textDecorationLine: "underline",
  },
});

