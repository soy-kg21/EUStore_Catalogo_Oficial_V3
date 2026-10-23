import {getLiveCatalog} from '@/lib/live-catalog';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json({revision:(await getLiveCatalog())?.revision||null},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Catálogo temporalmente no disponible.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
