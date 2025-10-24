/**
 * Offline Banner Component
 * Shows a banner when the app is in offline mode
 * Provides user feedback about network connectivity status
 */

import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useNetwork } from "@/hooks/useNetwork";

interface OfflineBannerProps {
  visible?: boolean;
  message?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  visible,
  message = "Offline Mode: Online features disabled",
  backgroundColor = "#FF9500",
  textColor = "#FFFFFF",
}) => {
  const { isOfflineMode } = useNetwork();
  const shouldShow = visible !== undefined ? visible : isOfflineMode;

  if (!shouldShow) return null;

  return (
    <View style={[styles.banner, { backgroundColor }]}>
      <Text style={[styles.bannerText, { color: textColor }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default OfflineBanner;
