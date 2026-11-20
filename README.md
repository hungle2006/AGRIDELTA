# AGRIDELTA · Living Start

Live: https://agridelta.vercel.app

Start retains the supplied reference's typography, navigation, dawn valley and root-linked guide layout. The foreground is an actual Blender model with a continuous botanical lifecycle, rather than interchangeable plant/soil photographs.

## Experience

- A Blender watering can pours moving drops and organic nutrient pellets fall onto the soil automatically. The seed then sprouts, leaves open, flowers bloom and three red tomatoes swell under green calyxes. No watering/fertilizer buttons or manual unlock state remain. The camera stays fixed.
- Four automatic care bursts are synchronized with the botanical clip. Status text and progress follow the actual animation clock in both live GLB and movie fallback. Replay and chapter selection remain available.
- The five guide roots and feature cards start hidden. One deliberate wheel gesture, horizontal drag/swipe, Right Arrow or grow button reveals one new branch from trunk to tip. Its card and three-step instructions appear after the growth finishes. Earlier roots stay visible.
- Horizontal gestures cycle existing guides after all five have grown. Search and navigation can reveal a requested guide; unrevealed preceding branches grow sequentially.
- Mobile places the journey panel above the growing crown, compresses the root spread, places compact topic nodes on their actual branch tips and scrolls the resulting guide into view.
- The distant valley is a separate photographic background, revised for clearer fields/mountains and fresh greens.

## Real geometry and compatible motion

`blender/start_lifecycle.py` preserves the original botanical animation from `blender/living_growth.py`, extends it with flowering and fruit, appends the real soil cutaway from `blender/reference_earth.py` and rebuilds five tapered root systems from one shared collar. Every lateral and tertiary attachment is sampled from its parent centreline. Leaf midribs retain their botanical parents. The GLB is meshopt-compressed to about 1.5 MB while preserving its six root groups, animation channels and metadata.

`live-earth.js` uses Three.js, GLTFLoader, MeshoptDecoder and AnimationMixer to render that GLB directly with physical materials. A growth attribute reveals each actual root mesh progressively. It uses a fixed camera, capped pixel density and a 30fps render budget; hidden app states suspend rendering.

Some browsers, including the cloud QA browser, have WebGL disabled. `video-earth.js` uses transparent animated movies rendered from the same Blender scene in that case. The plant movie contains the full seed-to-fruit motion and real soil geometry; five separate root movies retain independent reveal timing. These are moving Blender renders, not copied plant photographs. No static plant or soil image layers remain in the Start markup.

To regenerate (Blender 4.3+, Python and ffmpeg required):

```bash
blender -b -t 6 --python blender/living_growth.py
blender -b -t 6 --python blender/reference_earth.py
blender -b -t 6 --python blender/start_lifecycle.py
npm exec --yes --package=@gltf-transform/cli -- gltf-transform webp public/assets/start-lifecycle.glb /tmp/start-lifecycle-webp.glb --quality 90
npm exec --yes --package=@gltf-transform/cli -- gltf-transform meshopt /tmp/start-lifecycle-webp.glb public/assets/start-lifecycle-live.glb --level high
blender -b -t 4 --python blender/render_start_fallback.py
blender -b -t 3 --python blender/render_root_fallback.py
bash scripts/encode-start-fallback.sh
```

The meshopt-only compression step deliberately avoids joining the separate root nodes. Editable `.blend` files, raw frames and uncompressed exports are reproducible intermediates; authoring scripts and web assets are versioned.

## Development and validation

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
node --check root-guide.js
node --check live-earth.js
node --check video-earth.js
node --test tests/*.test.mjs
npm run build
```

`tests/layout-check.html` is a development-only viewport helper. Temporarily copy it to public for a preview and remove the public copy before production. The design QA report records the actual browser-tested rendering path and any environment limitations.

Existing fields, seasons, tasks, observation and orders workflows are retained. Their data remains browser-local demo data. Fonts: Be Vietnam Pro with genuine italic 800. Icons: Phosphor.

## Unified farm workspace

`unified.css` aligns Start, demo entry, dashboard, fields, seasons, observation, orders, profile and forms with one green/ivory palette, Be Vietnam Pro, Phosphor symbols, brand mark, card radii and spacing. Mobile retains a fixed five-item bottom navigation, single-column forms and cards. The garden summary returns to the same live garden, instead of opening a separate plant viewer. Vertical scrolling no longer gets trapped by root exploration; horizontal drag, Shift-wheel and accessible controls reveal roots.

Automatic care is an illustrative animation, not agronomic watering or fertilization advice. Farm records remain browser-local demo data; this change does not introduce server authentication or cloud sync.

The app mark is a real Blender relief: `scripts/logo-relief-mesh.py` derives the clean silhouette from `blender/logo-source.webp`; `blender/logo_relief.py` adds depth, enamel material and studio lighting. Regenerate it with Python (Pillow, NumPy, SciPy), then Blender.
