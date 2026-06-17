---
name: PayShift
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#414755'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#4c4aca'
  on-secondary: '#ffffff'
  secondary-container: '#6664e4'
  on-secondary-container: '#fffbff'
  tertiary: '#006b27'
  on-tertiary: '#ffffff'
  tertiary-container: '#008733'
  on-tertiary-container: '#f7fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#3631b4'
  tertiary-fixed: '#72fe88'
  tertiary-fixed-dim: '#53e16f'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#00531c'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  display:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
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
  container-padding: 20px
  gutter: 16px
---

## Brand & Style
The design system is centered on clarity, reliability, and modern efficiency for the workforce. The brand personality is professional yet approachable, aiming to reduce the cognitive load of tracking earnings and hours. 

The aesthetic leverages **Modern Corporate** principles with subtle **Glassmorphism** accents to provide depth without clutter. The interface feels "light and airy" by utilizing generous whitespace and a soft background tint that prevents eye strain. High-contrast typography ensures essential data—like hourly rates and total pay—is immediately legible at a glance, even in high-movement environments.

## Colors
The palette is rooted in a crisp, energetic blue that signals action and trust. 

- **Primary (#007AFF):** Used for main actions, active states, and progress indicators.
- **Background (#F2F7FF):** A very light blue tint that differentiates the app from generic white interfaces while maintaining a clean look.
- **Surface (#FFFFFF):** Pure white tiles are used for content containers to create a "floating" effect over the tinted background.
- **Success (#34C759):** Used for completed shifts and finalized payments.
- **Text:** High-contrast dark slate is used for body text, ensuring the "airy" design doesn't sacrifice accessibility.

## Typography
Manrope is the sole typeface for the design system, chosen for its geometric balance and excellent legibility in numerical data.

- **Headings:** Use Bold (700) or ExtraBold (800) weights with slight negative letter-spacing to create a strong visual anchor.
- **Data Points:** Currency and hour totals should use `title-md` or `headline-lg` to ensure they are the primary focal point.
- **Labels:** Small caps with increased letter-spacing are used for secondary metadata (e.g., "SHIFT DURATION" or "TAX ESTIMATE") to provide hierarchy without using heavy weights.

## Layout & Spacing
The layout follows a **fluid grid** model with fixed safe-area margins. 

- **Grid:** A 12-column grid is used for desktop, collapsing to 1 column for mobile. 
- **Rhythm:** An 8px linear scale governs all padding and margins. 
- **Containment:** Content is housed in "tiles." On mobile, these tiles typically span the full width minus the 20px container padding. On larger screens, tiles are organized into a masonry or dashboard-style layout to maximize information density without crowding.
- **Touch Targets:** All interactive elements maintain a minimum height of 48px to accommodate quick input during shift changes.

## Elevation & Depth
Depth is created through a combination of soft shadows and glassmorphic overlays.

- **Soft Shadows:** White tiles use a multi-layered, low-opacity shadow (Color: #0040FF at 4% opacity, Blur: 20px, Y: 8px) to create a "lifted" effect from the tinted background.
- **Glassmorphism:** Navigation bars and floating action buttons utilize a 20px backdrop blur with a 70% opaque white fill. A 1px translucent white border is added to these elements to simulate the edge of polished glass.
- **Z-Index Strategy:** 
  - Level 0: Background (#F2F7FF)
  - Level 1: Static White Tiles
  - Level 2: Glassmorphic Nav Bars / Overlays
  - Level 3: Modals and Tooltips

## Shapes
The design system employs an exaggerated roundedness to evoke a friendly, modern, and "app-centric" feel.

- **Large Components (Cards/Tiles):** Use a 24px radius (`2xl`) to define the primary layout containers.
- **Medium Components (Buttons/Inputs):** Use a 12px to 16px radius to maintain a cohesive look with the larger containers while remaining distinct.
- **Small Components (Tags/Chips):** Are fully pill-shaped (rounded-full) to distinguish them as discrete, removable, or filterable items.

## Components

### Buttons
- **Primary:** Solid #007AFF with white text. 16px rounded corners. Slight inner glow on hover.
- **Secondary:** Semi-transparent primary (15% opacity) with #007AFF text.
- **Ghost:** No fill, backdrop-blur effect when placed over imagery or gradients.

### Cards (Tiles)
- Pure white background, 24px radius, and the defined soft shadow.
- Inner padding is consistently 20px (lg).
- Use a 1px border (#E5E9F2) only when the card needs to stand out against white surfaces.

### Input Fields
- Subtle gray-blue stroke (#D1D9E8) that turns Primary Blue on focus.
- Backgrounds are slightly more neutral than the page background to indicate interactivity.

### Chips & Badges
- Used for "Shift Type" (e.g., Night, Overtime).
- Pill-shaped with low-saturation background tints and high-saturation text.

### Progress Gauges
- Thick, rounded strokes for circular earnings trackers.
- Use a gradient from #007AFF to #5856D6 to indicate "filling" or "completing" a goal.

### Modals
- High backdrop blur (30px) on the content behind.
- Modals slide up from the bottom on mobile (drawer style) with a 32px top-radius.