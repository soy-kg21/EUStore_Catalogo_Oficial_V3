import {trafficService} from './traffic-core.mjs';
export const traffic=trafficService({url:process.env.EUSTORE_SUPABASE_URL,key:process.env.EUSTORE_SUPABASE_SERVICE_KEY,token:process.env.EUSTORE_PUBLISH_TOKEN,enabled:process.env.EUSTORE_TRAFFIC_ENABLED==='1'});
