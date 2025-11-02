# 🎨 Sprint100 Figma Style Tokens

**Export Date:** 2025-01-27  
**Purpose:** Import-ready design tokens for Figma, ensuring design-to-code consistency  
**Format:** JSON (compatible with Figma Variables and Tokens Studio)

---

## 📦 Export Instructions

1. **For Figma Variables:**
   - Copy JSON below into Figma → Design → Variables → Import JSON
   - Or use Figma Tokens plugin (https://www.figma.com/community/plugin/843461159747178946)

2. **For Tokens Studio:**
   - Save as `tokens.json` in your Tokens Studio project
   - Sync with Figma using the Tokens Studio plugin

3. **For React Native:**
   - This JSON matches `/client/src/theme.ts` structure
   - Use as reference when updating theme.ts

---

## 🎨 Complete Style Tokens JSON

```json
{
  "$schema": "https://schemas.tokens.studio/v1",
  "version": "1.0.0",
  "name": "Sprint100 Design Tokens",
  "description": "Complete design system tokens for Sprint100 mobile app",
  
  "colors": {
    "basePalette": {
      "primary": {
        "value": "#007AFF",
        "type": "color",
        "description": "Bold blue for main actions"
      },
      "primaryDark": {
        "value": "#0051D5",
        "type": "color"
      },
      "primaryLight": {
        "value": "#4DA3FF",
        "type": "color"
      },
      "secondary": {
        "value": "#34C759",
        "type": "color",
        "description": "Energetic green for success/positive"
      },
      "secondaryDark": {
        "value": "#248A3D",
        "type": "color"
      },
      "secondaryLight": {
        "value": "#5DD97C",
        "type": "color"
      },
      "accent": {
        "value": "#00E0FF",
        "type": "color",
        "description": "Electric blue for Stitch design"
      },
      "accentDark": {
        "value": "#00B8D4",
        "type": "color"
      },
      "accentLight": {
        "value": "#40E6FF",
        "type": "color"
      },
      "danger": {
        "value": "#FF3B30",
        "type": "color",
        "description": "Red for warnings/errors"
      },
      "dangerDark": {
        "value": "#CC2E24",
        "type": "color"
      },
      "dangerLight": {
        "value": "#FF5F56",
        "type": "color"
      },
      "warning": {
        "value": "#FFCC00",
        "type": "color",
        "description": "Yellow for caution"
      },
      "warningDark": {
        "value": "#E6B800",
        "type": "color"
      },
      "warningLight": {
        "value": "#FFD633",
        "type": "color"
      },
      "black": {
        "value": "#000000",
        "type": "color"
      },
      "white": {
        "value": "#FFFFFF",
        "type": "color"
      },
      "gray100": {
        "value": "#F5F5F5",
        "type": "color"
      },
      "gray200": {
        "value": "#E5E5E5",
        "type": "color"
      },
      "gray300": {
        "value": "#D4D4D4",
        "type": "color"
      },
      "gray400": {
        "value": "#A3A3A3",
        "type": "color"
      },
      "gray500": {
        "value": "#737373",
        "type": "color"
      },
      "gray600": {
        "value": "#525252",
        "type": "color"
      },
      "gray700": {
        "value": "#404040",
        "type": "color"
      },
      "gray800": {
        "value": "#262626",
        "type": "color"
      },
      "gray900": {
        "value": "#171717",
        "type": "color"
      }
    },
    
    "dark": {
      "primary": {
        "value": "{basePalette.primaryLight}",
        "type": "color"
      },
      "secondary": {
        "value": "{basePalette.secondaryLight}",
        "type": "color"
      },
      "accent": {
        "value": "{basePalette.accent}",
        "type": "color"
      },
      "success": {
        "value": "{basePalette.secondaryLight}",
        "type": "color"
      },
      "warning": {
        "value": "{basePalette.warningLight}",
        "type": "color"
      },
      "danger": {
        "value": "{basePalette.dangerLight}",
        "type": "color"
      },
      "background": {
        "value": "#0A0A0A",
        "type": "color",
        "description": "Very dark background"
      },
      "surface": {
        "value": "{basePalette.gray900}",
        "type": "color"
      },
      "card": {
        "value": "#121212",
        "type": "color",
        "description": "Slightly lighter than background"
      },
      "text": {
        "value": "{basePalette.white}",
        "type": "color"
      },
      "textSecondary": {
        "value": "#CCCCCC",
        "type": "color",
        "description": "WCAG 2.1 AA compliant (4.5:1 contrast)"
      },
      "textMuted": {
        "value": "#B0B0B0",
        "type": "color",
        "description": "WCAG 2.1 AA compliant"
      },
      "textInverse": {
        "value": "{basePalette.gray900}",
        "type": "color"
      },
      "border": {
        "value": "{basePalette.gray700}",
        "type": "color"
      },
      "divider": {
        "value": "{basePalette.gray800}",
        "type": "color"
      },
      "placeholder": {
        "value": "{basePalette.gray500}",
        "type": "color"
      },
      "disabled": {
        "value": "{basePalette.gray700}",
        "type": "color"
      },
      "online": {
        "value": "{basePalette.secondaryLight}",
        "type": "color"
      },
      "offline": {
        "value": "{basePalette.gray600}",
        "type": "color"
      },
      "overlay": {
        "value": "rgba(0, 0, 0, 0.7)",
        "type": "color"
      },
      "overlayLight": {
        "value": "rgba(0, 0, 0, 0.5)",
        "type": "color"
      }
    },
    
    "light": {
      "primary": {
        "value": "{basePalette.primary}",
        "type": "color"
      },
      "secondary": {
        "value": "{basePalette.secondary}",
        "type": "color"
      },
      "accent": {
        "value": "{basePalette.accent}",
        "type": "color"
      },
      "success": {
        "value": "{basePalette.secondary}",
        "type": "color"
      },
      "warning": {
        "value": "{basePalette.warning}",
        "type": "color"
      },
      "danger": {
        "value": "{basePalette.danger}",
        "type": "color"
      },
      "background": {
        "value": "{basePalette.white}",
        "type": "color"
      },
      "surface": {
        "value": "{basePalette.white}",
        "type": "color"
      },
      "card": {
        "value": "{basePalette.gray100}",
        "type": "color"
      },
      "text": {
        "value": "{basePalette.gray900}",
        "type": "color"
      },
      "textSecondary": {
        "value": "{basePalette.gray600}",
        "type": "color"
      },
      "textMuted": {
        "value": "{basePalette.gray400}",
        "type": "color"
      },
      "textInverse": {
        "value": "{basePalette.white}",
        "type": "color"
      },
      "border": {
        "value": "{basePalette.gray300}",
        "type": "color"
      },
      "divider": {
        "value": "{basePalette.gray200}",
        "type": "color"
      },
      "placeholder": {
        "value": "{basePalette.gray400}",
        "type": "color"
      },
      "disabled": {
        "value": "{basePalette.gray300}",
        "type": "color"
      },
      "online": {
        "value": "{basePalette.secondary}",
        "type": "color"
      },
      "offline": {
        "value": "{basePalette.gray400}",
        "type": "color"
      },
      "overlay": {
        "value": "rgba(0, 0, 0, 0.5)",
        "type": "color"
      },
      "overlayLight": {
        "value": "rgba(0, 0, 0, 0.3)",
        "type": "color"
      }
    }
  },
  
  "typography": {
    "fontSizes": {
      "xs": {
        "value": "12",
        "type": "dimension",
        "unit": "px"
      },
      "sm": {
        "value": "14",
        "type": "dimension",
        "unit": "px"
      },
      "base": {
        "value": "16",
        "type": "dimension",
        "unit": "px"
      },
      "lg": {
        "value": "18",
        "type": "dimension",
        "unit": "px"
      },
      "xl": {
        "value": "20",
        "type": "dimension",
        "unit": "px"
      },
      "xxl": {
        "value": "24",
        "type": "dimension",
        "unit": "px"
      },
      "xxxl": {
        "value": "28",
        "type": "dimension",
        "unit": "px"
      },
      "display": {
        "value": "32",
        "type": "dimension",
        "unit": "px"
      },
      "hero": {
        "value": "48",
        "type": "dimension",
        "unit": "px"
      }
    },
    
    "fontWeights": {
      "regular": {
        "value": "400",
        "type": "fontWeight"
      },
      "medium": {
        "value": "500",
        "type": "fontWeight"
      },
      "semibold": {
        "value": "600",
        "type": "fontWeight"
      },
      "bold": {
        "value": "700",
        "type": "fontWeight"
      }
    },
    
    "lineHeights": {
      "tight": {
        "value": "1.2",
        "type": "number"
      },
      "normal": {
        "value": "1.5",
        "type": "number"
      },
      "relaxed": {
        "value": "1.75",
        "type": "number"
      }
    },
    
    "styles": {
      "h1": {
        "fontSize": "{typography.fontSizes.hero}",
        "fontWeight": "{typography.fontWeights.bold}",
        "lineHeight": "{typography.fontSizes.hero} * {typography.lineHeights.tight}",
        "type": "typography"
      },
      "h2": {
        "fontSize": "{typography.fontSizes.display}",
        "fontWeight": "{typography.fontWeights.bold}",
        "lineHeight": "{typography.fontSizes.display} * {typography.lineHeights.tight}",
        "type": "typography"
      },
      "h3": {
        "fontSize": "{typography.fontSizes.xxxl}",
        "fontWeight": "{typography.fontWeights.semibold}",
        "lineHeight": "{typography.fontSizes.xxxl} * {typography.lineHeights.normal}",
        "type": "typography"
      },
      "h4": {
        "fontSize": "{typography.fontSizes.xxl}",
        "fontWeight": "{typography.fontWeights.semibold}",
        "lineHeight": "{typography.fontSizes.xxl} * {typography.lineHeights.normal}",
        "type": "typography"
      },
      "body": {
        "fontSize": "{typography.fontSizes.base}",
        "fontWeight": "{typography.fontWeights.regular}",
        "lineHeight": "{typography.fontSizes.base} * {typography.lineHeights.normal}",
        "type": "typography"
      },
      "bodyLarge": {
        "fontSize": "{typography.fontSizes.lg}",
        "fontWeight": "{typography.fontWeights.regular}",
        "lineHeight": "{typography.fontSizes.lg} * {typography.lineHeights.normal}",
        "type": "typography"
      },
      "bodySmall": {
        "fontSize": "{typography.fontSizes.sm}",
        "fontWeight": "{typography.fontWeights.regular}",
        "lineHeight": "{typography.fontSizes.sm} * {typography.lineHeights.normal}",
        "type": "typography"
      },
      "label": {
        "fontSize": "{typography.fontSizes.sm}",
        "fontWeight": "{typography.fontWeights.medium}",
        "lineHeight": "{typography.fontSizes.sm} * {typography.lineHeights.normal}",
        "type": "typography"
      },
      "caption": {
        "fontSize": "{typography.fontSizes.xs}",
        "fontWeight": "{typography.fontWeights.regular}",
        "lineHeight": "{typography.fontSizes.xs} * {typography.lineHeights.normal}",
        "type": "typography"
      }
    }
  },
  
  "spacing": {
    "sp0.5": {
      "value": "4",
      "type": "dimension",
      "unit": "px",
      "description": "0.5 × 8px grid"
    },
    "sp1": {
      "value": "8",
      "type": "dimension",
      "unit": "px",
      "description": "1 × 8px grid base unit"
    },
    "sp1.5": {
      "value": "12",
      "type": "dimension",
      "unit": "px",
      "description": "1.5 × 8px grid"
    },
    "sp2": {
      "value": "16",
      "type": "dimension",
      "unit": "px",
      "description": "2 × 8px grid"
    },
    "sp2.5": {
      "value": "20",
      "type": "dimension",
      "unit": "px",
      "description": "2.5 × 8px grid (for exceptions)"
    },
    "sp3": {
      "value": "24",
      "type": "dimension",
      "unit": "px",
      "description": "3 × 8px grid"
    },
    "sp4": {
      "value": "32",
      "type": "dimension",
      "unit": "px",
      "description": "4 × 8px grid"
    },
    "sp5": {
      "value": "40",
      "type": "dimension",
      "unit": "px",
      "description": "5 × 8px grid"
    },
    "sp6": {
      "value": "48",
      "type": "dimension",
      "unit": "px",
      "description": "6 × 8px grid"
    },
    "sp8": {
      "value": "64",
      "type": "dimension",
      "unit": "px",
      "description": "8 × 8px grid"
    },
    "sp10": {
      "value": "80",
      "type": "dimension",
      "unit": "px",
      "description": "10 × 8px grid"
    },
    "sp12": {
      "value": "96",
      "type": "dimension",
      "unit": "px",
      "description": "12 × 8px grid"
    },
    "cardPadding": {
      "value": "{spacing.sp3}",
      "type": "dimension",
      "unit": "px"
    },
    "screenPadding": {
      "value": "{spacing.sp3}",
      "type": "dimension",
      "unit": "px"
    }
  },
  
  "radii": {
    "none": {
      "value": "0",
      "type": "dimension",
      "unit": "px"
    },
    "sm": {
      "value": "4",
      "type": "dimension",
      "unit": "px"
    },
    "base": {
      "value": "8",
      "type": "dimension",
      "unit": "px"
    },
    "md": {
      "value": "12",
      "type": "dimension",
      "unit": "px"
    },
    "lg": {
      "value": "16",
      "type": "dimension",
      "unit": "px"
    },
    "xl": {
      "value": "24",
      "type": "dimension",
      "unit": "px"
    },
    "full": {
      "value": "9999",
      "type": "dimension",
      "unit": "px",
      "description": "Fully rounded (pills)"
    },
    "button": {
      "value": "{radii.base}",
      "type": "dimension",
      "unit": "px"
    },
    "card": {
      "value": "{radii.md}",
      "type": "dimension",
      "unit": "px"
    },
    "input": {
      "value": "{radii.base}",
      "type": "dimension",
      "unit": "px"
    },
    "modal": {
      "value": "{radii.lg}",
      "type": "dimension",
      "unit": "px"
    }
  },
  
  "shadows": {
    "none": {
      "shadowColor": "#000000",
      "shadowOffsetX": "0",
      "shadowOffsetY": "0",
      "shadowBlur": "0",
      "shadowOpacity": "0",
      "elevation": "0",
      "type": "shadow"
    },
    "sm": {
      "shadowColor": "#000000",
      "shadowOffsetX": "0",
      "shadowOffsetY": "1",
      "shadowBlur": "1",
      "shadowOpacity": "0.18",
      "elevation": "1",
      "type": "shadow"
    },
    "base": {
      "shadowColor": "#000000",
      "shadowOffsetX": "0",
      "shadowOffsetY": "2",
      "shadowBlur": "2.62",
      "shadowOpacity": "0.23",
      "elevation": "4",
      "type": "shadow"
    },
    "md": {
      "shadowColor": "#000000",
      "shadowOffsetX": "0",
      "shadowOffsetY": "4",
      "shadowBlur": "4.65",
      "shadowOpacity": "0.3",
      "elevation": "8",
      "type": "shadow"
    },
    "lg": {
      "shadowColor": "#000000",
      "shadowOffsetX": "0",
      "shadowOffsetY": "6",
      "shadowBlur": "7.49",
      "shadowOpacity": "0.37",
      "elevation": "12",
      "type": "shadow"
    },
    "xl": {
      "shadowColor": "#000000",
      "shadowOffsetX": "0",
      "shadowOffsetY": "10",
      "shadowBlur": "10.32",
      "shadowOpacity": "0.44",
      "elevation": "16",
      "type": "shadow"
    }
  },
  
  "components": {
    "button": {
      "height": {
        "value": "48",
        "type": "dimension",
        "unit": "px",
        "description": "≥44px for accessibility"
      },
      "heightSmall": {
        "value": "44",
        "type": "dimension",
        "unit": "px",
        "description": "Minimum touch target size"
      },
      "heightLarge": {
        "value": "56",
        "type": "dimension",
        "unit": "px"
      },
      "borderRadius": {
        "value": "{radii.button}",
        "type": "dimension",
        "unit": "px"
      },
      "paddingHorizontal": {
        "value": "{spacing.sp4}",
        "type": "dimension",
        "unit": "px"
      },
      "paddingVertical": {
        "value": "{spacing.sp3}",
        "type": "dimension",
        "unit": "px"
      }
    },
    "input": {
      "height": {
        "value": "48",
        "type": "dimension",
        "unit": "px"
      },
      "borderRadius": {
        "value": "{radii.input}",
        "type": "dimension",
        "unit": "px"
      },
      "borderWidth": {
        "value": "1",
        "type": "dimension",
        "unit": "px"
      },
      "paddingHorizontal": {
        "value": "{spacing.sp1.5}",
        "type": "dimension",
        "unit": "px"
      }
    },
    "card": {
      "borderRadius": {
        "value": "{radii.card}",
        "type": "dimension",
        "unit": "px"
      },
      "padding": {
        "value": "{spacing.cardPadding}",
        "type": "dimension",
        "unit": "px"
      }
    },
    "header": {
      "height": {
        "value": "60",
        "type": "dimension",
        "unit": "px"
      }
    },
    "tabBar": {
      "height": {
        "value": "60",
        "type": "dimension",
        "unit": "px"
      }
    }
  },
  
  "accessibility": {
    "minContrastRatio": {
      "normal": {
        "value": "4.5",
        "type": "number",
        "description": "WCAG 2.1 AA for normal text (≤18pt regular, ≤14pt bold)"
      },
      "large": {
        "value": "3.0",
        "type": "number",
        "description": "WCAG 2.1 AA for large text (>18pt regular, >14pt bold)"
      }
    },
    "minTouchTarget": {
      "value": "44",
      "type": "dimension",
      "unit": "px",
      "description": "iOS and Android guidelines"
    },
    "hitSlop": {
      "top": {
        "value": "10",
        "type": "dimension",
        "unit": "px"
      },
      "bottom": {
        "value": "10",
        "type": "dimension",
        "unit": "px"
      },
      "left": {
        "value": "10",
        "type": "dimension",
        "unit": "px"
      },
      "right": {
        "value": "10",
        "type": "dimension",
        "unit": "px"
      }
    },
    "allowFontScaling": {
      "value": "true",
      "type": "boolean"
    },
    "adjustsFontSizeToFit": {
      "value": "true",
      "type": "boolean"
    }
  }
}
```

---

## 📐 Usage in Figma

### **Colors**
- Create color variables for `colors.dark.*` and `colors.light.*`
- Set default mode to "dark" for Sprint100
- Use color tokens in all components (buttons, cards, text, etc.)

### **Typography**
- Create text styles matching `typography.styles.*` (h1, h2, h3, h4, body, etc.)
- Use font size tokens from `typography.fontSizes.*`
- Use font weight tokens from `typography.fontWeights.*`

### **Spacing**
- Create spacing tokens from `spacing.*` (sp1, sp2, sp3, etc.)
- Use 8px grid for all padding and margins
- Document exceptions (e.g., `sp2.5: 20` for legacy screens)

### **Border Radius**
- Use `radii.*` tokens for all rounded corners
- Standard: buttons = `radii.base` (8px), cards = `radii.card` (12px), modals = `radii.modal` (16px)

### **Shadows**
- Use `shadows.*` tokens for all elevation
- Standard: buttons = `shadows.sm` or `shadows.base`, cards = `shadows.base` or `shadows.md`, modals = `shadows.md` or `shadows.lg`

---

## 🔄 Sync with Code

**Current Status:** ✅ Tokens match `/client/src/theme.ts`  
**Update Process:**
1. Designer updates tokens in Figma
2. Export updated JSON
3. Developer updates `theme.ts` to match
4. Run visual regression tests

---

## 📝 Notes

- **Base Grid:** All spacing values are multiples of 8px (except documented exceptions)
- **Accessibility:** All text colors meet WCAG 2.1 AA contrast ratios
- **Touch Targets:** All interactive elements are ≥44×44px
- **Dark Mode:** Default mode is "dark" (Stitch design)
- **Light Mode:** Available for future use

---

**Last Updated:** 2025-01-27  
**Maintained By:** Design System Team

