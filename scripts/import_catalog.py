"""Reproducible migration: python scripts/import_catalog.py workbook.xlsx legacy_root"""
import sys,json,re,unicodedata,hashlib,csv
from pathlib import Path
from collections import Counter
import openpyxl
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
w=openpyxl.load_workbook(sys.argv[1],data_only=True);legacy=Path(sys.argv[2])
def sheet(i):
 rows=list(w.worksheets[i].values); return [dict(zip(rows[0],r)) for r in rows[1:] if r[0]]
master=sheet(0); images={r['ID Producto Web']:r for r in sheet(2)};urls={r['ID Producto Web']:r for r in sheet(5)};ops={r['ID Producto Web']:r for r in sheet(7) if r.get('ID Producto Web')}
def slug(s):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower()).strip('-')
products=[];issues=[];checks=[]
for r in master:
 id=r['ID Producto Web'];im=images.get(id,{});u=urls.get(id,{});op=ops.get(id,{})
 category='camisetas' if r['Categoría Web']=='ropa' else 'conjuntos' if r['Categoría Web']=='conjuntos_deportivos' else 'zapatillas'
 paths=[]
 for key in ['Imagen Principal','Imagen Secundaria','Imagen Detalle']:
  name=im.get(key)
  if not name:continue
  path=legacy/str(im.get('Ruta Catalogo',''))/str(name)
  if not path.exists(): issues.append({'id':id,'issue':'Imagen ausente','source':str(path.relative_to(legacy))});continue
  dest=f'/catalog/{id}-{len(paths)+1}.webp';full=ROOT/'public'/dest.lstrip('/');full.parent.mkdir(parents=True,exist_ok=True)
  src=Image.open(path).convert('RGB');src.thumbnail((1000,1000));src.save(full,'WEBP',quality=85)
  thumb=src.copy();thumb.thumbnail((480,600));thumb.save(full.with_name(full.stem+'-480.webp'),'WEBP',quality=80)
  paths.append(dest)
 sizes=[x.strip() for x in str(r.get('Tallas Catálogo') or r.get('Tallas Disponibles') or '').split(',') if x.strip()]
 active=r['Activo Catálogo']=='Sí'
 if not paths and active:raise ValueError(f'Active product without photo {id}')
 state='review' if r['Estado']=='Revisar color' else 'active' if active else 'inactive'
 name=r['Nombre Comercial'].split(' — ')[0];pslug=u.get('Slug') or slug(name+'-'+str(r['SKU']))
 p={'id':id,'sku':r['SKU'],'name':name,'slug':pslug,'category':category,'brand':r.get('Marca') if r.get('Marca')!='No especificada' else None,'model':r['Modelo'],'price':r['Precio COP'],'previousPrice':r.get('Precio Antes COP'),'currency':'COP','color':r.get('Color Catálogo') or r.get('Color Variante') or 'Por confirmar','sizes':sizes,'images':paths,'state':state,'stock':op.get('Stock Registrado Total') if isinstance(op.get('Stock Registrado Total'),(int,float)) else None,'warehouse':r.get('Código Bodega'),'family':r.get('Familia'),'description':r.get('Descripción Catálogo') or name,'benefits':[x.strip() for x in str(r.get('Beneficios Catálogo') or '').split(';') if x.strip()],'sizeNote':r.get('Observación Tallas') or '', 'material':r.get('Material declarado'),'weight':r.get('Gramaje g'),'featured':r.get('Destacado')=='Sí','rank':r.get('Orden Home') or 9999,'seoTitle':f'{name} | Evolución Urbana Store','seoDescription':f'{name}. Consulta tallas, fotografías y precio en COP. Compra con asesoría por WhatsApp en Evolución Urbana Store.'}
 products.append(p);checks.append({'id':id,'sku':p['sku'],'state':state,'images':len(paths),'url':'https://www.evolucionurbana.store/producto/'+pslug,'stock':p['stock'],'issue':r.get('Observación Color') if state=='review' else ('Inactivo en fuente' if not active else '')})
for key in ['id','sku','slug']:
 assert len(set(p[key] for p in products))==len(products),f'Duplicate {key}'
assert all(isinstance(p['price'],(int,float)) and p['price']>0 for p in products)
(ROOT/'data/catalog.json').write_text(json.dumps(products,ensure_ascii=False,indent=2))
report={'sourceSha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'sheets':{s.title:s.max_row-1 for s in w},'total':len(products),'active':sum(p['state']!='inactive' for p in products),'byState':dict(Counter(p['state'] for p in products)),'byCategory':dict(Counter(p['category'] for p in products)),'stockUnknown':sum(p['stock'] is None for p in products),'issues':issues,'products':checks}
(ROOT/'docs/migration-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
with (ROOT/'docs/migration-register.csv').open('w') as f:
 writer=csv.DictWriter(f,fieldnames=checks[0]);writer.writeheader();writer.writerows(checks)
# Preserve all commercial rules in a server-only audit snapshot.
(ROOT/'data/commercial-rules.json').write_text(json.dumps(sheet(4),ensure_ascii=False,indent=2,default=str))
print(json.dumps({k:v for k,v in report.items() if k not in ['products','sheets']},ensure_ascii=False))
