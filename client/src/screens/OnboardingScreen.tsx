/**
 * Onboarding Screen - Stitch Design
 * Swipeable onboarding flow introducing users to Sprint100
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/navigation/AppNavigator";
import { colors, typography, spacing, radii, shadows } from "@/theme";
import { getAvatarInitials, getColorFromString } from "@/utils/uiHelpers";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

const { width, height } = Dimensions.get("window");

// Slide data based on Stitch design
const slides = [
  {
    id: "1",
    title: "Sprint'100",
    subtitle: "Tap fast, race friends, climb the leaderboard.",
    showSkip: true,
  },
  {
    id: "2",
    title: "Tap to Sprint",
    subtitle: "Alternate tapping left and right as fast as you can.",
    showSkip: true,
    showTapButtons: true,
  },
  {
    id: "3",
    title: "Win. Level up.",
    titleAccent: "Repeat.",
    subtitle: "Climb the ranks in real-time races. Every victory boosts your ELO score and proves your skill.",
    showSkip: true,
    showPlayerCards: true,
  },
  {
    id: "4",
    title: "You're All Set!",
    subtitle: "The starting line is waiting. Prove you're the fastest.",
    showSkip: false,
    showCTA: true,
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Handle scroll and update current index
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  // Handle skip button
  const handleSkip = async () => {
    await AsyncStorage.setItem("@sprint100_onboarding_seen", "true");
    navigation.replace("Login");
  };

  // Handle continue button (slides 1-3)
  const handleContinue = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  // Handle "Get Started" or "Let's Go" button (final slide)
  const handleGetStarted = async () => {
    await AsyncStorage.setItem("@sprint100_onboarding_seen", "true");
    navigation.replace("Register");
  };

  // Render slide 1: App identity
  const renderSlide1 = () => (
    <View style={styles.slideContainer}>
      <SafeAreaView style={styles.slideSafeArea} edges={["top", "bottom"]}>
        <View style={styles.slideContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🏃</Text>
            </View>
          </View>
          <Text style={styles.slideTitle}>Sprint'100</Text>
          <Text style={styles.slideSubtitle}>Tap fast, race friends, climb the leaderboard.</Text>
        </View>
      </SafeAreaView>
    </View>
  );

  // Render slide 2: Gameplay mechanic
  const renderSlide2 = () => (
    <View style={styles.slideContainer}>
      <SafeAreaView style={styles.slideSafeArea} edges={["top", "bottom"]}>
        <View style={styles.slideContent}>
          <Text style={styles.slideTitle}>Tap to Sprint</Text>
          <Text style={styles.slideSubtitle}>Alternate tapping left and right as fast as you can.</Text>
          <View style={styles.tapButtonsContainer}>
            <View style={styles.tapButtonDemo}>
              <View style={[styles.tapButtonCircle, styles.tapButtonLeft]}>
                <Text style={styles.tapButtonLabel}>L</Text>
              </View>
              <View style={[styles.tapButtonCircle, styles.tapButtonRight]}>
                <Text style={styles.tapButtonLabel}>R</Text>
                <View style={styles.thumbsUpOverlay}>
                  <Text style={styles.thumbsUpIcon}>👍</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  // Render slide 3: Competition & ELO
  const renderSlide3 = () => (
    <View style={styles.slideContainer}>
      <SafeAreaView style={styles.slideSafeArea} edges={["top", "bottom"]}>
        <View style={styles.slideContent}>
          {/* Player Cards Section */}
          <View style={styles.playerCardsWrapper}>
            <View style={styles.cardsRow}>
              {/* You Card */}
              <View style={[styles.playerCard, styles.playerCardLeft]}>
                <View style={[styles.playerAvatar, { backgroundColor: getColorFromString("You") }]}>
                  <Text style={styles.playerAvatarText}>{getAvatarInitials("You")}</Text>
                </View>
                <Text style={styles.playerName}>You</Text>
                <Text style={styles.playerElo}>ELO 1250</Text>
                <View style={styles.eloChange}>
                  <Text style={styles.eloChangePositive}>+25</Text>
                  <Text style={styles.arrowUp}>↑</Text>
                </View>
              </View>

              {/* VS Text (centered between cards) */}
              <Text style={styles.vsText}>VS</Text>

              {/* Rival Card */}
              <View style={[styles.playerCard, styles.playerCardRight]}>
                <View style={[styles.playerAvatar, { backgroundColor: getColorFromString("Rival") }]}>
                  <Text style={styles.playerAvatarText}>{getAvatarInitials("Rival")}</Text>
                </View>
                <Text style={styles.playerName}>Rival</Text>
                <Text style={styles.playerElo}>ELO 1280</Text>
                <View style={styles.eloChange}>
                  <Text style={styles.eloChangeNegative}>-25</Text>
                  <Text style={styles.arrowDown}>↓</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.slideTitle}>Win. Level up.</Text>
            <Text style={styles.titleAccentText}>Repeat.</Text>
          </View>
          
          {/* Subtitle */}
          <Text style={styles.slideSubtitle}>
            Climb the ranks in real-time races. Every victory boosts your ELO score and proves your skill.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );

  // Render slide 4: Final CTA
  const renderSlide4 = () => (
    <View style={styles.slideContainer}>
      <SafeAreaView style={styles.slideSafeArea} edges={["top", "bottom"]}>
        <View style={styles.slideContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🏃</Text>
            </View>
          </View>
          <Text style={styles.slideTitle}>You're All Set!</Text>
          <Text style={styles.slideSubtitle}>The starting line is waiting. Prove you're the fastest.</Text>
        </View>
      </SafeAreaView>
    </View>
  );

  const renderItem = ({ item, index }: { item: typeof slides[0]; index: number }) => {
    switch (item.id) {
      case "1":
        return renderSlide1();
      case "2":
        return renderSlide2();
      case "3":
        return renderSlide3();
      case "4":
        return renderSlide4();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip Button (top-right) */}
      {slides[currentIndex]?.showSkip && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Progress Indicator - Top (for slide 2) */}
      {slides[currentIndex]?.id === "2" && (
        <View style={styles.progressIndicatorTop}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDash,
                index === currentIndex && styles.progressDashActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* FlatList for Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />

      {/* Bottom Section: Progress Dots & CTA Button */}
      <View style={styles.bottomSection}>
        {/* Progress Dots */}
        <View style={styles.progressDots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.letsGoButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.letsGoButtonText}>Let's Go</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: "absolute",
    top: spacing.sp8,
    right: spacing.sp6,
    zIndex: 100,
    padding: spacing.sp2,
  },
  skipText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    fontWeight: typography.body.fontWeight,
  },
  progressIndicatorTop: {
    position: "absolute",
    top: spacing.sp8,
    left: spacing.sp6,
    zIndex: 100,
    flexDirection: "row",
    gap: spacing.sp2,
  },
  progressDash: {
    width: 24,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressDashActive: {
    backgroundColor: colors.accent,
    width: 32,
  },
  bottomSection: {
    paddingHorizontal: spacing.sp6,
    paddingBottom: spacing.sp10,
    paddingTop: spacing.sp4,
    alignItems: "center",
    backgroundColor: colors.background,
  },
  progressDots: {
    flexDirection: "row",
    gap: spacing.sp2,
    marginBottom: spacing.sp6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  continueButton: {
    width: "100%",
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    paddingVertical: spacing.sp4,
    paddingHorizontal: spacing.sp6,
    alignItems: "center",
    ...shadows.md,
  },
  continueButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text,
  },
  letsGoButton: {
    width: "100%",
    backgroundColor: colors.accent,
    borderRadius: radii.button,
    paddingVertical: spacing.sp4,
    paddingHorizontal: spacing.sp6,
    alignItems: "center",
    ...shadows.lg,
  },
  letsGoButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text,
  },
  // Slide 1 & 4: Logo
  logoContainer: {
    marginTop: spacing.sp8,
    alignItems: "center",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  logoIcon: {
    fontSize: 64,
  },
  // Slide 2: Tap Buttons
  tapButtonsContainer: {
    marginTop: spacing.sp8,
    width: "100%",
    alignItems: "center",
  },
  tapButtonDemo: {
    flexDirection: "row",
    gap: spacing.sp6,
    alignItems: "center",
  },
  tapButtonCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(30, 60, 90, 0.6)", // Dark blue, semi-transparent
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...shadows.md,
  },
  tapButtonLeft: {
    // Left button styling
  },
  tapButtonRight: {
    // Right button with thumbs up overlay
  },
  tapButtonLabel: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textSecondary,
  },
  thumbsUpOverlay: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.text,
  },
  thumbsUpIcon: {
    fontSize: 24,
  },
  // Slide 3: Player Cards
  playerCardsWrapper: {
    marginTop: spacing.sp4,
    marginBottom: spacing.sp6,
    width: "100%",
    alignItems: "center",
  },
  cardsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sp3,
    position: "relative",
    width: "100%",
  },
  vsText: {
    fontSize: 56,
    fontWeight: "bold",
    color: colors.text,
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -28 }], // Center the VS text
    zIndex: 5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  playerCard: {
    width: 140,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Glassmorphism effect
    borderRadius: radii.card,
    padding: spacing.sp4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    ...shadows.lg,
    // Glassmorphism backdrop blur effect (iOS)
    overflow: "hidden",
  },
  playerCardLeft: {
    transform: [{ rotate: "5deg" }],
  },
  playerCardRight: {
    transform: [{ rotate: "-5deg" }],
  },
  playerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sp2,
  },
  playerAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  playerName: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.text,
    marginBottom: spacing.sp1,
  },
  playerElo: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.sp2,
  },
  eloChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sp1,
  },
  eloChangePositive: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.success,
  },
  eloChangeNegative: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.danger,
  },
  arrowUp: {
    fontSize: 16,
    color: colors.success,
  },
  arrowDown: {
    fontSize: 16,
    color: colors.danger,
  },
  slideContainer: {
    flex: 1,
    width,
    backgroundColor: colors.background,
  },
  slideSafeArea: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sp6,
    paddingTop: spacing.sp8,
    paddingBottom: spacing.sp12,
  },
  slideTitle: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sp4,
    lineHeight: typography.h1.lineHeight,
  },
  slideSubtitle: {
    fontSize: typography.bodyLarge.fontSize,
    fontWeight: typography.bodyLarge.fontWeight,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: "85%",
    lineHeight: typography.bodyLarge.lineHeight,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: spacing.sp8,
    marginBottom: spacing.sp4,
  },
  titleAccentText: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.accent,
    textAlign: "center",
  },
});

