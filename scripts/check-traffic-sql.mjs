// Optional integration check: node scripts/check-traffic-sql.mjs /path/to/@electric-sql/pglite/dist/index.js
import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {trafficService} from '../lib/traffic-core.mjs';
const {PGlite}=await import(pathToFileURL(process.argv[2]).href),db=new PGlite();
try{
 await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon,authenticated,service_role;');
 const sql=await readFile(new URL('../database/migrations/20261102_traffic.sql',import.meta.url),'utf8');
 await db.exec(sql);await db.exec(sql); // Migration can be applied twice.
 await db.exec('set role anon');
 await assert.rejects(()=>db.query('select public.eustore_traffic_summary()'),/permission denied/);
 await assert.rejects(()=>db.query('select * from public.eustore_traffic_events'),/permission denied/);
 await db.exec('reset role;set role service_role;');
 const api=trafficService({url:'https://fixture.supabase.co',key:'k'.repeat(40),token:'t'.repeat(40),enabled:true,transport:async(url,init)=>{
  const b=JSON.parse(init.body);let result;
  if(url.endsWith('eustore_traffic_summary'))result=(await db.query('select public.eustore_traffic_summary() as value')).rows[0].value;
  else result=(await db.query('select public.eustore_traffic_collect($1,$2,$3,$4,$5,$6) as value',[b.p_session,b.p_event,b.p_kind,b.p_path,b.p_source,b.p_campaign])).rows[0].value;
  return Response.json(result);
 }});
 const session=crypto.randomUUID(),event=crypto.randomUUID();
 const collect=(kind,path='/anime',id=crypto.randomUUID())=>api.collect(new Request('https://www.evolucionurbana.store/api/traffic',{method:'POST',headers:{origin:'https://www.evolucionurbana.store','content-type':'application/json'},body:JSON.stringify({session,event:id,kind,path,referrer:'https://facebook.com/sensitive?phone=123',campaign:'anime_noviembre'})}));
 await collect('view','/anime',event);await collect('view','/anime',event);await collect('heartbeat');await collect('view','/cartoon');await collect('whatsapp','/cartoon');
 const summary=await (await api.summary(new Request('https://web/api/backoffice/traffic-summary',{headers:{authorization:'Bearer '+'t'.repeat(40)}}))).json();
 assert.equal(summary.protocol,'eustore-traffic-v1');assert.equal(summary.active,1);assert.equal(summary.sessionsToday,1);assert.equal(summary.viewsToday,2);assert.equal(summary.whatsappToday,1);assert.equal(summary.pages.length,2);assert.equal(summary.sources[0].source,'facebook.com');assert.equal(summary.sources[0].campaign,'anime_noviembre');assert(!JSON.stringify(summary).includes(session));
 await db.exec("update public.eustore_traffic_sessions set seen_at=now()-interval '32 days'");
 await db.query('select public.eustore_traffic_summary()');
 assert.equal((await db.query('select count(*)::int as n from public.eustore_traffic_events')).rows[0].n,0);
 console.log('PASS: API → PostgreSQL → resumen privado; migración repetible, deduplicación, permisos y retención.');
}finally{await db.close();}
