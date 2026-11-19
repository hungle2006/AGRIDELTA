"""Convert the actual Blender RGBA renders to mobile-friendly WebP layers."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
assets=root/'public/assets'
names=['earth-ground-v2','guide-orb-v2']+[f'earth-plant-{i}' for i in range(5)]+[f'earth-root-focus-{i}' for i in range(5)]
for name in names:
 source=assets/(name+'.png'); target=assets/(name+'.webp')
 if not source.exists():raise FileNotFoundError(source)
 with Image.open(source) as im:
  im.save(target,format='WEBP',quality=92,method=6,exact=True)
 print(f'{target.name}: {target.stat().st_size:,} bytes')
