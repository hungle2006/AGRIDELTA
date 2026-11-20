# AGRIDELTA · Living Start

Live: https://agridelta.vercel.app

Start retains the supplied reference's typography, navigation, dawn valley and root-linked guide layout. The foreground is an actual Blender model with a continuous botanical lifecycle, rather than interchangeable plant/soil photographs.

## Experience

- The original Blender germination animation grows automatically into a leafy plant, opens three blossoms and develops three bean pods over 28 seconds. The camera remains fixed.
- Replay, pause/resume and five stage controls operate on the same timeline. Reduced-motion users can choose stages manually.
- The five guide roots and feature cards start hidden. One deliberate wheel gesture, horizontal drag/swipe, Right Arrow or grow button reveals one new branch from trunk to tip. Its card and three-step instructions appear after the growth finishes. Earlier roots stay visible.
- Horizontal gestures cycle existing guides after all five have grown. Search and navigation can reveal a requested guide; unrevealed preceding branches grow sequentially.
- Mobile places the journey panel above the growing crown, compresses the root spread, uses a feature rail and scrolls the resulting guide into view.
- The distant valley is a separate photographic background, revised for clearer fields/mountains and fresh greens.

## Scroll-controlled Start experience

The Start landing page is a reversible scroll story: a sticky real Blender plant and soil scene stays visible while its taproot and five lateral root meshes reveal as the page scrolls down, and retract as the user scrolls up. A root's shader uniform is computed from its current normalized scroll position, not from the number of swipes or previous completed animations. The circular markers increase in size smoothly as each corresponding root grows.

The experience uses `scroll-story-state.js` for the shared deterministic scroll timing, `live-earth.js` for GLB root uniforms, and `video-earth.js` for scroll-seeked Blender video fallback when WebGL2 is unavailable. The plant's autonomous flower/fruit lifecycle remains independent from root scrolling. `start-scroll-story.css` supplies the sticky 3D scene and responsive mobile/desktop layout.

Desktop: story title at left, plant in the middle, lifecycle at right, five-function dock fixed at the bottom. Mobile: a compact expandable journey panel and a five-function dock leave space for the plant and roots; the guide opens as a separate bottom sheet. Scroll is native; no wheel interception or page-wide scroll lock remains. Buttons for exploring the next root and all five guide shortcuts remain keyboard-accessible. Application screens continue scrolling normally.

## Real geometry and compatible motion

`blender/start_lifecycle.py` preserves the original botanical animation from `blender/living_growth.py`, extends it with flowering and fruit, and appends the real soil cutaway and five independently identified roots from `blender/reference_earth.py`. Leaf midribs retain their botanical parents. The GLB is meshopt-compressed to about 1.5 MB while preserving its six root groups, animation channels and metadata.

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
