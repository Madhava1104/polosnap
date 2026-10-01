# 📸 PoloSnap Studio

<div align="center">

![PoloSnap Studio Banner](https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80)

### Ultimate Aesthetic Polaroid & Vintage Instant Photo Creator

**Transform digital shots into nostalgic, tactile Polaroid and Instax prints right in your browser.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-polosnap.yashikaprints.store-amber?style=for-the-badge&logo=google-chrome&logoColor=white)](https://polosnap.yashikaprints.store)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[**Explore Live Website**](https://polosnap.yashikaprints.store) • [**Features**](#-features) • [**Shortcuts**](#-keyboard-shortcuts) • [**Tech Stack**](#-tech-stack) • [**Getting Started**](#-getting-started) • [**License**](#-license)

</div>

---

## 🌟 Overview

**PoloSnap Studio** is a studio-grade, client-side vintage instant photo editor and collage creator. Designed with rich micro-interactions and realistic rendering physics, PoloSnap allows you to craft authentic Polaroid, Instax, and vintage postcard keepsakes with authentic analog camera filters, paper textures, film grain, light leaks, tape stickers, handwritten captions, and double-sided postcard flips.

🌐 **Live Application:** [**https://polosnap.yashikaprints.store**](https://polosnap.yashikaprints.store)

---

## ✨ Features

### 🎞️ 1. Authentic Instant Camera Formats
- **Classic Polaroid**: Authentic $88 \times 107\text{ mm}$ format with signature wide bottom margin.
- **Instax Mini**: Pocket portrait format ($2.1 \times 3.4\text{ in}$) with a 3:4 aspect ratio.
- **Instax Wide**: Landscape format ($4.25 \times 3.4\text{ in}$) with a 4:3 aspect ratio.
- **Square Modern**: Symmetrical 1:1 square frame for contemporary aesthetics.
- **Vintage Postcard**: Nostalgic 3:2 postal proportions.

### 🎨 2. Analog Film Filters & Film Grain Engine
- **Curated Film Profiles**: *70s Vintage*, *Kodak Gold 90s*, *Classic Sepia*, *Noir B&W*, *Faded Memories*, *Neon Cyberpunk*, *Cool Drift*, and *Golden Sunset*.
- **GPU-Accelerated Grain Engine**: Offscreen pattern caching simulates authentic analog film noise without performance drops.
- **Light Leaks & Flares**: Corner sunbursts, retro anamorphic flares, prism rainbows, burnt film edges, and dual neon leaks.
- **Vignette & Lens Blur**: Custom radial falloff and optical depth-of-field simulation.
- **1-Click Auto-Enhance**: Automatically adjusts contrast, warmth, and saturation for ideal retro tones.

### ✍️ 3. Handwritten Typography & Date Stamps
- **9 Retro & Cursive Fonts**: Includes *Caveat*, *Permanent Marker*, *Indie Flower*, *Courier Prime (Typewriter)*, *Dancing Script*, *Shadows Into Light*, *Reenie Beanie*, *Kalam*, and *VT323 (Digital LED)*.
- **90s Camcorder Date Stamp**: Authentic glowing orange timestamp with customizable retro dates (e.g. `'98 04 22`).
- **Flexible Caption Styling**: Adjust font size, text rotation, color picker, and text alignment.

### 💌 4. Double-Sided 3D Postcard Flip
- Press <kbd>F</kbd> or click the flip button to turn your Polaroid around.
- Write a personalized vintage handwritten back-note.
- Complete with retro postage stamp, postal airmail cancellation marks, barcode, and aged paper texture.

### 🖼️ 5. Frame Textures, Borders & Washed Tape
- **Tactile Paper Textures**: *Heavy Cotton Paper*, *Woven Canvas*, *Smooth Satin*, and *Distressed Scratched Paper*.
- **Washi & Masking Tapes**: *Classic Masking Tape*, *Aged Yellow Tape*, *Pastel Pink Washi*, *Minimal Grid*, *Black Electrical Duct Tape*, and *Holographic Silver*.
- **Tape Placement**: Top center, tilted corners, cross center, or edge angles.
- **Finish Styles**: Matte, glossy reflection, holographic sheen, and satin finish.
- **Stickers & Pins**: Push pins, hearts, sparkles, retro cameras, stamps, and emojis.

### 📐 6. Full Transform & Crop Controls
- Interactive drag-to-pan, zoom slider ($0.5\times$ to $3\times$), fine rotation slider ($-45^\circ$ to $+45^\circ$).
- Horizontal and vertical flipping.
- Fit modes: Cover (fill frame) and Contain (preserve full photo).

### 📷 7. Live Webcam Capture
- Built-in camera modal with real-time video feed.
- Flip between front and rear cameras.
- 3-second snapshot countdown to capture instant selfies directly into your Polaroid frame.

### 🗂️ 8. Batch Collage Studio & Memory Board
Save up to 4 polaroids and display them on interactive themed boards:
- **Layouts**: 2x2 Grid, String Lights with wooden clothespegs, Cozy Scatter, Cork Pinboard with push pins, Retro Film Strip reel, and Diagonal Card Fan.
- **Backdrops**: Dark Studio, Corkboard, Wood Table, Vintage Linen, and Cyber Obsidian.
- Export entire multi-polaroid boards in high resolution or download individual cards.
- Persistent state saved to `localStorage`.

### 💾 9. Print-Ready Ultra HD Export
- **Export Scales**:
  - **1x Standard**: Fast preview for web and messaging.
  - **2x HD**: Crisp resolution for social media posts & stories.
  - **4x Ultra HD**: 300+ DPI print-ready quality for framing and photo printing.
- **Output Formats**: PNG (lossless) and JPEG (optimized).
- **1-Click Clipboard**: Instant copy as image blob for pasting into Discord, Slack, Photoshop, or chats.
- Celebratory confetti celebration on every successful download!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>⌘</kbd> + <kbd>Z</kbd> | **Undo** last change (35-step history) |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | **Redo** undone change |
| <kbd>F</kbd> | **Flip** Polaroid to back / front side |
| <kbd>R</kbd> | Apply a **Random** vintage film filter |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with HMR and custom upload middleware
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Canvas Rendering**: Pure HTML5 Canvas 2D engine with hardware-accelerated grain cache
- **Effects & UI**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Typography**: Google Fonts (*Caveat*, *Courier Prime*, *Dancing Script*, *Indie Flower*, *Outfit*, *Permanent Marker*, *Playfair Display*, *VT323*, *Kalam*, *Reenie Beanie*)
- **Server**: Express.js server for serving static builds and handling large uploads

---

## 📂 Project Structure

```text
polosnap/
├── public/                  # Static assets & public uploads
├── src/
│   ├── assets/              # App images and textures
│   ├── components/
│   │   ├── Controls/        # Modular editor tabs
│   │   │   ├── PresetsTab.jsx      # 1-click aesthetic presets
│   │   │   ├── FrameTab.jsx        # Dimensions, aspect ratios & textures
│   │   │   ├── FilterTab.jsx       # Film grades, grain, warmth & leaks
│   │   │   ├── CaptionTab.jsx      # Fonts, date stamps & back note
│   │   │   ├── DecorationsTab.jsx  # Tape styles, pins, finishes & stickers
│   │   │   └── TransformTab.jsx    # Zoom, crop, rotation & alignment
│   │   ├── BatchCollageModal.jsx   # Multi-polaroid memory board editor
│   │   ├── CameraModal.jsx         # Live webcam selfie capture
│   │   ├── CustomColorPicker.jsx   # Hex, RGB & palette picker
│   │   ├── DownloadModal.jsx       # HD/Ultra export & clipboard copy
│   │   ├── ImageUploader.jsx       # Drag & drop upload + sample selector
│   │   ├── Navbar.jsx              # Header controls & undo/redo buttons
│   │   └── PolaroidCanvas.jsx      # Interactive canvas preview & touch events
│   ├── constants/
│   │   └── presets.js       # Filter definitions, fonts, tapes & presets
│   ├── utils/
│   │   ├── canvasRenderer.js # Core canvas drawing engine (front & back)
│   │   └── uploadHelper.js   # Image processing & upload utilities
│   ├── App.jsx              # Main state container & history manager
│   ├── main.jsx             # React DOM entrypoint
│   └── index.css            # Base Tailwind styles & custom fonts
├── server.js                # Express production server & API endpoint
├── vite.config.js           # Vite configuration & dev upload middleware
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version `18.x` or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/polosnap.git
cd polosnap
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to start creating polaroids.

### 4. Build for production
```bash
npm run build
```

### 5. Run the production server
```bash
npm start
# or node server.js
```
The Express server serves the optimized production bundle and handles image uploads on `http://localhost:5173` (or the configured `PORT`).

---

## 🌐 Live Website

The production version is deployed and accessible at:  
👉 **[https://polosnap.yashikaprints.store](https://polosnap.yashikaprints.store)**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```text
MIT License

Copyright (c) 2026 PoloSnap Studio (polosnap.yashikaprints.store)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">
  <sub>Crafted with ❤️ for vintage photography enthusiasts. Brought to you by <a href="https://polosnap.yashikaprints.store">PoloSnap Studio</a>.</sub>
</div>
