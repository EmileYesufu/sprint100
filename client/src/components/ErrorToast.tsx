/**
 * Error Toast Component
 * Provides uniform error display using react-native-toast-message
 * Handles different types of errors with appropriate styling and actions
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

interface ErrorToastProps {
  title?: string;
  message: string;
  type?: "error" | "warning" | "info" | "success";
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
}

// Custom error toast configuration
const toastConfig = {
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.errorContent}
      text1Style={styles.errorTitle}
      text2Style={styles.errorMessage}
    />
  ),
  
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.baseToast, styles.warningToast]}
      contentContainerStyle={styles.warningContent}
      text1Style={styles.warningTitle}
      text2Style={styles.warningMessage}
    />
  ),
  
  info: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.baseToast, styles.infoToast]}
      contentContainerStyle={styles.infoContent}
      text1Style={styles.infoTitle}
      text2Style={styles.infoMessage}
    />
  ),
  
  success: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.baseToast, styles.successToast]}
      contentContainerStyle={styles.successContent}
      text1Style={styles.successTitle}
      text2Style={styles.successMessage}
    />
  ),
};

// Error Toast Hook
export const useErrorToast = () => {
  const showError = (props: ErrorToastProps) => {
    const {
      title = "Error",
      message,
      type = "error",
      action,
      duration = 4000,
    } = props;

    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 100,
      props: {
        action,
      },
    });
  };

  const showNetworkError = (message: string = "Network connection lost") => {
    showError({
      title: "Connection Error",
      message,
      type: "error",
      duration: 6000,
    });
  };

  const showAuthError = (message: string = "Authentication failed") => {
    showError({
      title: "Authentication Error",
      message,
      type: "error",
      duration: 5000,
    });
  };

  const showApiError = (message: string = "Server error occurred") => {
    showError({
      title: "Server Error",
      message,
      type: "error",
      duration: 5000,
    });
  };

  const showWarning = (title: string, message: string) => {
    showError({
      title,
      message,
      type: "warning",
      duration: 4000,
    });
  };

  const showInfo = (title: string, message: string) => {
    showError({
      title,
      message,
      type: "info",
      duration: 3000,
    });
  };

  const showSuccess = (title: string, message: string) => {
    showError({
      title,
      message,
      type: "success",
      duration: 3000,
    });
  };

  const hide = () => {
    Toast.hide();
  };

  return {
    showError,
    showNetworkError,
    showAuthError,
    showApiError,
    showWarning,
    showInfo,
    showSuccess,
    hide,
  };
};

// Error Toast Provider Component
export const ErrorToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      <Toast config={toastConfig} />
    </>
  );
};

// Direct error display functions for global use
export const showErrorToast = (props: ErrorToastProps) => {
  const { useErrorToast } = require("./ErrorToast");
  const { showError } = useErrorToast();
  showError(props);
};

export const showNetworkErrorToast = (message?: string) => {
  const { useErrorToast } = require("./ErrorToast");
  const { showNetworkError } = useErrorToast();
  showNetworkError(message);
};

export const showAuthErrorToast = (message?: string) => {
  const { useErrorToast } = require("./ErrorToast");
  const { showAuthError } = useErrorToast();
  showAuthError(message);
};

export const showApiErrorToast = (message?: string) => {
  const { useErrorToast } = require("./ErrorToast");
  const { showApiError } = useErrorToast();
  showApiError(message);
};

const styles = StyleSheet.create({
  // Base toast styles
  baseToast: {
    borderLeftWidth: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Error toast styles
  errorToast: {
    borderLeftColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  errorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D73A49",
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6A737D",
    lineHeight: 20,
  },
  
  // Warning toast styles
  warningToast: {
    borderLeftColor: "#FF9500",
    backgroundColor: "#FFFBF0",
  },
  warningContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E36209",
    marginBottom: 4,
  },
  warningMessage: {
    fontSize: 14,
    color: "#6A737D",
    lineHeight: 20,
  },
  
  // Info toast styles
  infoToast: {
    borderLeftColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  infoContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0366D6",
    marginBottom: 4,
  },
  infoMessage: {
    fontSize: 14,
    color: "#6A737D",
    lineHeight: 20,
  },
  
  // Success toast styles
  successToast: {
    borderLeftColor: "#34C759",
    backgroundColor: "#F0FFF4",
  },
  successContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28A745",
    marginBottom: 4,
  },
  successMessage: {
    fontSize: 14,
    color: "#6A737D",
    lineHeight: 20,
  },
});

export default ErrorToast;
