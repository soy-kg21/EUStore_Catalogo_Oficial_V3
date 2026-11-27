import {publicProduct} from '@/lib/product-display';
import {getProducts} from '@/lib/products';
import {quote} from '@/lib/pricing';
import {catalogSizeVariant} from '@/lib/shoe-sizes';
import {z} from 'zod';

const schema=z.array(z.object({id:z.string().max(150),size:z.string().max(20),quantity:z.number().int().min(1).max(100)}).strict()).min(1).max(100);
const headers={'Cache-Control':'no-store'};

export async function POST(request:Request) {
  const raw=await request.text();
  if(raw.length>24000)return Response.json({error:'Solicitud demasiado grande'},{status:413,headers});
  let lines: z.infer<typeof schema>;
  try {
    lines=schema.parse(JSON.parse(raw));
  } catch {
    return Response.json({error:'Revisa las referencias, tallas y cantidades.'},{status:400,headers});
  }
  const keys=lines.map(line=>JSON.stringify([line.id,line.size]));
  if(new Set(keys).size!==keys.length)return Response.json({error:'Líneas duplicadas'},{status:400,headers});

  try {
    const products=await getProducts();
    const byId=new Map(products.filter(product=>product.state!=='inactive').map(product=>[product.id,product]));
    const resolved=new Set<string>();
    const issues=lines.flatMap(line=>{
      const product=byId.get(line.id);
      const variant=catalogSizeVariant(product?.variants??[],line.size,product?.collection==='importadas'?product.sizeSystem:undefined);
      const available=product&&(product.variants?variant!==undefined:product.sizes.includes(line.size));
      const maximum=available?(variant?.quantity??100):0;
      const resolvedKey=JSON.stringify([line.id,variant?.size??line.size]);
      if(available&&resolved.has(resolvedKey))return [{id:line.id,size:line.size,name:product.name,maximum:0,duplicate:true}];
      if(available)resolved.add(resolvedKey);
      return line.quantity>maximum?[{id:line.id,size:line.size,name:product?.name??'Referencia retirada',maximum,duplicate:false}]:[];
    });
    if(issues.length)return Response.json({error:'Cambió la disponibilidad de algunos productos.',issues},{status:409,headers});
    const result=quote(lines,products);
    return Response.json({...result,warehouses:result.dispatches.map(group=>String(group.id)),rows:result.rows.map(row=>({...row,product:publicProduct(row.product)}))},{headers});
  } catch {
    return Response.json({error:'El catálogo no respondió. Intenta actualizar tu selección.'},{status:503,headers});
  }
}
