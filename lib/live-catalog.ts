import {cache} from 'react';
import type {LiveSnapshot} from './live-types';
import {connection} from 'next/server';
import {unstable_cache} from 'next/cache';
import {getStore} from '@netlify/blobs';
import assets from '@/data/catalog-assets.json';
import recovered from '@/data/recovered-publication.json';
import {syncService,productionContext} from './catalog-sync-core.mjs';
import {supabaseCatalogStore} from './supabase-catalog-store.mjs';
import {packCatalog,unpackCatalog,readPublicCatalogEntry} from './catalog-read-cache.mjs';

const storageFetch:typeof fetch=(input,init)=>fetch(input,{...init,cache:'no-store',signal:AbortSignal.timeout(15000)});
const provider=()=>process.env.EUSTORE_STORAGE_PROVIDER||(process.env.VERCEL?'supabase':'netlify');
const supabaseStore=()=>supabaseCatalogStore({url:process.env.EUSTORE_SUPABASE_URL,key:process.env.EUSTORE_SUPABASE_SERVICE_KEY,transport:storageFetch});
const cachedDocument=unstable_cache(async(scope:string,etag:string)=>{
 if(scope!==process.env.EUSTORE_SUPABASE_URL)throw new Error('Origen del catálogo incompatible.');
 return packCatalog(await supabaseStore().getWithMetadataIfMatch('active',etag),etag);
},['eustore-public-document-v6-1'],{revalidate:3600});
const publicEntry=cache(async()=>readPublicCatalogEntry(supabaseStore(),process.env.EUSTORE_SUPABASE_URL||'',cachedDocument));
export function catalogService(){
 const store=()=>{
  if(provider()==='supabase')return supabaseStore();
  if(provider()==='netlify')return getStore({name:'eustore-catalog-v1',consistency:'strong',fetch:storageFetch});
  throw new Error('Proveedor de almacenamiento desconocido.');
 };
 // Administrative reads and commits always bypass the public body cache.
 return syncService({getStore:store,token:process.env.EUSTORE_PUBLISH_TOKEN,baselineAssets:assets,production:process.env.EUSTORE_LIVE_CATALOG==='1'&&productionContext(process.env.EUSTORE_BUILD_CONTEXT,process.env.CONTEXT,process.env.VERCEL_ENV)});
}
export const getLiveCatalog=cache(async():Promise<LiveSnapshot>=>{
 if(process.env.EUSTORE_LIVE_CATALOG!=='1')return recovered as unknown as LiveSnapshot;
 await connection();
 if(provider()==='supabase')return unpackCatalog(await publicEntry()) as LiveSnapshot;
 const document=await catalogService().read();
 if(!document)throw new Error('Falta activar la publicación recuperada en el almacenamiento.');
 return document;
});
export const getLiveRevision=cache(async():Promise<string|null>=>{
 if(process.env.EUSTORE_LIVE_CATALOG!=='1')return recovered.revision;
 await connection();
 if(provider()==='supabase')return (await publicEntry()).revision;
 return (await catalogService().read())?.revision||null;
});
