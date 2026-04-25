**Repository Overview**
- **Purpose:** 3D portfolio gallery using React + Three.js (React Three Fiber) with behavior-driven UX patterns (grayscale→color reveal, ambient rotation, spotlighting).
- **Entry points:** `src/main.tsx` -> `src/App.tsx` -> `src/components/Gallery3D.tsx` which composes `ImageCard`, `CategoryFilter`, and `ReducedMotionToggle`.

**Quick Commands**
- Install: `npm install`
- Dev server: `npm run dev` (Vite)
- Build: `npm run build` (runs `tsc` then `vite build`)
- Preview: `npm run preview`

**High-level Architecture & Data Flow**
- `src/data/galleryData.json` contains the canonical image list. `App.tsx` imports this and passes `images` into `Gallery3D`.
- `Gallery3D` maps `images` → `<ImageCard />`. Hover state is centralized in `Gallery3D` and passed down via props (`isHovered`, `hoveredId`, `onHover`).
- Image lifecycle: thumbnails live in `public/assets/thumbs/`, full images in `public/assets/full/`. `ImageCard` swaps `thumbURL` → `fullURL` on hover and shows metadata via `<Html>`.
- Preloading & caching is implemented in `src/hooks/useImagePreloader.ts` (initial batch, on-hover full image preload, nearby-image prefetch queue).
- Reduced-motion behavior comes from `src/hooks/useReducedMotion.ts` and the `ReducedMotionToggle` component; UI responds by reducing rotation and animation durations.

**Project-specific Conventions**
- Filenames & IDs: image objects use `id` strings (e.g. "001"), and URLs are absolute under `/assets/...` in `galleryData.json`.
- Categories: union type defined in `src/types/index.ts`; `Gallery3D` derives category list with `new Set(images.map(img => img.category))`.
- Thumbnail strategy: thumbnails are desaturated WebP in `public/assets/thumbs/` and are expected to be ~300x200 and <50KB; full images in `public/assets/full/` around 1200x800.
- Initial preload: `useImagePreloader` preloads `images.slice(0,30)` on mount — adjust there if you expect different batch sizes.

**Key Implementation Patterns**
- 3D scene: uses `@react-three/fiber` `Canvas` with `OrbitControls` and `Environment` from `@react-three/drei` (see `Gallery3D.tsx`).
- Per-card animation: `ImageCard.tsx` uses `useFrame` for ambient rotation, `framer-motion` + `<Html>` for hover overlays, and manual `Image` swapping with onload handlers.
- Pointer events: `onPointerEnter`/`onPointerLeave` are used to set centralized hover state (do not rely on DOM hover CSS for logic).
- Error handling: image load failures are logged with `console.warn` in `ImageCard` and `useImagePreloader` — there is no global error UI.

**Integration & External Dependencies**
- Core libs: `react@19`, `typescript`, `vite`, `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion` (see `package.json`).
- Build: Vite config is minimal (`vite.config.ts`) using `@vitejs/plugin-react` — no special build hooks.

**Developer Tips for Edits & Debugging**
- When changing image layout or physics, edit `Gallery3D` and `ImageCard` together — position math (phi/theta/radius) is in `ImageCard.tsx`.
- To test with placeholder images, open `generate-placeholders.html` in a browser and move generated files into `public/assets/thumbs/` and `public/assets/full/` as described in `README.md`.
- WebGL issues: run `npm run dev` and open in a modern browser with WebGL enabled. Check console for failed image loads and CORS errors for `public/assets` paths.
- Type changes: interfaces live in `src/types/index.ts`. Update union categories there when adding new categories.

**What to preserve when editing**
- Keep `useImagePreloader`'s cache and queue behavior unless intentionally changing preload semantics.
- Maintain the `prefers-reduced-motion` integration (both system and manual toggle) to preserve accessibility expectations.

If anything in these notes is unclear or you want more detail (tests, CI, or component-level documentation), tell me which area to expand and I will iterate.
