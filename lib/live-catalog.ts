import {cache} from 'react';
import type {LiveSnapshot} from './live-types';
import {connection} from 'next/server';
import {getStore} from '@netlify/blobs';
import assets from '@/data/catalog-assets.json';
import {syncService,productionContext} from './catalog-sync-core.mjs';

// The SDK cancels bodies on 404. Supplying a signal avoids Next's shared fetch
// response tees and bounds requests when storage is temporarily unavailable.
const storageFetch:typeof fetch=(input,init)=>fetch(input,{...init,cache:'no-store',signal:AbortSignal.timeout(15000)});
export function catalogService(){return syncService({getStore:()=>getStore({name:'eustore-catalog-v1',consistency:'strong',fetch:storageFetch}),token:process.env.EUSTORE_PUBLISH_TOKEN,baselineAssets:assets,production:process.env.EUSTORE_LIVE_CATALOG==='1'&&productionContext(process.env.EUSTORE_BUILD_CONTEXT,process.env.CONTEXT)});}
export const getLiveCatalog=cache(async():Promise<LiveSnapshot|null>=>{
 if(process.env.EUSTORE_LIVE_CATALOG!=='1')return null;
 await connection();
 // A storage failure must not resurrect products removed from an active revision.
 return await catalogService().read();
});
