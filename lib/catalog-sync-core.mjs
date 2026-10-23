import {createHash,timingSafeEqual} from 'node:crypto';

export const PROTOCOL='eustore-sync-v1';
export function productionContext(build,runtime){return build==='production'||build==='local'&&runtime==='production';}
const SHA=/^[a-f0-9]{64}$/,ID=/^[a-f0-9-]{36}$/;
const privateText=/\b(?:dropi|master\s*shop|bodegas?|B[1-7])\b/i;
export class SyncError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const fail=(message,status=400)=>{throw new SyncError(message,status);};
const text=(v,max=6000)=>{if(typeof v!=='string'||v.length>max)fail('Texto inválido.');return privateText.test(v)?'':v;};
const number=(v,max=1e10)=>{if(!Number.isFinite(v)||v<0||v>max)fail('Número inválido.');return v;};
const positive=v=>{number(v);if(v<=0)fail('Precio inválido.');return v;};
const array=(v,max)=>{if(!Array.isArray(v)||v.length>max)fail('Lista inválida.');return v;};
const hash=v=>createHash('sha256').update(v).digest('hex');
export function imageMime(bytes){if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')return 'image/webp';return null;}
export function validateSnapshot(value,baselineAssets={}){
 if(value?.schema!==PROTOCOL||!ID.test(value.revision)||!Number.isFinite(Date.parse(value.createdAt)))fail('Versión incompatible.');
 const ids=new Set(),routes=new Set(),assetPaths=new Set(Object.values(baselineAssets));
 const products=array(value.products,10000).map(p=>{
  if(!/^[a-f0-9]{24}$/.test(p.id)||ids.has(p.id))fail('Identidad de producto duplicada o inválida.');ids.add(p.id);
  if(!['general','anime','importadas'].includes(p.section))fail('Sección inválida.');
  const route=p.route;if(!route||typeof route.id!=='string'||!route.id||route.id.length>120||typeof route.slug!=='string'||!/^[-a-z0-9]{1,180}$/.test(route.slug))fail('Enlace de producto inválido.');
  const routeKey=(p.section==='anime'?'anime':'general')+':'+route.slug;if(routes.has(routeKey))fail('Enlace duplicado.');routes.add(routeKey);
  const image=v=>{if(typeof v!=='string'||(!/^\/api\/catalog-media\/[a-f0-9]{64}$/.test(v)&&!assetPaths.has(v)))fail('Fotografía no preparada.');return v;};
  const rule=p.commerce?.rule;let pricing=null;
  if(rule){if(!['unit','total'].includes(rule.kind)||array(rule.retail,5).length!==5)fail('Tarifa incompleta.');pricing={kind:rule.kind,retail:rule.retail.map(positive),wholesale:array(rule.wholesale||[],30).map(t=>{if(!Array.isArray(t)||t.length!==3||!Number.isSafeInteger(t[0])||!Number.isSafeInteger(t[1])||t[0]<6||t[1]<t[0])fail('Tarifa mayorista inválida.');return [t[0],t[1],positive(t[2])];}),...(rule.mixed?{mixed:positive(rule.mixed),mixedScope:rule.mixedScope==='bucket'?'bucket':'cart'}:{})};}
  if(!/^[a-f0-9]{24}$/.test(p.commerce?.bucket))fail('Agrupación inválida.');
  const sizes=array(p.sizes,80).map(v=>({size:text(v.size,40),quantity:v.quantity===null?null:number(v.quantity,1e6)}));
  if(!sizes.length||sizes.some(v=>!v.size||v.quantity!==null&&!Number.isInteger(v.quantity))||new Set(sizes.map(v=>v.size)).size!==sizes.length)fail('Revisa tallas y existencias.');
  const name=text(p.name,200);if(!name||name!==p.name)fail('Nombre público inválido.');
  return {id:p.id,name,section:p.section,category:text(p.category,120),line:text(p.line,120),brand:text(p.brand,120),color:text(p.color,120),description:text(p.description),labels:array(p.labels,50).map(v=>text(v,100)).filter(Boolean),price:positive(p.price),regularPrice:p.regularPrice===null?null:number(p.regularPrice),position:number(p.position,1e6),sizeSystem:text(p.sizeSystem||'',50),currency:'COP',benefits:text(p.benefits),materials:text(p.materials),conditions:text(p.conditions),payment:text(p.payment),sizes,images:{principal:image(p.images?.principal),detalle:image(p.images?.detalle)},route:{id:route.id,slug:route.slug},commerce:{bucket:p.commerce.bucket,rule:pricing,quoteFrom:p.commerce.quoteFrom===null?null:positive(p.commerce.quoteFrom),shippingFrom:positive(p.commerce.shippingFrom),advance:p.commerce.advance===true},extras:{isNew:p.extras?.isNew===true,fit:text(p.extras?.fit||'',100),weight:p.extras?.weight==null?null:number(p.extras.weight,1e5),featured:p.extras?.featured===true}};
 });
 return {schema:PROTOCOL,revision:value.revision,createdAt:new Date(value.createdAt).toISOString(),products};
}
async function bytes(request,max){const reader=request.body?.getReader();if(!reader)return Buffer.alloc(0);const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail('Carga demasiado grande.',413);}chunks.push(value);}return Buffer.concat(chunks);}
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

