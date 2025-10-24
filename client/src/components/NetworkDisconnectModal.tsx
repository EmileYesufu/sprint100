/**
 * Network Disconnect Modal
 * Shows when network connection is lost during a race
 * Provides reconnection options and user feedback
 */

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface NetworkDisconnectModalProps {
  visible: boolean;
  isReconnecting: boolean;
  onDismiss: () => void;
  onForceReconnect: () => void;
}

export const NetworkDisconnectModal: React.FC<NetworkDisconnectModalProps> = ({
  visible,
  isReconnecting,
  onDismiss,
  onForceReconnect,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📡</Text>
          </View>
          
          <Text style={styles.title}>Connection Lost</Text>
          
          <Text style={styles.message}>
            {isReconnecting
              ? "Attempting to reconnect..."
              : "Your connection to the server was lost. We're trying to reconnect automatically."}
          </Text>
          
          {isReconnecting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>Reconnecting...</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onForceReconnect}
              disabled={isReconnecting}
            >
              <Text style={styles.primaryButtonText}>
                {isReconnecting ? "Reconnecting..." : "Try Again"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onDismiss}
              disabled={isReconnecting}
            >
              <Text style={styles.secondaryButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#007AFF",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default NetworkDisconnectModal;
