#!/usr/bin/env python3
"""Importa el octavo PDF ya revisado; conserva productos anteriores e interfaz.
Uso: python scripts/import-urbano-1.py "/ruta/URBANO 1.pdf"
Requiere PyMuPDF y Pillow. Se verifica el SHA-256 antes de extraer imágenes.
El manifiesto de revisión documenta altas, duplicados y fotos excluidas.
"""
import argparse, csv, hashlib, io, json
from pathlib import Path
import fitz
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('pdf', type=Path)
args = parser.parse_args()
review = json.loads((root / 'data/anime-urbano-1-review.json').read_text())
if hashlib.sha256(args.pdf.read_bytes()).hexdigest() != review['sourceSha256']:
    raise SystemExit('El PDF no corresponde al archivo revisado. No se modificó el catálogo.')
catalog_path = root / 'data/anime-catalog.json'
catalog = json.loads(catalog_path.read_text())
existing_batch = [p for p in catalog if p.get('releaseBatch') == '2026-10-10-urbano-1']
if existing_batch:
    if len(existing_batch) != sum(x['decision'] == 'nuevo' for x in review['review']):
        raise SystemExit('Lote incompleto: revisar antes de volver a importar.')
    print('Lote ya incorporado. Sin nuevas altas ni archivos sobreescritos.')
    raise SystemExit(0)
if max(int(p['id'].split('-')[-1]) for p in catalog) != review['baselineLastId']:
    raise SystemExit('El inventario cambió: revisar el siguiente ID antes de importar.')
pdf = fitz.open(args.pdf)
ledger_path = root / 'data/anime-import-ledger.json'
ledger = json.loads(ledger_path.read_text())
next_id = review['baselineLastId'] + 1
new = []
for item in review['review']:
    record = { 'key': 'u1-' + item['key'], 'pdf': review['sourcePdf'],
               'page': item['page'], 'line': item['line'],
               'supplierName': item['supplierName'], 'decision': item['decision'] }
    if item['decision'] == 'excluido':
        record['reason'] = item['reason']
    elif item['decision'] == 'existente / duplicado':
        record['catalogId'] = item['catalogId']
    else:
        code = f'EU-ANIME-{next_id}'
        extracted = pdf.extract_image(item['xref'])
        source = root / f'public/anime/products/{code}.{extracted["ext"]}'
        source.parent.mkdir(parents=True, exist_ok=True)
        source.write_bytes(extracted['image'])
        product = {
            'id': code, 'slug': code.lower(), 'name': item['name'],
            'image': '/' + str(source.relative_to(root / 'public')),
            'category': item['category'], 'line': item['line'],
            'sizes': ['S', 'M', 'L', 'XL'], 'price': 68000,
            'sourceName': item['supplierName'], 'isNew': True,
            'releaseBatch': '2026-10-10-urbano-1',
            'material': 'Poliéster' if 'POLIÉSTER' in item['supplierName'] else 'Por confirmar',
            'weightGrams': None, 'fit': 'Por confirmar',
            'supplier': {'pdf': review['sourcePdf'], 'page': item['page'],
                         'key': record['key'], 'name': item['supplierName']},
            'thumbnail': f'/anime/thumbnails/{code}.webp',
            'backdrop': f'/anime/backdrops/{code}.webp'
        }
        image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
        for field, size, quality in [('thumbnail', (480, 640), 85), ('backdrop', (48, 64), 55)]:
            variant = image.copy()
            variant.thumbnail(size, Image.Resampling.LANCZOS)
            encoded = io.BytesIO()
            variant.save(encoded, 'WEBP', quality=quality, method=6)
            destination = root / ('public' + product[field])
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(encoded.getvalue())
        new.append(product)
        record['catalogId'] = code
        next_id += 1
    ledger.append(record)
catalog.extend(new)
canonical = [p for p in catalog if not p.get('canonicalId')]
def write_json(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
write_json(catalog_path, catalog)
write_json(ledger_path, ledger)
index_path = root / 'data/anime-index.json'
index = json.loads(index_path.read_text())
index['ids'] = [p['id'] for p in canonical]
write_json(index_path, index)
with (root / 'data/anime-image-map.csv').open('w', newline='') as f:
    fields = ['id','slug','name','line','category','image','isNew','canonicalId','supplierPdf','supplierPage']
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    for p in catalog:
        row = {k: p.get(k, '') for k in fields}
        row['supplierPdf'] = p.get('supplier', {}).get('pdf', '')
        row['supplierPage'] = p.get('supplier', {}).get('page', '')
        writer.writerow(row)
meta_path = root / 'docs/meta-catalog-context.json'
meta = json.loads(meta_path.read_text())
meta['version'] = '2026-10-10-urbano-1'
for p in new:
    meta['products'].append({
        'id': p['id'], 'name': p['name'], 'line': p['line'], 'category': p['category'],
        'url': 'https://www.evolucionurbana.store/anime/' + p['slug'],
        'sizes': p['sizes'], 'material': p['material'], 'weightGrams': None,
        'fit': p['fit'], 'stockConfirmed': False
    })
write_json(meta_path, meta)
print(f'{len(new)} altas: {new[0]["id"]} a {new[-1]["id"]}. {len(canonical)} diseños únicos.')
