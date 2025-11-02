/**
 * Forgot Password Screen
 * Handles password reset request via email
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
import { getServerUrl } from "@/config";
import { validateEmail } from "@/utils/validateEmail";
import { theme } from "@/theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AppNavigator";

const { colors, typography, spacing, radii, shadows, components } = theme;

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    // Validate email format and domain whitelist
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert("Invalid Email", emailValidation.message || "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${getServerUrl()}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to send reset link.");
      }

      Alert.alert(
        "Success",
        data.message || "Check your inbox for a password reset link.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      console.error("Forgot password error:", err);
      Alert.alert(
        "Error",
        err.message || "Unable to send reset link. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your account email address and we'll send you a password reset
            link.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isLoading}
              accessibilityLabel="Email address input for password reset"
              accessibilityHint="Enter the email address associated with your account"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={isLoading}
            accessibilityLabel="Send reset link"
            accessibilityHint="Sends a password reset link to your email address"
            accessibilityRole="button"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            accessibilityLabel="Go back to login"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
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
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    padding: spacing.sp2,
    alignItems: "center",
    marginTop: spacing.sp4,
    minHeight: components.button.height,
    ...shadows.base,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    opacity: 0.7,
  },
  buttonText: {
    color: "#000000", // Dark text on accent background (accent is electric blue #00E0FF)
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
  },
  backButton: {
    marginTop: spacing.sp3,
    padding: spacing.sp2,
    alignItems: "center",
  },
  backButtonText: {
    color: colors.primary,
    textAlign: "center",
    fontSize: typography.bodySmall.fontSize,
    textDecorationLine: "underline",
  },
});