// Store is injected so the atomic protocol can be tested without hosting credentials.
export function syncService({getStore,token,baselineAssets={},production=true}){
 const authorized=request=>{
  if(!production)fail('La publicación solo está habilitada en producción.',403);
  if(typeof token!=='string'||token.length<32)fail('Configura EUSTORE_PUBLISH_TOKEN en Netlify.',503);
  const actual=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from('Bearer '+token);
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))fail('Conexión no autorizada.',401);
 };
 const active=async()=>getStore().getWithMetadata('active',{type:'json',consistency:'strong'});
 return {
  async read(){const value=await active();return value?.data||null;},
  async media(sha){if(!SHA.test(sha))return new Response(null,{status:404});const result=await getStore().getWithMetadata('assets/'+sha,{type:'arrayBuffer',consistency:'strong'});if(!result)return new Response(null,{status:404});return new Response(result.data,{headers:{'Content-Type':String(result.metadata.mime),'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});},
  async handle(request,path){try{
   authorized(request);const store=getStore();
   if(path==='status'&&request.method==='GET'){const current=await active();return json({protocol:PROTOCOL,revision:current?.data.revision||null,etag:current?.etag||null,productCount:current?.data.products.length??null});}
   if(path==='assets/check'&&request.method==='POST'){
    const input=JSON.parse((await bytes(request,40000)).toString()),hashes=array(input.hashes,250);if(hashes.some(h=>!SHA.test(h)))fail('Fotografías inválidas.');
    const available={};for(let n=0;n<hashes.length;n+=20)await Promise.all(hashes.slice(n,n+20).map(async sha=>{if(baselineAssets[sha])available[sha]=baselineAssets[sha];else if(await store.getMetadata('assets/'+sha,{consistency:'strong'}))available[sha]='/api/catalog-media/'+sha;}));return json({available});
   }
   if(path.startsWith('assets/')&&request.method==='PUT'){
    const sha=path.slice(7);if(!SHA.test(sha))fail('Fotografía inválida.');const body=await bytes(request,4*1024*1024),mime=imageMime(body);if(!mime||hash(body)!==sha)fail('La fotografía no pasó la validación.');await store.set('assets/'+sha,body,{metadata:{mime},onlyIfNew:true});return json({stored:true,path:'/api/catalog-media/'+sha});
   }
   if(path==='commit'&&request.method==='POST'){
    const input=JSON.parse((await bytes(request,4*1024*1024)).toString()),document=validateSnapshot(input.document,baselineAssets),current=await active();
    const serialized=JSON.stringify(document),fingerprint=hash(serialized);
    if(current?.data.revision===document.revision){if(hash(JSON.stringify(current.data))!==fingerprint)fail('La versión ya existe con otro contenido.',409);return json({published:true,revision:document.revision,productCount:document.products.length});}
    if((current?.etag||null)!==(input.expected??null))fail('El catálogo web cambió después de la revisión. Revisa de nuevo.',409);
    const needed=[...new Set(document.products.flatMap(p=>Object.values(p.images)).filter(v=>v.startsWith('/api/catalog-media/')).map(v=>v.split('/').pop()))];
    for(let n=0;n<needed.length;n+=30)await Promise.all(needed.slice(n,n+30).map(async sha=>{if(!await store.getMetadata('assets/'+sha,{consistency:'strong'}))fail('Faltan fotografías. La versión anterior sigue activa.',409);}));
    const archive=await store.setJSON('revisions/'+document.revision,document,{onlyIfNew:true});
    if(!archive.modified){const previous=await store.get('revisions/'+document.revision,{type:'json',consistency:'strong'});if(hash(JSON.stringify(previous))!==fingerprint)fail('Identidad de versión en conflicto.',409);}
    const result=await store.setJSON('active',document,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});
    if(!result.modified)fail('Otra publicación cambió el catálogo. Revisa de nuevo.',409);
    const confirmed=await active();if(confirmed?.data.revision!==document.revision||hash(JSON.stringify(confirmed.data))!==fingerprint)fail('El almacenamiento no confirmó la activación. Actualiza la revisión antes de reintentar.',503);
    return json({published:true,revision:document.revision,productCount:document.products.length});
   }
   return json({error:'Operación no disponible.'},404);
  }catch(error){return json({error:error instanceof SyncError?error.message:error instanceof SyntaxError?'JSON inválido.':'No se pudo completar la conexión. La versión activa se conserva.'},error instanceof SyncError?error.status:503);}}
 };
}
