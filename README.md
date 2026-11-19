# AGRIDELTA · Reference Earth

Live: https://agridelta.vercel.app

A faithful reconstruction of the supplied 905 × 505 AGRIDELTA visual, with genuinely Blender-authored plant, earth cutaway, branching roots, dew and glass guide nodes. The visible UI remains real HTML; the source screenshot is not flattened into the interface.

## Main experience

- Source headline, green typography, overlaid navigation, glass plant-journey panel and five root-connected feature cards.
- Five Blender-rendered plant stages: seed, three-leaf seedling, growth, flowering and pod development. Fixed camera, no model spinning.
- Click a root node to reveal its three-step guide and open the corresponding farm workflow.
- Previous/next buttons, ArrowLeft/ArrowRight and horizontal wheel/swipe navigation cycle through the five guides.
- On mobile, a scroll-snap feature rail updates the visible guide after a horizontal swipe. The guide sheet appears below the scene and remains keyboard accessible.
- Search accepts accented and unaccented Vietnamese. Navigation, knowledge panel, modal Escape/focus trapping and demo entry work.
- Existing fields, seasons, tasks, image preview and orders workflows are retained. This is still browser-local demo data, not secure authentication or server synchronization.

## Art and rendering

`blender/reference_earth.py` authors real geometry/materials, packs the leaf and soil texture images, creates the fixed studio and saves an editable `.blend`. It renders independent RGBA plant, soil/root and guide-focus layers at 1600 × 893, plus a 256 px physical glass orb. These are converted to WebP for fast, WebGL-independent display.

The distant mountain landscape is a generated photographic backdrop. It is deliberately separate from the Blender plant/soil. Texture and backdrop assets are included so the scene is reproducible. Root button coordinates are projected from the actual Blender camera into `earth-layout.json`.

```bash
blender -b -t 6 --python blender/reference_earth.py
python3 scripts/convert-earth-assets.py
```

Blender 4.3+ and Python Pillow are needed for regeneration. Intermediate PNGs and the generated `.blend` are reproducible and ignored by git. The `.py` authoring source and web-ready layers are versioned.

## Development and checks

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
node --check main.js
node --check root-guide.js
node --test tests/*.test.mjs
npm run build
```

The dev wrapper handles managed Linux environments where network-interface enumeration is unavailable. It does not affect the production build.

`tests/layout-check.html` is a development-only responsive capture helper. Copy it temporarily to public/ for a preview deployment, then remove that public copy before production. The reference capture mode hides only the footer/scrollbar for equal-size visual comparison.

Fonts: Be Vietnam Pro with genuine italic 800. Icons: Phosphor, chosen to match the source's rounded line symbols. No telemetry or analytics are added.
