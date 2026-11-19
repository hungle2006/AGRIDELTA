# AGRIDELTA · Living Earth Landing Page

**Live:** https://agridelta.vercel.app  
**Source:** https://github.com/hungle2006/AGRIDELTA

A responsive Vietnamese eco-agriculture web app with a nature-inspired landing page faithfully adapted from the supplied reference image, while retaining the original farm-management demo.

## What's new

- White navigation bar and a redesigned vector logo inspired by two sprouting leaves and soil furrows.
- Original warm sunrise/farm background with realistic mountains, mist, crop rows, and greenhouses.
- Interactive glTF 3D seedling with a replayable **germination reveal**. A transparent photorealistic plant reference is used as fallback while WebGL loads or when unavailable. The GLB is a 3D model created with Trimesh; it is **not** a Blender render or a full rigged growth animation.
- Seamless soil-to-root storytelling: scrolling **progressively draws** the taproot and five branches. Each chapter contains actual instructions and links to the matching working demo screen.
- Five illustrated feature cards using crops from the reference image. Clicking a card opens an accessible step-by-step modal.
- Solutions, sustainability principles, closing call-to-action, and footer; optimized for laptop and mobile with no sidebar on the landing page.
- Existing demo screens and features remain: dashboard, fields, tasks, crop seasons, image upload preview, orders, and sample login/registration.

## Technology

Vite + vanilla JavaScript + CSS, `<model-viewer>` for glTF display, SVG paths animated with scroll progress. No telemetry or analytics are added.

## Local development

Requires Node 22 or newer.

```bash
npm install
npm run dev
```

### Build and tests

```bash
node --check main.js
node --check root-guide.js
node --test tests/*.test.mjs
npm run build
```

When developing offline, fonts and the 3D model-viewer CDN need network access; the layout/photo fallback still work if model-viewer cannot load.

## File structure

| Path | Purpose |
|------|---------|
| `root-guide.js` / `root-guide.css` | Landing page, living roots, chapter guides and feature cards |
| `main.js` / `style.css` | Existing canh tác dashboard and demo workflows |
| `public/assets/sunrise-farm.webp` | AI-generated dawn farmland background, no baked text |
| `public/assets/seedling-photo.png` | Photographic seedling cutout from the user-selected image (fallback, not Blender) |
| `public/assets/agridelta_seed_to_harvest_model.glb` | Interactive static GLB model |
| `public/assets/guide-*.webp` | Five guide images from the selected design |
| `public/assets/agridelta-icon.svg` | New leaf logo favicon |
| `blender/seed_to_harvest.py` | Separate Blender 4.x animation authoring script |

## Blender caveat

The existing Blender script can produce a scene and animation when executed on a machine with Blender installed:

```bash
blender --background --python blender/seed_to_harvest.py
```

The live page currently uses a **static glTF 3D model animated as an entire object by CSS** (a germination-style entrance) and a separate SVG root-drawing effect on scroll. A true physically based Blender-authored animated `.glb` with plant parts growing independently is not yet exported to the site.

## Important: demo limitations

This is a public **frontend prototype**, not a real farm data service. Login/registration and changes are stored in the browser; no secure backend, user authorization or server-side database has been configured. **Never enter real credentials, personal data, private farm records, customer orders, or confidential images.** All field/sensor values are mock values and the image observation tool does not diagnose disease.

## Deploy

The `main` branch is connected to the existing Vercel project `agridelta`, serving the existing production domain. GitHub Actions validates the code, and Vercel builds/deploys updates on push. Keep project ownership and domain unchanged.

## Visual QA

Validated by an isolated Chromium render at viewport widths 1440, 390, and 320 px: zero horizontal overflow, five guide chapters, ten root SVG segments, modal interactions, demo navigation, and no runtime JavaScript errors. Production asset fetch and Vercel build should be checked after release. Browser testing that relies on CDN/WebGL can vary by device and connectivity.
