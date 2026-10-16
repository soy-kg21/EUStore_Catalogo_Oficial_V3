#!/usr/bin/env python3
"""Regenera tarjetas/fondos desde los originales, sin sobreescribir el detalle.
Requiere Pillow: python3 -m pip install Pillow
Uso: python3 scripts/optimize-anime-images.py [--quality 85] [--width 480]
El inventario vive en data/anime-catalog.json; las fotos fuente deben existir en public/.
"""
from pathlib import Path
import argparse,json,io
from PIL import Image,ImageOps
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--quality',type=int,default=85);parser.add_argument('--width',type=int,default=480);args=parser.parse_args()
if not 1<=args.quality<=100 or not 120<=args.width<=1200:parser.error('quality: 1–100; width: 120–1200')
root=Path(__file__).resolve().parents[1];rows=json.loads((root/'data/anime-catalog.json').read_text());before=after=0;count=0
for p in rows:
 if p.get('canonicalId'):continue
 src=root/'public'/p['image'].lstrip('/');im=ImageOps.exif_transpose(Image.open(src)).convert('RGB');before+=src.stat().st_size
 for field,size,quality in [('thumbnail',(args.width,round(args.width*4/3)),args.quality),('backdrop',(48,64),55)]:
  dst=root/'public'/p[field].lstrip('/');dst.parent.mkdir(parents=True,exist_ok=True);variant=im.copy();variant.thumbnail(size,Image.Resampling.LANCZOS);encoded=io.BytesIO();variant.save(encoded,'WEBP',quality=quality,method=6);dst.write_bytes(encoded.getvalue());after+=dst.stat().st_size
 count+=1
print(f'{count} diseños. Detalle: {before:,} bytes. Tarjetas + fondos: {after:,} bytes. Reducción: {(1-after/before)*100:.1f}% (comparación de archivos, no medida de red).')
