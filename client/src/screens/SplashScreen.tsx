/**
 * Splash Screen - Branded Launch Screen
 * Displays app branding with fade animation before transitioning to auth/main screens
 * Matches Stitch design system with dark background and accent glow
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing } from "@/theme";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle glow pulse animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    // Fade out and transition after minimum display time
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 1500); // Minimum 1.5s display time

    return () => {
      clearTimeout(timer);
      glowAnimation.stop();
    };
  }, [onFinish]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3], // Subtle glow intensity
  });

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Dark background with subtle green gradient glow */}
      <View style={styles.background}>
        <Animated.View
          style={[
            styles.glowOverlay,
            {
              opacity: glowOpacity,
            },
          ]}
        />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Main Title */}
        <Text style={styles.title}>Sprint100</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Tap Fast. Race Friends. Climb the Leaderboard.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Very dark background
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00FF88", // Subtle green glow
    borderRadius: width / 2, // Circular gradient effect
    transform: [{ scale: 1.5 }], // Extend glow beyond screen
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.sp6,
  },
  title: {
    fontSize: typography.h1.fontSize * 1.5, // 72px equivalent
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sp4,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: colors.textSecondary,
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: typography.body.lineHeight * typography.body.fontSize,
  },
});

