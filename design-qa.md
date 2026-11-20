# AGRIDELTA unified care workspace QA

## Source and intent

Source: current product captured in this audit run before editing, tests/evidence/care-redesign/dashboard-before.jpg, plus existing green Start composition. User requests a cohesive redesign of the complete laptop/mobile app, clearer root guides, and growth requiring water and fertilizer. This is a redesign, not a pixel clone.

Implementation: preview c67a514, captured dashboard.jpg and mobile-root.jpg under tests/evidence/care-redesign/. Side-by-side review: comparison.jpg. Dashboard captures are browser viewport images with identical framing; the paired image normalizes both to 900 px width for inspection. Mobile guide was tested in 320px iframe (305px content after scrollbar); 390px iframe content is 375px. No page-level horizontal overflow in either tested width.

## Audit findings and fixes

1. Start to dashboard: different logo, decorative language, fonts, corners and imagery made the transition feel disconnected. Reused the brand mark, green/ivory palette, genuine family/weights and Phosphor icons. Shared garden state replaces the unrelated still plant in dashboard hero. Breadcrumb and return-to-garden controls connect the flow.
2. Care: old tree ran to fruit without action. Both care actions are now required for every transition, with per-stage state reset and persistent progress. Repeated watering cannot substitute fertilizer. Future stage buttons are locked. Both GLB and video paths use an unlocked timeline cap.
3. Root guide: heavy dark overlay and sparse page controls made instructions harder to follow. Reworked card borders/selection, lighter readable guide sheet, stronger icon/counter contrast and mobile sizing. Ordinary vertical scroll is no longer trapped; horizontal drag, Shift-wheel, arrows and grow controls remain.
4. Preview pass P2: dashboard garden CTA had pale text on a light background. Fixed to dark green text on a pale green button; final screenshot confirms readable contrast. Page-heading breaks received explicit spacing.
5. Responsive pass P2: journey/care panels could overlap the plant crown. Mobile canvas is below the combined panel; tablet uses a separate care dock. Mobile care advances scroll the plant into view. Farm forms use 16px inputs; navigation has generous targets and bottom safe-area padding.
6. Keyboard: added focus containment inside farm dialogs. Existing Escape close is retained.

## Browser-verified behavior

- Initial plant time stays 0 without care; future stages disabled.
- Water alone keeps milestone at 0 and disables repeat water until fertilizer.
- Fertilizer completes the pair, unlocks milestone 1. Plant subsequently stops at 7.7 seconds rather than proceeding to flowers.
- Reload preserves milestone 1. Four total care pairs unlock all four transitions; dashboard reflects milestone 4.
- Garden-to-dashboard and back work; root growth finishes before its guide opens. Mobile guide is readable at 320px, with no horizontal overflow.
- Dashboard, fields, season, observation and orders navigation inspected. Created and saved a clearly named test field in preview-local data; it appeared in the list.
- Final error-log inspection: no application-origin errors.

## Required visual surfaces

Typography: unified Be Vietnam Pro and matching hierarchy, genuine italic where retained. Spacing: shared content widths, 20px surfaces, coherent toolbars and mobile stacking. Colors: green/ivory tokens, darker guide icons, readable primary actions. Images: existing real Blender foreground preserved; existing generated landscape reused for farm context instead of hand-drawn filler. Copy: consistent Vietnamese labels and explicit local/demo status.

## Validation and limits

Eight automated tests pass, including care sequencing, duplicate-action prevention, corrupt/restored state and existing guide/GLB tests. Production build and syntax/whitespace checks pass. This browser has WebGL disabled; browser validation therefore exercises the real animated Blender fallback. The direct GLB path is source/asset validated, not visually GPU-tested here. No physical iPhone test or full accessibility certification is asserted. Server login/sync remains outside this UI change. MagicPath returned quota exceeded; no MagicPath-generated design is claimed.

P3 follow-up: existing Blender mesh art can receive further botanical/detail refinement; this iteration changes care control and root presentation rather than claiming newly sculpted roots. Minor landscape reuse across sample field cards is intentional.

final result: passed
