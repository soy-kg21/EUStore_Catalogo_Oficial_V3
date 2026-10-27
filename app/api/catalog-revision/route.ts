import {getLiveRevision} from '@/lib/live-catalog';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){
 try{return Response.json({revision:await getLiveRevision()},{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Catálogo temporalmente no disponible.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
