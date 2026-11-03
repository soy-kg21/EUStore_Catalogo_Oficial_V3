import {createHmac,timingSafeEqual} from 'node:crypto';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const KINDS=new Set(['view','heartbeat','whatsapp']);
const safePath=value=>typeof value==='string'&&value.length<=220&&/^\/(?:[a-z0-9-]+\/?)*$/.test(value)?value:'/';
const source=value=>{try{const u=new URL(value);return u.protocol==='https:'?u.hostname.slice(0,120):''}catch{return ''}};
const campaign=value=>typeof value==='string'&&/^[a-zA-Z0-9 _.-]{1,80}$/.test(value)?value:'';
const response=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function trafficService({url,key,token,enabled=false,transport=fetch,now=()=>Date.now()}){
 const limits=new Map();
 const ready=()=>enabled&&typeof token==='string'&&token.length>=32&&typeof key==='string'&&key.length>=32&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url||'');
 const hash=value=>createHmac('sha256',token).update(value).digest('hex');
 const rpc=async(name,input)=>{
  const r=await transport(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:'Bearer '+key}),'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(8000),cache:'no-store',redirect:'error'});
  if(!r.ok)throw Error('Traffic storage unavailable');return r.json();
 };
 return {
  async collect(request){
   if(!ready())return response({accepted:false},503);
   if(request.headers.get('origin')!==new URL(request.url).origin)return response({accepted:false},403);
   if(request.headers.get('sec-gpc')==='1'||request.headers.get('dnt')==='1'||/bot|crawler|spider|headless|preview/i.test(request.headers.get('user-agent')||''))return response({accepted:false});
   if(!request.headers.get('content-type')?.startsWith('application/json'))return response({accepted:false},415);
   try{
    const reader=request.body?.getReader();let text='',size=0;const decoder=new TextDecoder();
    if(!reader)throw Error();while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return response({accepted:false},413);}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();
    const body=JSON.parse(text);if(!UUID.test(body.session)||!UUID.test(body.event)||!KINDS.has(body.kind))return response({accepted:false},400);
    const stamp=now(),minute=Math.floor(stamp/60000),ip=hash(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown'),bucket=limits.get(ip);
    if(limits.size>5000)for(const [k,v] of limits)if(v.minute!==minute)limits.delete(k);
    if(limits.size>5000||bucket?.minute===minute&&bucket.count>=60)return response({accepted:false},429);
    limits.set(ip,{minute,count:bucket?.minute===minute?bucket.count+1:1});
    const day=new Date(stamp).toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
    const accepted=await rpc('eustore_traffic_collect',{p_session:hash(day+':'+body.session),p_event:hash(day+':'+body.session+':'+body.event),p_kind:body.kind,p_path:safePath(body.path),p_source:source(body.referrer),p_campaign:campaign(body.campaign)});
    return response({accepted:accepted===true});
   }catch{return response({accepted:false},503);}
  },
  async summary(request){
   if(typeof token!=='string'||token.length<32)return response({error:'Conector no configurado.'},503);
   const actual=Buffer.from(request.headers.get('authorization')||''),expected=Buffer.from('Bearer '+token);
   if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return response({error:'No autorizado.'},401);
   if(!ready())return response({error:'La medición aún no está habilitada en el catálogo.'},503);
   try{return response({protocol:'eustore-traffic-v1',...await rpc('eustore_traffic_summary',{})});}
   catch{return response({error:'No se pudo consultar el tráfico. Comprueba la migración de almacenamiento.'},503);}
  }
 };
}
