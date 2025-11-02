/**
 * App Theme - Design Tokens & Styling System
 * Modern, sporty color palette with light/dark mode support
 * 
 * Usage in components:
 *   import { theme, colors, spacing, typography } from '@/theme';
 *   <View style={{ padding: spacing.sp4, backgroundColor: colors.surface }}>
 */

export type ThemeMode = "light" | "dark";

// ===== COLOR PALETTE =====
// Modern, sporty colors - tune these hex values to match your brand

const basePalette = {
  // Primary - Bold blue for main actions
  primary: "#007AFF",
  primaryDark: "#0051D5",
  primaryLight: "#4DA3FF",

  // Secondary - Energetic green for success/positive
  secondary: "#34C759",
  secondaryDark: "#248A3D",
  secondaryLight: "#5DD97C",

  // Accent - Electric blue for Stitch design
  accent: "#00E0FF",
  accentDark: "#00B8D4",
  accentLight: "#40E6FF",

  // Danger - Red for warnings/errors
  danger: "#FF3B30",
  dangerDark: "#CC2E24",
  dangerLight: "#FF5F56",

  // Warning - Yellow for caution
  warning: "#FFCC00",
  warningDark: "#E6B800",
  warningLight: "#FFD633",

  // Neutrals - Grays for text and backgrounds
  black: "#000000",
  white: "#FFFFFF",
  gray100: "#F5F5F5",
  gray200: "#E5E5E5",
  gray300: "#D4D4D4",
  gray400: "#A3A3A3",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#404040",
  gray800: "#262626",
  gray900: "#171717",
};

// Light mode colors
const lightColors = {
  primary: basePalette.primary,
  secondary: basePalette.secondary,
  accent: basePalette.accent,
  success: basePalette.secondary,
  warning: basePalette.warning,
  danger: basePalette.danger,
  
  // Backgrounds
  background: basePalette.white,
  surface: basePalette.white,
  card: basePalette.gray100,
  
  // Text
  text: basePalette.gray900,
  textSecondary: basePalette.gray600,
  textMuted: basePalette.gray400,
  textInverse: basePalette.white,
  
  // UI Elements
  border: basePalette.gray300,
  divider: basePalette.gray200,
  placeholder: basePalette.gray400,
  disabled: basePalette.gray300,
  
  // Status
  online: basePalette.secondary,
  offline: basePalette.gray400,
  
  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
};

// Dark mode colors (Stitch design)
const darkColors = {
  primary: basePalette.primaryLight,
  secondary: basePalette.secondaryLight,
  accent: basePalette.accent, // Electric blue #00E0FF
  success: basePalette.secondaryLight,
  warning: basePalette.warningLight,
  danger: basePalette.dangerLight,
  
  // Backgrounds - Dark theme for Stitch
  background: "#0A0A0A", // Very dark background
  surface: basePalette.gray900,
  card: "#121212", // Slightly lighter than background
  
  // Text - Improved contrast for WCAG 2.1 AA compliance (4.5:1 minimum)
  text: basePalette.white,
  textSecondary: "#CCCCCC", // Changed from gray400 (#A3A3A3) for better contrast
  textMuted: "#B0B0B0", // Changed from gray500 for better contrast
  textInverse: basePalette.gray900,
  
  // UI Elements
  border: basePalette.gray700,
  divider: basePalette.gray800,
  placeholder: basePalette.gray500,
  disabled: basePalette.gray700,
  
  // Status
  online: basePalette.secondaryLight,
  offline: basePalette.gray600,
  
  // Overlay
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.5)",
};

// ===== TYPOGRAPHY =====
// Font sizes and weights - tune these for your preferred scale

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
  hero: 48,
};

export const fontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const typography = {
  // Headings
  h1: {
    fontSize: fontSizes.hero,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.hero * lineHeights.tight,
  },
  h2: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.display * lineHeights.tight,
  },
  h3: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xxxl * lineHeights.normal,
  },
  h4: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xxl * lineHeights.normal,
  },
  
  // Body text
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  
  // Labels
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },
  
  // Buttons
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.tight,
  },
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes.lg * lineHeights.tight,
  },
};

// ===== SPACING =====
// Consistent spacing scale - tune these multiples of 4 for your grid

export const spacing = {
  sp0: 0,
  sp1: 4,
  sp2: 8,
  sp3: 12,
  sp4: 16,
  sp5: 20,
  sp6: 24,
  sp7: 28,
  sp8: 32,
  sp10: 40,
  sp12: 48,
  sp16: 64,
  sp20: 80,
  
  // Semantic spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Common use cases
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 16,
  gap: 12,
  gapSmall: 8,
  gapLarge: 20,
};

// ===== BORDER RADII =====
// Border radius tokens - tune for more or less rounded corners

export const radii = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999, // Fully rounded (pills)
  
  // Component-specific
  button: 8,
  card: 12,
  input: 8,
  modal: 16,
};

