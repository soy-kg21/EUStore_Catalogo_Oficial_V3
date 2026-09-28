import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def sql(v):
 if v is None:return 'null'
 if isinstance(v,bool):return 'true' if v else 'false'
 if isinstance(v,(int,float)):return str(v)
 if isinstance(v,(list,dict)):return "'"+json.dumps(v,ensure_ascii=False).replace("'","''")+"'::jsonb"
 return "'"+str(v).replace("'","''")+"'"
def insert(table,row,conflict):
 keys=list(row); return f"insert into public.{table} ({','.join(keys)}) values ({','.join(sql(v) for v in row.values())}) on conflict ({conflict}) do update set "+','.join(f'{k}=excluded.{k}' for k in keys if k not in conflict.split(','))+';'
out=['begin;']
for id,name in [('camisetas','Camisetas'),('zapatillas','Zapatillas'),('conjuntos','Conjuntos')]:out.append(insert('categories',dict(id=id,slug=id,name=name),'id'))
for id in ['B1','B2','B5']:out.append(insert('warehouses',dict(id=id,name='Bodega '+id[1:]),'id'))
for p in json.loads((root/'data/catalog.json').read_text()):
 fields={'id':'id','sku':'sku','slug':'slug','category_id':'category','warehouse_id':'warehouse','name':'name','brand':'brand','model':'model','description':'description','price_cop':'price','previous_price_cop':'previousPrice','color':'color','state':'state','family':'family','material':'material','weight_g':'weight','featured':'featured','home_rank':'rank','benefits':'benefits','size_note':'sizeNote'}
 row={k:p[v] for k,v in fields.items()};row['warehouse_id']=row['warehouse_id'] if row['warehouse_id'] in ['B1','B2','B5'] else None
 out.append(insert('products',row,'id'))
 out.append(insert('product_seo',dict(product_id=p['id'],title=p['seoTitle'],description=p['seoDescription']),'product_id'))
 for i,size in enumerate(p['sizes']):
  vid=p['id']+':'+size
  out.append(insert('variants',dict(id=vid,product_id=p['id'],size=size,color=p['color']),'id'))
  if row['warehouse_id']:out.append(f"insert into public.inventory(variant_id,warehouse_id,quantity) values ({sql(vid)},{sql(row['warehouse_id'])},null) on conflict do nothing;")
 out.append('delete from public.product_images where product_id='+sql(p['id'])+';')
 for i,img in enumerate(p['images']):out.append(insert('product_images',dict(id=p['id']+':'+str(i),product_id=p['id'],url=img,sort_order=i,alt=p['name']),'id'))
for rule in json.loads((root/'data/commercial-rules.json').read_text()):
 id=rule.get('ID Promoción');name=rule.get('Promoción')
 if id and name:out.append(insert('promotions',dict(id=id,name=name,rules=rule),'id'))
out+=['commit;'];(root/'database/seed.sql').write_text('\n'.join(out))
print('SQL seed generated')
