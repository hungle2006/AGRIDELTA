# AGRIDELTA Start — design implementation

References consulted:
- https://github.com/Leonxlnx/taste-skill — intentional visual hierarchy and genuine photography
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — accessible responsive interaction, focus, spacing, performance
- https://github.com/emilkowalski/skills — restrained hover and motion
- https://github.com/jakubkrehel/skills — interface rhythm and design engineering
- https://github.com/bergside/awesome-design-skills — curated design practice (catalogue, not one executable skill)

The Blender/Three.js growing plant, soil and roots remain fully functional. No functionality, route, storage or data model was replaced. Root progress still follows scrolling down and retracts when scrolling up.

Editorial photos: ten distinct, genuinely photographed Unsplash Free images at exact source URLs in `start-photography.js` (with photographer credits), served responsively from `images.unsplash.com`. The live page links to the Unsplash free photo license at https://unsplash.com/license. Images do not repeat in cards; CDN failures fall back to existing local assets. Remote photos require an internet connection.

QA: check 320px, 390px, 768px, 1024px and 1440px; root scroll reversibility and positioning; smooth 3D; keyboard focus and reduced-motion; image loading and fallback; no accidental app-page CSS changes.
