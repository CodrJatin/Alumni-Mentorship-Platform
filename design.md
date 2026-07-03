---
name: Academic Distinction
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is anchored in a philosophy of **Academic Professionalism** and **Quiet Authority**. It is built for an elite mentorship environment where clarity of information and trust are paramount. The aesthetic is strictly minimalist, utilizing a "Content-First" approach that removes all decorative flourishes to focus on the connection between mentors and students.

The style is **Modern Corporate**, characterized by:
- **Precision:** Perfect alignment and generous, intentional whitespace.
- **Subtlety:** Using hair-line borders and tonal shifts instead of loud colors or heavy shadows.
- **Stability:** A rigid adherence to grid structures to evoke a sense of institutional reliability.

## Colors
The palette is restricted to communicate a serious, focused atmosphere.
- **Primary (#0F172A):** Used for primary text, deep navigation backgrounds, and high-impact brand elements.
- **Accent (#4F46E5):** Reserved strictly for primary calls to action, active states, and highlighting key progress indicators.
- **Neutral (#64748B):** Applied to secondary text, icons, and metadata to maintain a clear hierarchy without visual noise.
- **Surface & Border:** The background is a clean white (#FFFFFF), while all containers are defined by subtle slate borders (#E2E8F0) to maintain structure without adding weight.

## Typography
The system uses **Inter** exclusively to ensure maximum legibility across data-heavy dashboards and long-form forum content.
- **Hierarchy:** High contrast is achieved through weight (SemiBold/Bold for headers) rather than color.
- **Readability:** Body text uses a comfortable 16px base with optimized line heights to prevent eye fatigue during mentorship sessions or reading long posts.
- **Metadata:** Use `label-sm` in all-caps for categories, tags, or status indicators to distinguish them from actionable text.

## Layout & Spacing
The layout follows a **Strict Fluid Grid** system.
- **Grid:** 12-column layout for desktop (max-width 1280px), 8-column for tablet, and 4-column for mobile.
- **Rhythm:** An 8px spatial scale governs all padding and margins. 
- **Dashboards:** Use a "Sidebar + Main Content" structure. The sidebar is fixed at 280px, while the main content area expands.
- **Alignment:** Content is always left-aligned to mimic the structure of academic papers and professional reports.

## Elevation & Depth
This design system avoids heavy shadows and skeuomorphism in favor of **Layered Surfaces**.
- **The Ground:** The primary background is #FFFFFF.
- **Containers:** Mentorship cards and forum items use a 1px solid border (#E2E8F0).
- **Shadows:** Use a single, ultra-soft shadow level for interactive elements (like cards or dropdowns) to indicate hover states: `0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Active State:** Elements do not "lift" significantly; instead, they utilize a subtle change in border color to the Accent Indigo or a slight tonal shift in the background.

## Shapes
To maintain a professional and academic tone, shapes are kept disciplined.
- **Soft Radius:** A 4px (0.25rem) radius is the standard for buttons, inputs, and cards. This provides enough softness to be modern without appearing "bubbly" or casual.
- **Tags/Chips:** Small status indicators use the same 4px radius, never fully rounded capsules, to remain consistent with the architectural feel of the UI.

## Components
- **Cards:** Mentor profiles and forum posts are housed in cards with a white background, a 1px #E2E8F0 border, and `sm` padding. Top-right area is reserved for status badges (e.g., "Available").
- **Buttons:** 
  - *Primary:* Solid Indigo (#4F46E5) with white text. 
  - *Secondary:* White background with 1px #E2E8F0 border and Navy text. 
  - *Tertiary:* Ghost style, Navy text, no border.
- **Data Tables:** High-density, no vertical borders. Rows are separated by 1px #E2E8F0 lines. Header row uses a light slate background (#F8FAFC) and `label-sm` typography.
- **Forms:** Inputs use a 1px border (#E2E8F0). Focus states transition the border to Indigo (#4F46E5) with a 2px soft outer glow. Labels are always positioned above the input.
- **Badges:** Use a light tint of the status color (e.g., light green for "Active") with dark text in `label-sm` for high readability.