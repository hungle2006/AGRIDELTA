# AGRIDELTA reference reconstruction QA

Source visual truth: design/reference-home.png (905 × 505 px).
Implementation iteration 1: Vercel preview 01e26fe, screenshot /workspace/shared/agridelta-qa/reference-iteration-1.jpg.
Full-view combined comparison: /workspace/shared/agridelta-qa/comparison-iteration-1.jpg.
The initial iframe content viewport was 890 × 497 because of a scrollbar; it was normalized to 905 × 505 for the first composition comparison. Capture CSS is being corrected to obtain native 905 × 505 evidence.

## Findings — iteration 1

- [P1] Blender foliage reads too flat and lacks the reference's curved, backlit lamina. Narrow the blades, roll them in depth, arch the midrib, increase warm rim lighting and darken chlorophyll.
- [P1] Foreground leaves appear as sharp, detached ovals. Move them to crop edges and use stronger optical depth of field in Blender.
- [P2] Main root network needs the reference's warm illumination and softer bloom. Increase the physical emission and optical fog glow while keeping real tapered geometry.
- [P2] Headline and description sit too low. Define the kicker line box explicitly and tighten the CTA gap.
- [P2] Header navigation begins too far right. Increase source-matching gaps and restore the source header inset at the 905 px target.
- [P2] Reference capture has a scrollbar. Hide overflow only in capture mode.

Fonts/typography: Be Vietnam Pro regular/medium/800 and real italic 800, compared with the supplied raster. Source is not a font specification; the family is the closest existing project match.
Spacing/layout: content, journey panel, soil horizon and five feature nodes use measured source proportions. The clickable node anchors are projected from the Blender camera.
Colors/tokens: green title/CTAs, brown translucent cards and lime icons retained; image contrast and rim light are in revision.
Image fidelity: all plant, soil, roots, dew and orbs are actual Blender geometry/material renders. A generated photographic mountain backdrop is composited behind them. Phosphor icons replace hand-drawn approximations.
Copy: reference headline, navigation, five feature titles and summaries are reproduced. Detailed instructions remain connected to working demo workflows.

Primary interactions and responsive states: pending final pass.
Console errors: pending final pass.

final result: blocked
