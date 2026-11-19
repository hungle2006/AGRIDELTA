# AGRIDELTA · Living Growth

Vietnamese agriculture frontend with an editorial landing page, a genuine Blender-authored germination animation and a browser-local farm-management demo.

**Production:** https://agridelta.vercel.app

**Source:** https://github.com/hungle2006/AGRIDELTA

## This release

- Calm ivory and forest-green layout with readable mobile typography and a compact mobile menu.
- One synchronized 16-second GLB animation: seed coat separates, stem internodes extend, cotyledons open, and true leaves unfold from their attachment points. The camera and soil remain stationary. Playback stops at the mature seedling.
- Three chapter controls, pause/resume and replay. Playback pauses when the scene is offscreen or the tab is hidden. Reduced-motion users see the completed plant initially. There is no automatic loop.
- A WebP poster rendered from the same Blender scene supplies a static fallback while 3D loads. No CSS scaling is used to imitate biological growth.
- The landing uses a 640 px H.264 Blender render (16 seconds, about 200 KB) for reliable playback on iOS and devices without WebGL. The same animated GLB is available in the workspace viewer. Model-viewer is bundled locally and loaded only when the optional 3D viewer is opened. No external runtime CDN is required.
- Five accessible guide accordions with illustrated context and working demo routes.
- Existing dashboard, fields, seasons, tasks, image preview and orders remain browser-local demo workflows. Login opens an accurately labelled demo entry; real accounts and server synchronization are not implemented.

## Development

Node 22+:

```bash
npm ci
npm run dev -- --host 127.0.0.1
node --check main.js
node --check root-guide.js
node --test tests/*.test.mjs
npm run build
```

## Blender source

`blender/living_growth.py` creates the scene, meshes, physical materials, embedded leaf texture, growth keyframes, GLB and rendered PNG poster. Requires Blender 4.3+ and its bundled NumPy.

```bash
blender -b -t 4 --python blender/living_growth.py
python3 -c "from PIL import Image; Image.open('public/assets/living-growth-poster.png').save('public/assets/living-growth-poster.webp',quality=88)"
```

The generated editable `.blend` and intermediate PNGs are reproducible and ignored by git. The web-ready GLB and WebP are versioned. The export script merges object animation sampler/channel tables into a single synchronized clip without modifying vertex/accessor buffers.

Render the matching video with Blender and FFmpeg:

```bash
blender -b -t 6 --python blender/render_growth_video.py
ffmpeg -y -framerate 12 -i blender/render_frames/frame_%04d.png -f lavfi -i color=c=0xf8f7ef:s=640x640:r=12 -filter_complex "[1:v][0:v]overlay=shortest=1:format=auto,hqdn3d=2:2:3:3,format=yuv420p" -c:v libx264 -preset slow -crf 19 -movflags +faststart -an public/assets/living-growth.mp4
```

## Scope

Field/sensor values are sample values. Edits persist in the current browser only. The image preview does not diagnose plant disease. There is no secure authentication, database, cross-device synchronization or backend in this frontend project.
