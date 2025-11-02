/**
 * OnboardingSlide Component - Stitch Design
 * Reusable component for individual onboarding screens
 */

import React from "react";
import { View, Text, StyleSheet, Image, ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing } from "@/theme";

interface OnboardingSlideProps {
  title: string;
  subtitle?: string;
  image?: ImageSourcePropType;
  children?: React.ReactNode; // For custom content (e.g., player cards, buttons)
}

export default function OnboardingSlide({
  title,
  subtitle,
  image,
  children,
}: OnboardingSlideProps) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Image/Icon Section */}
        {image && (
          <View style={styles.imageContainer}>
            <Image source={image} style={styles.image} resizeMode="contain" />
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Subtitle */}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {/* Custom Content (for slides with interactive elements or special layouts) */}
        {children && <View style={styles.childrenContainer}>{children}</View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: "100%",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sp6,
    paddingTop: spacing.sp8,
    paddingBottom: spacing.sp12,
  },
  imageContainer: {
    marginBottom: spacing.sp8,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sp4,
    lineHeight: typography.h1.lineHeight,
  },
  subtitle: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: "85%",
    lineHeight: typography.bodyLarge.lineHeight,
  },
  childrenContainer: {
    width: "100%",
    marginTop: spacing.sp8,
    alignItems: "center",
  },
});

