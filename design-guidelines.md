# TeleSeha UI/UX Design Guidelines

This document outlines the visual language, styling rules, and CSS properties extracted from the authentic TeleSeha design mockups (Auth/Login screens). 
**Any agent working on this project MUST read and adhere to these guidelines to ensure UI consistency.**

## 1. Core Aesthetic
- **Vibe:** Clean, modern, trustworthy, medical-tech.
- **Key Concepts:** Softness (rounded corners everywhere), depth (soft shadows, glassmorphism), and clarity (high contrast text on clean backgrounds).

## 2. Color Palette
- **Primary Brand Color:** `#007BBD` (Vibrant Blue) - Used for primary buttons, active icons, step indicators, and text highlights.
- **Background Color (Global):** `#F7F9FE` (Very light, cool tinted white) - Used for the main page backgrounds to make white cards pop.
- **Surface Color (Cards):** `#FFFFFF` (Pure White) - Used for form containers and content cards.
- **Text Primary:** `#1F1F1F` (Dark Charcoal) - Used for main headings.
- **Text Secondary/Labels:** `#555555` or similar medium gray.
- **Borders/Dividers:** Very light gray/blue (e.g., `#E2E8F0` or `rgba(0,0,0,0.06)`).
- **Required Asterisk:** Red.

## 3. Depth & Shadows
The design relies heavily on subtle depth rather than flat design or harsh borders.

### Floating Cards (Form Containers)
Cards containing forms (like OTP or Login) float in the center of the right pane with a very soft, diffused shadow.
* **CSS:** `box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.04);`
* **Tailwind:** `shadow-[0_10px_40px_rgba(0,0,0,0.04)]`
* **Border Radius:** Large (e.g., `border-radius: 24px;` or `rounded-3xl`).

### Glassmorphism (Used mainly in illustrative graphics)
The left-side illustrations feature floating elements with a frosted glass effect.
* **Background:** `background: rgba(255, 255, 255, 0.15);` (Semi-transparent white)
* **Blur:** `backdrop-filter: blur(12px);`
* **Border:** `border: 1px solid rgba(255, 255, 255, 0.4);`
* **Shadow:** `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);`
* **Border Radius:** `border-radius: 20px;`

## 4. Components Styling

### Inputs & Select Fields
- **Shape:** Pill-shaped or heavily rounded (e.g., `border-radius: 50px;` or `rounded-full`).
- **Border:** `1px solid #E5E7EB` (Very subtle border). No heavy shadows on default state.
- **Background:** White or very faint gray.
- **Icons:** Input fields frequently contain icons on the left (grayed out usually, primary color when focused).
- **Focus State:** Should transition the border to the Primary Color (`#007BBD`) with a subtle glow.

### Buttons
- **Shape:** Fully rounded / pill-shaped (`border-radius: 9999px;` or `rounded-full`).
- **Primary Button:** 
  - Background: Primary Blue (`#007BBD`).
  - Text: White, Bold.
  - Hover: Needs a smooth transform and shadow (as defined in our global `styles.css` `.btn-shadow`).
- **Secondary/Action Buttons (like "Confirm Pattern" or "Start Again"):**
  - Muted blue backgrounds or white backgrounds with subtle borders.

### Verification Inputs (OTP)
- Square-ish with rounded corners (`rounded-xl`).
- Subtle borders, clear large text centered.

## 5. Layout & Structure (Auth Screens)
- **Split Layout:** 
  - **Left Pane (Visuals):** Takes up ~40-50% of the screen on desktop. Features large, smooth, organic gradients (Teal/Cyan to Blue) merging smoothly. Contains the TeleSeha logo, doctors' images inside glassmorphism frames, and trust badges/text at the bottom.
  - **Right Pane (Action):** Contains the actual form. The background is a very light solid color (`#F7F9FE`). The form is centered within this space.
- **Spacing:** Generous padding everywhere. Elements are not cramped. Use Tailwind `gap-6` or `gap-8` for form spacing.

## 6. Typography
- **Font Family:** 'Nunito Sans' (English) / 'Cairo' (Arabic).
- **Headings:** Bold (`font-bold`), usually `text-[28px]` to `text-[32px]`.
- **Form Labels:** Medium/Regular weight, smaller size (`text-[14px]`).

## Instructions for Agents
When generating new UI components or pages:
1. NEVER use generic Bootstrap-style hard shadows. Always use the soft `rgba(0,0,0,0.04)` shadows.
2. ALWAYS use highly rounded corners (`rounded-full` for inputs/buttons, `rounded-3xl` for cards).
3. Do not clutter the UI with borders. Rely on spacing and soft shadows to separate elements.
4. Ensure text inputs have icons if applicable, and maintain the clean, rounded-pill aesthetic.
