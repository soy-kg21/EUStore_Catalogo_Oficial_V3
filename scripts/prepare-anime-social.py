"""Prepare compatible JPEGs for social cards; never modify the original product photos.
Only needed after adding/changing WEBP source assets. Requires Python 3 + Pillow.
"""
from pathlib import Path
import json
from PIL import Image, ImageOps
root=Path(__file__).resolve().parent.parent
output=root/'public/anime/social';output.mkdir(parents=True,exist_ok=True)
count=0
for product in json.loads((root/'data/anime-catalog.json').read_text()):
    if product.get('canonicalId') or not product['image'].lower().endswith('.webp'):
        continue
    source=root/'public'/product['image'].lstrip('/')
    with Image.open(source) as original:
        image=ImageOps.exif_transpose(original).convert('RGBA')
        image.thumbnail((640,720),Image.Resampling.LANCZOS)
        background=Image.new('RGB',image.size,'#e9ece2');background.paste(image,mask=image.getchannel('A'))
        background.save(output/(product['id']+'.jpg'),quality=88,optimize=True)
    count+=1
print(f'{count} fotos compatibles para previews; originales intactos.')
