import {categories} from '@/lib/config';
import {publicProduct} from '@/lib/product-display';
import {getProducts,queryProducts} from '@/lib/products';
import {catalogCollections,categoryProducts} from '@/lib/catalog-collections';
export async function GET(request:Request){try{const url=new URL(request.url);const params=Object.fromEntries(url.searchParams);for(const k of Object.keys(params)){if(params[k]==='all')delete params[k]}if((params.q||'').length>100)return Response.json({error:'Búsqueda demasiado larga'},{status:400});const products=await getProducts();
 if(params.discovery==='1'){
  const items=categories.flatMap(category=>{
   const eligible=categoryProducts(products,category.slug).filter(p=>p.state==='active'&&p.stock!==0);
   for(let i=eligible.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[eligible[i],eligible[j]]=[eligible[j],eligible[i]];}
   return eligible.slice(0,2);
  });
  return Response.json({items:items.map(publicProduct)},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }
 if(params.collection&&!Object.hasOwn(catalogCollections,params.collection))return Response.json({error:'Colección desconocida'},{status:400});
 const eligible=params.collection?products.filter(p=>p.collection===params.collection):params.category?categoryProducts(products,params.category):products;
 const result=queryProducts(eligible,params,params.category);return Response.json({...result,items:result.items.map(publicProduct)},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}catch{return Response.json({error:'Catálogo temporalmente no disponible'},{status:503})}}
