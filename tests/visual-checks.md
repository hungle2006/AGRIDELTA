# Living Growth release validation · 2026-11-19

- Vite production build and Node syntax checks passed.
- GLB structural checks passed: one synchronized clip, separate growth channels for seed, stem internodes, cotyledons and true leaves; embedded leaf texture; no animated soil or camera.
- Blender rendered 192 frames of the same scene to a 16-second, 640 × 640 H.264 video. The landing uses this render, with the GLB available in the optional workspace viewer.
- Cloud-browser preview checked in responsive iframes set to 320, 390, 768 and 1440 px. On this desktop browser the inner content viewport excludes the scrollbar. No document overflow at the checked widths.
- Mobile menu opens/closes and navigation anchors land on the intended section.
- Guide accordion switches its illustration and instructions; the seasons action enters the actual seasons screen.
- Season entry form fits the mobile viewport and focuses the first input.
- The plant starts from seed automatically. Water and fertilizer fall during growth. Scroll down while the scene is visible to trigger the harvest: each pod falls, rests on the soil, then disappears before the next begins. Reload to replay the cycle.
- Media height remains 355 px on desktop before and after decode.
- Cloud browser WebGL is disabled, so GLB motion could not be visually inspected in WebGL there. GLB channels were checked structurally and the Blender render was visually checked instead.
- Accounts, sensor data, image diagnosis and server synchronization remain outside this frontend demo's scope.

`layout-check.html` is a development-only harness. Copy it to public/ temporarily to inspect a preview deployment; keep it outside public/ for production.
