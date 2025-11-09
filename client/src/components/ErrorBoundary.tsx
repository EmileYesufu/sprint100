/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI and provides restart functionality
 */

import React, { Component, ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as ErrorRecovery from "expo-error-recovery";

interface Props {
  children: ReactNode;
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

// Default fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleRestart = () => {
    Alert.alert(
      "Restart App",
      "This will restart the app and clear any unsaved data. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restart",
          style: "destructive",
          onPress: () => {
            resetError();
            // In a real app, you might want to restart the entire app
            // For now, we'll just reset the error boundary
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      
      <Text style={styles.title}>Something went wrong</Text>
      
      <Text style={styles.message}>
        We're sorry, but something unexpected happened. Don't worry, your data is safe.
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
          <Text style={styles.restartButtonText}>Restart App</Text>
        </TouchableOpacity>
      </View>
      
      {__DEV__ && error && (
        <View style={styles.errorDetails}>
          <Text style={styles.errorTitle}>Error Details (Development):</Text>
          <Text style={styles.errorText}>{error.message}</Text>
          {error.stack && (
            <Text style={styles.stackTrace}>{error.stack}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error to console in development
    if (__DEV__) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    
    // Persist minimal details for Expo ErrorRecovery integration
    ErrorRecovery.setRecoveryProps({
      lastErrorAt: new Date().toISOString(),
      message: error.message,
    });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.FallbackComponent || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  restartButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  restartButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorDetails: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    width: "100%",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#d73a49",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 10,
    color: "#6a737d",
    fontFamily: "monospace",
    lineHeight: 16,
  },
});

export default ErrorBoundary;
