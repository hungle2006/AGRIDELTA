# AGRIDELTA Living Start QA

Source composition: design/reference-home.png, 905 × 505 pixels. The latest user explicitly changes the source state: preserve the initial Blender germination, add automatic flowering/fruit, start with all guide roots/cards hidden, and grow one new branch per gesture. The brighter clear valley and different botanical lifecycle are intentional changes, not a pixel-identical reproduction claim.

## Evidence

Final candidate: 6ed0d35, actual Vercel preview. Browser capture at native 905 × 505 CSS pixels, no density rescaling: tests/evidence/live-start/final-flowering.jpg. Full paired comparison: comparison.jpg. Focused paired comparisons: type-comparison.jpg, plant-comparison.jpg, roots-comparison.jpg. Mobile evidence: mobile-320.jpg. All paths are under tests/evidence/live-start/.

## Comparison and fix history

1. P0: the cloud browser cannot create a WebGL context. The preview initially showed no plant or earth. Fixed with transparent moving Blender renders from the authored scene for WebGL-disabled clients. This is an animated fallback, not static plant/soil photographs. Capable clients retain the direct GLB path.
2. P2: stage highlighting selected the live scene host through its dataset attribute, shifting the pressed button one place. Fixed by restricting stage updates to button[data-plant-stage]. Confirmed that the visible plant stage, label and pressed button agree.
3. P2: mobile crown overlapped the enlarged journey panel; excessive empty space separated the revealed card and guide. Moved the live scene beneath the panel, shortened the mobile section and removed the redundant rail scrollbar. Desktop progression controls were moved clear of central root cards.
4. Final paired comparison and browser retest show no actionable P0/P1/P2 defects in the tested states. All five roots were unlocked sequentially and retained. Flower and fruit states displayed correctly.

## Required surfaces

- Typography: retained Be Vietnam Pro 800 and real italic 800, source headline wrapping and navigation hierarchy. Exact source font family is unspecified. Small desktop labels retain source-scale proportions; mobile controls are enlarged.
- Layout: source headline, navigation, soil horizon, central plant, right journey panel and staggered root cards retained. New playback controls and initial discovery control have sufficient separation. Mobile crown clears the panel; guide scrolls into view after root growth.
- Colors: fresh green background, green CTAs, warm roots, lime symbols and dark brown glass cards. Brighter landscape is intentional. Feature selection and stage selection are distinct.
- Images/geometry: actual Blender plant animation, earth cutaway, root geometry and glass nodes. No static plant/soil image layers in Start. Direct GLB is about 1.5 MB; transparent fallback lifecycle is about 1 MB, 24fps, 27.792 seconds, with five independent root movies. The distant landscape is a separate generated photographic background.
- Copy: source feature labels and summaries retained. Final stage is Kết quả to match visible pod development. Instructions remain linked to existing demo workflows.

## Validation and limits

Browser tested: initial hidden roots/cards; automated seed-to-fruit progression; stage seek; pause/replay controls; sequential five-root unlock; guide content after growth; retention of earlier roots; mouse drag and wheel growth; mobile horizontal drag and automatic guide scroll. Mobile 390 and 320 px frames have no page-level horizontal overflow (320 frame leaves 305 px content due to the browser scrollbar; clientWidth equals scrollWidth). Exact 905 × 505 capture has no scrollbar. Final browser error log contained no application errors.

Five automated tests pass, including state sequencing, Vietnamese search and GLB anatomy/animation metadata. Syntax checks and production build pass. Local preview relay was unavailable after restart/reload, so verification used actual Vercel previews. The cloud browser uses the animated-video path because WebGL is disabled; direct GPU rendering was not visually tested in this environment. GLB contents and Blender rendering were validated separately. No physical iPhone hardware test was performed.

P3 follow-up: plant/soil/root details differ from the original photographic artwork, and software-rendered fallback has less fine material detail than direct GPU rendering. Numeric 90% similarity is not asserted. These are documented artistic/platform differences, not broken interactions.

Production checklist: remove public viewport helper; publish this tested source/assets; verify the production alias and live page.

final result: passed
