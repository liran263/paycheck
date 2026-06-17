---
name: Modern Utility System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fe'
  surface-container: '#ecedf9'
  surface-container-high: '#e6e8f3'
  surface-container-highest: '#e0e2ed'
  on-surface: '#181c23'
  on-surface-variant: '#414755'
  inverse-surface: '#2d3039'
  inverse-on-surface: '#eef0fc'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#566068'
  on-secondary: '#ffffff'
  secondary-container: '#dae4ee'
  on-secondary-container: '#5c666e'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#dae4ee'
  secondary-fixed-dim: '#bec8d1'
  on-secondary-fixed: '#131d24'
  on-secondary-fixed-variant: '#3e4850'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#e0e2ed'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system is engineered for high-utility productivity tools, focusing on clarity, precision, and ease of use. The brand personality is professional and reliable, yet approachable. By utilizing a **Modern / Corporate** aesthetic with minimalist influences, we prioritize functional density without sacrificing breathing room.

The emotional response should be one of "effortless control." The interface stays out of the way of the user’s data while providing clear, rhythmic feedback through subtle motion and distinct tonal layering.

## Colors

The color palette centers on a core **Light Blue** primary hue, chosen for its association with professional focus and digital clarity. 

In **Light Mode**, we use a clean white background with cool slate neutrals for text and borders. The primary blue is vibrant to draw attention to actionable elements.
In **Dark Mode**, the background shifts to a deep navy-slate. The primary blue is adjusted for higher contrast and luminosity, ensuring accessibility and reduced eye strain. 

Secondary colors are used strictly for subtle background fills or informational chips, never for primary actions.

## Typography

This design system exclusively uses **Manrope** to maintain a modern, geometric, yet highly readable typographic hierarchy. 

We employ a tight vertical rhythm. Headlines use a slightly tighter letter-spacing and heavier weights to anchor sections. Body copy uses the Medium weight for better legibility on high-density screens. All labels for buttons and small metadata should use the `label` levels to ensure they are distinct from narrative text.

## Layout & Spacing

We use an **8px base grid** to ensure mathematical consistency across all layouts. 

- **Desktop/Tablet:** A 12-column fluid grid with 24px gutters. Content should be centered with a max-width of 1200px for readability.
- **Mobile:** A 4-column fluid grid with 16px gutters and 20px side margins. 

Vertical spacing between sections should generally follow the `lg` (24px) or `xl` (32px) units to create clear visual separation without losing the sense of a unified workspace.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** rather than heavy shadows. 

1. **Floor (Level 0):** The main background color.
2. **Surface (Level 1):** Used for cards and primary content blocks. In Light Mode, these have a very subtle 1px border.
3. **Elevated (Level 2):** Used for hover states and menus. Includes a soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)).
4. **Quick Edit Overlays:** These use a backdrop blur (12px) to dim the background content, focusing the user entirely on the task at hand.

## Shapes

The design system uses a **Rounded** shape language to soften the "industrial" feel of data-heavy applications. 

- **Standard Buttons & Inputs:** 0.5rem (8px).
- **Cards & Quick Edit Containers:** 1rem (16px).
- **Small Chips & Badges:** 0.25rem (4px).

Large containers should use the `rounded-xl` (1.5rem / 24px) setting for a modern, friendly appearance on mobile.

## Components

### Buttons
Primary buttons use the `primary_color_hex` with white text. Secondary buttons use the `accent_blue` fill with primary-colored text. All buttons have a minimum height of 44px for touch targets.

### Quick Edit Screen Pattern
This pattern applies to hourly wages, overtime, and the new **Breaks** screen. 
- **Structure:** A focused modal (desktop) or a full-screen drawer (mobile) that slides from the bottom.
- **Header:** Large `headline-md` title with a clear "Close" or "X" in the top right.
- **Input Area:** High-visibility fields. For numeric values (like wages or break durations), use a large font size (24px+) for the input itself.
- **Contextual Labels:** Use `label-sm` above inputs to describe exactly what the user is changing.
- **Action Bar:** A sticky footer containing two buttons: "Cancel" (Ghost/Text style) and "Save Changes" (Primary style, full-width on mobile).

### Cards
Cards should have no background shadow by default, instead using a 1px border. Shadow is only applied when the card is interactive and in a "hover" or "active" state.