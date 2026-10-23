import {catalogService} from '@/lib/live-catalog';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{sha:string}>}){try{return await catalogService().media((await params).sha);}catch{return new Response(null,{status:503});}}
