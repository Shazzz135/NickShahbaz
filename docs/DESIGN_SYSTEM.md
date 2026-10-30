# Design System & Token Specifications

## 1. Color Palette

The visual identity is defined by a high-contrast dark theme energized by crimson reds and crisp pure whites. No empty dead space—sections utilize subtle grid lines, ambient radial glows, and interactive particle fields.

### Core Tokens
- **Background Deep**: `#08080A` (Primary Canvas)
- **Background Surface / Card**: `#0F0F12` (Card surface, Elevated UI)
- **Background Glass**: `rgba(18, 18, 22, 0.75)` with `backdrop-filter: blur(16px)`
- **Border Default**: `rgba(255, 255, 255, 0.08)`
- **Border Crimson**: `rgba(229, 9, 20, 0.4)`
- **Border Active / Hover**: `#FF1E27` (with ambient shadow `0 0 20px rgba(255, 30, 39, 0.3)`)

### Accent Crimson Palette
- **Crimson Glow**: `#FF3B44`
- **Crimson Primary**: `#E50914`
- **Crimson Deep**: `#8B0000`

### Typography & Neutral Contrast
- **Text Primary**: `#FFFFFF` (100% white for bold headlines and primary statements)
- **Text Secondary**: `#A1A1AA` (Cool muted grey for paragraphs and meta labels)
- **Text Crimson**: `#FF4D55` (Badges, keywords, active links)

## 2. Motion Curves & Principles
- **Ease Primary**: `[0.22, 1, 0.36, 1]` (Quintic out for smooth, luxurious deceleration)
- **Magnetic Feel**: Spring physics `{ stiffness: 200, damping: 18 }` for buttons and interactive items
- **Smooth Scroll**: Lenis with `lerp: 0.08` for frictionless momentum
