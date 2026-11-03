import {catalogService} from '@/lib/live-catalog';
import {traffic} from '@/lib/traffic-server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{path:string[]}>};
async function handle(request:Request,context:Context){const path=(await context.params).path.join('/');if(path==='traffic-summary'&&request.method==='GET')return traffic.summary(request);return catalogService().handle(request,path);}
export const GET=handle;
export const POST=handle;
export const PUT=handle;
