# Japan Experience

A Next.js App Router experience for exploring Japan through cinematic sections, a filmography shelf, an embedded profile, and an interactive 3D model creator.

## Requirements

- Node.js compatible with Next.js 16.4
- npm

## Quick Start

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks and Production

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

Run `npm run build` before `npm run start`.

## Project Structure

```text
app/                       App Router page, root layout, global styles
components/effects/        Scroll-driven effects
components/sections/       Page sections
components/three/          Three.js model viewer
public/assets/fonts/       Local font files
public/assets/icons/       Public SVG icons
public/assets/frames/      Scroll-sequence frames
public/embeds/             Standalone pages loaded in an iframe
public/vendor/draco/       Local Draco decoder for compressed GLB files
public/3D-model/           3D model files
assets/archives/           Source archives not served to visitors
```

## 3D Model Creator

The center stage loads `public/3D-model/model.glb`. Keep the model at this path, or update the loader path in `components/three/model-viewer.tsx` when replacing it. The local Draco decoder is served from `public/vendor/draco/`.

The model rotates automatically. Drag the model or use the arrow keys to rotate it; the playback control pauses or resumes automatic rotation, and reset restores the default view.

## Static Assets

The scroll sequence expects numbered files from `public/assets/frames/frame_001.png` through `frame_150.png`. The original frame archive is kept outside `public/` at `assets/archives/frames_150.zip`.

Place local fonts in `public/assets/fonts/`, iframe documents in `public/embeds/`, and public icons in `public/assets/icons/`.

## Environment Files

No environment variables are currently required. Keep local secrets in an ignored `.env.local` file. Commit only example templates such as `.env.example`, with placeholder values.
