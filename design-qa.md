# AGRIDELTA reference reconstruction QA

Source visual truth: `design/reference-home.png`, 905 × 505 px. Final candidate: `3ba6b31`, browser-rendered Vercel preview. Native final capture: `tests/evidence/reference-final.jpg`, 905 × 505 px. Side-by-side source and implementation: `tests/evidence/reference-comparison.jpg`. Focused comparisons: `plant-comparison.jpg`, `typography-comparison.jpg`, `root-cards-comparison.jpg` in the same directory. All were inspected as paired images, including the complete composition.

## Iteration history

1. Blocked: flat foliage, detached foreground leaves, weak root illumination, low headline baseline, narrow navigation spacing and a capture scrollbar. First iframe capture was 890 × 497; it was normalized only for initial composition review, not used as final exact-size evidence.
2. Corrected foliage curvature/backlighting, depth of field, warm root bloom, kicker line box, header spacing and native reference capture. Tested root click, keyboard next and actual pointer swipe from Cánh đồng to Mùa vụ. Mobile guide appeared below the scene without blocking the feature rail.
3. Thickened and tapered the shoot, arched leaf midribs, moved the pendant dew drop, darkened physical glass orbs and used the folded-leaf brand mark. Fixed synthetic clicks after dragging, root keyboard focus and search field focus. Re-rendered the Blender scene and repeated paired full/focused visual comparison at native 905 × 505.

## Final review

- Typography: Be Vietnam Pro regular/medium/800 and genuine italic 800. Two-line source headline, emphasis, navigation, stage labels, summaries and CTA hierarchy retained. The raster reference does not identify its exact font; this is the closest existing project family, not a certified font match.
- Layout: source aspect ratio, left headline, central seedling, right glass journey panel, soil horizon and five staggered root cards reconstructed using measured proportions. Feature anchors are projected from the actual Blender camera. Desktop source composition is maintained; mobile stacks copy/journey above the plant and uses a horizontal feature rail.
- Color/material: green title and CTAs, lime symbols, dark brown translucent cards, glass bubbles and golden roots. Real textured Blender geometry supplies plant, dew, clods, soil face and branching roots. The distant valley is a separate generated photographic backdrop.
- Copy and icons: source Vietnamese labels and summaries reproduced with Phosphor line icons; detailed instructions are actual HTML and open the existing demo workflows.
- Responsive: browser checks at 320, 390, 768 and 1440 px iframe widths; no page-level horizontal overflow. At 320 px, the platform scrollbar leaves 305 px of content and clientWidth equals scrollWidth. Menu opens and closes. The feature rail intentionally scrolls horizontally.
- Interaction: root click opens its three-step guide; previous/next, ArrowRight and a native horizontal pointer drag change guides. Search `mua vu` returns Mùa vụ and opens that guide. Plant stage selection updates its pressed state and Blender layer. Escape/close dismiss panels. Existing demo routes and local-storage behavior remain covered by the retained application checks.
- Console: inspected preview error logs; only browser-extension metadata errors were present, no application-origin errors in the inspected logs.
- Validation: syntax checks, three meaningful landing tests, Vite production build and whitespace checks passed.

## Remaining differences

P3 artistic differences: botanical silhouette/vein detail, granular soil distribution, root curves and lighting differ from the source artwork. Tiny discovery caption contrast varies over the bright central root. The scene is an authored reconstruction; no numeric 90% similarity score or pixel-identical claim is made. No open P0/P1/P2 interaction, overflow or layout defects were observed in the tested states.

The managed local preview relay returned Site Unavailable after one reload. QA therefore used the actual Vercel preview build rather than claiming local preview success. `public/layout-check.html` was removed for production; the helper remains in `tests/` for future development.

final result: passed
