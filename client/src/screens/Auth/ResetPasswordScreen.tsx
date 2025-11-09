import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";
import { submitPasswordReset } from "@/services/passwordResetClient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AppNavigator";

const { colors, typography, spacing, radii, components, shadows } = theme;

const MIN_PASSWORD_LENGTH = 8;

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const initialToken = useMemo(() => route.params?.token ?? "", [route.params?.token]);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitDisabled =
    status === "loading" || !token.trim() || !password || password !== confirmPassword;

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      await submitPasswordReset(token.trim(), password);
      setStatus("success");
    } catch (error: any) {
      console.error("Reset password error", error);
      if (error?.code === "invalid_or_expired_token") {
        setErrorMessage("The reset link is invalid or has expired.");
      } else if (error?.code === "invalid_password") {
        setErrorMessage(error.message || "Password does not meet requirements.");
      } else {
        setErrorMessage(error?.message || "Unable to reset password. Please try again later.");
      }
      setStatus("error");
    }
  };

  const renderContent = () => {
    if (status === "success") {
      return (
        <View style={styles.content}>
          <Text style={styles.title}>Password Updated</Text>
          <Text style={styles.subtitle}>
            You can now log in with your new credentials. If the app does not redirect automatically,
            tap the button below.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Login")}
            accessibilityLabel="Return to login"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <Text style={styles.title}>Set a New Password</Text>
        <Text style={styles.subtitle}>
          Enter the reset code you received via email along with your new password.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reset Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste your reset code"
            placeholderTextColor={colors.placeholder}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            editable={status !== "loading"}
            accessibilityLabel="Reset code"
            testID="reset-token-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={status !== "loading"}
            accessibilityLabel="New password"
            testID="password-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={status !== "loading"}
            accessibilityLabel="Confirm password"
            testID="confirm-password-input"
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitDisabled && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          accessibilityLabel="Submit new password"
          accessibilityRole="button"
          testID="submit-button"
        >
          {status === "loading" ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.primaryButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={status === "loading"}
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {renderContent()}
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
    justifyContent: "center",
    padding: spacing.sp6,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: radii.modal,
    padding: spacing.sp6,
    ...shadows.md,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    textAlign: "center",
    color: colors.text,
    marginBottom: spacing.sp2,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: spacing.sp6,
    lineHeight: typography.body.lineHeight,
  },
  inputGroup: {
    marginBottom: spacing.sp4,
  },
  inputLabel: {
    fontSize: typography.label.fontSize,
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
    color: colors.text,
    minHeight: components.input.height,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    padding: spacing.sp2,
    alignItems: "center",
    marginTop: spacing.sp2,
    minHeight: components.button.height,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: typography.body.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    marginTop: spacing.sp4,
    alignItems: "center",
  },
  backButtonText: {
    color: colors.primary,
    textDecorationLine: "underline",
    fontSize: typography.bodySmall.fontSize,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.bodySmall.fontSize,
    marginBottom: spacing.sp2,
    textAlign: "center",
  },
});