// ===== SHADOWS & ELEVATION =====
// Platform-appropriate shadows - iOS style shadows + Android elevation

export const shadows = {
  none: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  base: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
};

export const elevation = shadows; // Alias for consistency

// ===== COMPONENT TOKENS =====
// Common component dimensions and properties

export const components = {
  button: {
    height: 48, // ≥44px for accessibility
    heightSmall: 44, // Minimum touch target size
    heightLarge: 56,
    borderRadius: radii.button,
  },
  input: {
    height: 48,
    borderRadius: radii.input,
    borderWidth: 1,
  },
  card: {
    borderRadius: radii.card,
    padding: spacing.cardPadding,
  },
  header: {
    height: 60,
  },
  tabBar: {
    height: 60,
  },
};

// ===== ACCESSIBILITY TOKENS =====
// WCAG 2.1 AA compliance standards

export const accessibility = {
  // Minimum contrast ratios (WCAG 2.1 AA)
  minContrastRatio: {
    normal: 4.5, // Normal text (≤18pt regular, ≤14pt bold)
    large: 3.0, // Large text (>18pt regular, >14pt bold)
  },
  
  // Minimum touch target size (iOS and Android guidelines)
  minTouchTarget: 44, // 44×44 points/pixels
  
  // Default hitSlop for smaller interactive elements
  hitSlop: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
  
  // Text scaling
  allowFontScaling: true,
  adjustsFontSizeToFit: true,
};

// ===== HELPER FUNCTIONS =====

/**
 * Apply opacity to a hex color
 * @param hex - Hex color string (e.g., "#FF0000")
 * @param percent - Opacity percentage (0-100)
 * @returns RGBA color string
 */
export function applyOpacity(hex: string, percent: number): string {
  const opacity = Math.max(0, Math.min(100, percent)) / 100;
  
  // Remove # if present
  const cleanHex = hex.replace("#", "");
  
  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get contrasting text color (black or white) for a background color
 * @param hex - Background hex color
 * @returns "#000000" or "#FFFFFF"
 */
export function contrastColor(hex: string): string {
  const cleanHex = hex.replace("#", "");
  
  // Parse hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Lighten a hex color by a percentage
 * @param hex - Hex color string
 * @param percent - Amount to lighten (0-100)
 */
export function lighten(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  const amount = Math.max(0, Math.min(100, percent)) / 100;
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));
  
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

/**
 * Darken a hex color by a percentage
 * @param hex - Hex color string
 * @param percent - Amount to darken (0-100)
 */
export function darken(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "");
  const amount = Math.max(0, Math.min(100, percent)) / 100;
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  const newR = Math.max(0, Math.round(r * (1 - amount)));
  const newG = Math.max(0, Math.round(g * (1 - amount)));
  const newB = Math.max(0, Math.round(b * (1 - amount)));
  
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

// ===== THEME OBJECT =====

let currentMode: ThemeMode = "dark"; // Default to dark mode for Stitch design

/**
 * Get current theme colors based on mode
 */
function getColors(mode: ThemeMode) {
  return mode === "light" ? lightColors : darkColors;
}

/**
 * Main theme object - use this in components
 */
export const theme = {
  mode: currentMode,
  colors: getColors(currentMode),
  typography,
  spacing,
  radii,
  shadows,
  elevation,
  components,
  accessibility,
  
  /**
   * Toggle between light and dark mode
   * NOTE: In production, call this and trigger a re-render of root component
   */
  setMode(mode: ThemeMode) {
    currentMode = mode;
    this.mode = mode;
    this.colors = getColors(mode);
  },
  
  /**
   * Get current mode
   */
  getMode(): ThemeMode {
    return currentMode;
  },
};

// ===== NAMED EXPORTS =====
// For direct access to tokens without theme object

export const colors = theme.colors;

// Re-export all tokens for convenience
export { lightColors, darkColors, basePalette };

// ===== TYPE EXPORTS =====

export type Colors = typeof lightColors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Shadows = typeof shadows;
export type Theme = typeof theme;

// ===== DEFAULT EXPORT =====

export default theme;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Import and use colors:
 *    import { colors, spacing } from '@/theme';
 *    <View style={{ backgroundColor: colors.surface, padding: spacing.md }}>
 * 
 * 2. Use typography:
 *    import { typography } from '@/theme';
 *    <Text style={typography.h1}>Title</Text>
 * 
 * 3. Apply shadows:
 *    import { shadows } from '@/theme';
 *    <View style={[styles.card, shadows.md]}>
 * 
 * 4. Helper functions:
 *    import { applyOpacity, contrastColor } from '@/theme';
 *    backgroundColor: applyOpacity(colors.primary, 50)
 *    color: contrastColor(colors.primary)
 * 
 * 5. Toggle theme:
 *    import theme from '@/theme';
 *    theme.setMode('dark');
 *    // Then re-render your app to apply new colors
 * 
 * 6. Component tokens:
 *    import { components } from '@/theme';
 *    height: components.button.height
 */

