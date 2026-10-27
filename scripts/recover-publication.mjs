import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {validateSnapshot,syncService} from '../lib/catalog-sync-core.mjs';
import {supabaseCatalogStore} from '../lib/supabase-catalog-store.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=async name=>JSON.parse(await readFile(resolve(root,name),'utf8'));
export async function checkRecovery(){
 const assets=await read('data/catalog-assets.json');
 const document=validateSnapshot(await read('data/recovered-publication.json'),assets);
 const byPath=new Map(Object.entries(assets).map(([sha,path])=>[path,sha]));
 const paths=new Set(document.products.flatMap(p=>Object.values(p.images)).map(path=>path.startsWith('/api/catalog-media/')?assets[path.split('/').pop()]:path));
 const missing=[],damaged=[];let total=0;
 for(const path of paths){
  if(typeof path!=='string'||!path.startsWith('/'))throw new Error('Fotografía recuperada sin ruta local.');
  const file=resolve(root,'public','.'+path),base=resolve(root,'public');if(!file.startsWith(base+sep))throw new Error('Ruta inválida.');
  try{const data=await readFile(file);const expected=byPath.get(path);if(expected&&createHash('sha256').update(data).digest('hex')!==expected)damaged.push(path);total++;}catch{missing.push(path);}
 }
 if(missing.length||damaged.length)throw new Error(`Revisión detenida: ${missing.length} fotos faltantes y ${damaged.length} distintas del manifiesto. Primeras rutas: ${[...missing,...damaged].slice(0,8).join(', ')}`);
 console.log(`Recuperación validada: ${document.products.length} productos y ${total} fotografías únicas. Precios, tallas y posiciones provienen de la última publicación confirmada.`);
 return {assets,document};
}
export async function activateRecovery(){
 const {assets,document}=await checkRecovery();
 const store=supabaseCatalogStore({url:process.env.EUSTORE_SUPABASE_URL,key:process.env.EUSTORE_SUPABASE_SERVICE_KEY});
 const token=process.env.EUSTORE_PUBLISH_TOKEN;if(!token||token.length<32)throw new Error('Falta EUSTORE_PUBLISH_TOKEN.');
 const service=syncService({getStore:()=>store,token,baselineAssets:assets});
 const current=await store.getWithMetadata('active');
 if(current&&current.data.revision!==document.revision)throw new Error('Ya hay otra publicación activa: se conserva. Usa la revisión del BackOffice para continuar.');
 const response=await service.handle(new Request('https://local.invalid/api/backoffice/commit',{method:'POST',headers:{authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({expected:current?.etag||null,document})}),'commit');
 const result=await response.json();if(!response.ok)throw new Error(result.error);console.log('Publicación recuperada y activada:',result.revision,'·',result.productCount,'productos.');
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 try{if(process.argv.includes('--activate'))await activateRecovery();else await checkRecovery();}
 catch(error){console.error(error.message);process.exitCode=1;}
}
