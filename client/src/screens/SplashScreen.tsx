/**
 * Splash Screen - Branded Launch Screen
 * Displays splash image with fade animation before transitioning to auth/main screens
 * Matches Stitch design system with dark background
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log("[SplashScreen] Component mounted, starting timer");
    // Fade out and transition after minimum display time
    const timer = setTimeout(() => {
      console.log("[SplashScreen] Timer expired, calling onFinish");
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        console.log("[SplashScreen] Animation complete, calling onFinish");
        onFinish();
      });
    }, 1500); // Minimum 1.5s display time

    return () => {
      console.log("[SplashScreen] Component unmounting, clearing timer");
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Background */}
      <View style={styles.background} />

      {/* Splash Image */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Image
          source={require("../../assets/splash-icon.png")}
          style={styles.splashImage}
          resizeMode="contain"
        />
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
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  splashImage: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
  },
});

