/**
 * useReducedMotion Hook
 * Checks if the user has enabled "Reduce Motion" in system accessibility settings
 * Returns true if motion should be reduced, false otherwise
 */

import { useState, useEffect } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial state - use .then() to handle promise
    try {
      // Check if the API exists
      if (typeof AccessibilityInfo !== 'undefined' && AccessibilityInfo.isReduceMotionEnabled) {
        AccessibilityInfo.isReduceMotionEnabled()
          .then((enabled: boolean) => {
            setReduceMotion(enabled);
          })
          .catch(() => {
            // If not supported, default to false
            setReduceMotion(false);
          });
      } else {
        // Fallback if API not available
        setReduceMotion(false);
      }
    } catch (error) {
      // If error occurs, default to false
      console.warn('Reduce motion check failed:', error);
      setReduceMotion(false);
    }
  }, []);

  return reduceMotion;
}

