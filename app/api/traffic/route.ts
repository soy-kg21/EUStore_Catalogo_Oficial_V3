import {traffic} from '@/lib/traffic-server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const POST=(request:Request)=>traffic.collect(request);
