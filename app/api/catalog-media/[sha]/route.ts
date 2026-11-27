import {catalogService} from '@/lib/live-catalog';
export const runtime='nodejs';
const retired=new Set(['855a65942e1aec249d7825786c17db217d59b3ef0f37b693673d49e715baf590','b53c765d1803c70d8d8470b2d60fd08906d63244338f315f3b8119114c09b76f']);
export async function GET(_request:Request,{params}:{params:Promise<{sha:string}>}){
 const {sha}=await params;
 if(retired.has(sha))return new Response(null,{status:404});
 try{return await catalogService().media(sha);}catch{return new Response(null,{status:503});}
}
