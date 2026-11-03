import test from 'node:test';
import assert from 'node:assert/strict';
import {animeQuote} from '../lib/anime-commercial.ts';
import {quoteLive} from '../lib/live-pricing.ts';
import {currentCommercialPublication} from '../lib/commercial-release.mjs';
import {trafficService} from '../lib/traffic-core.mjs';
const totals=[68000,93000,126000,156000,185000];
test('cantidades, tallas especiales y publicación previa conservan precios coherentes',()=>{
 for(let n=1;n<=5;n++)assert.equal(animeQuote(n).merchandise,totals[n-1]);
 const old={section:'anime',commerce:{rule:{kind:'total',retail:[68000,93000,126000,152000,180000],wholesale:[]}}};
 const doc={products:[old,{...old,section:'general'}]},next=currentCommercialPublication(doc);
 assert.deepEqual(next.products[0].commerce.rule.retail,totals);assert.equal(doc.products[0],old);assert.equal(next.products[1],doc.products[1]);
 const custom={products:[{...old,commerce:{rule:{...old.commerce.rule,retail:[68000,93000,126000,160000,190000]}}}]};assert.equal(currentCommercialPublication(custom),custom);
 const product={id:'shirt',price:68000,variants:[{size:'M',quantity:null},{size:'XXL',quantity:null}],_live:{bucket:'shop',rule:{kind:'total',retail:totals,wholesale:[[6,11,32000]]},quoteFrom:null,shippingFrom:6,advance:false}};
 assert.equal(quoteLive([{id:'shirt',size:'M',quantity:4}],[product],{specialSizes:true}).subtotal,156000);
 const special=quoteLive([{id:'shirt',size:'XXL',quantity:2}],[product],{specialSizes:true});assert.equal(special.total,null);assert.equal(special.advance,true);
});
test('tráfico no revela consultas ni identificadores, restringe lectura y respeta privacidad',async()=>{
 const calls=[],token='t'.repeat(40),api=trafficService({url:'https://example.supabase.co',key:'k'.repeat(40),token,enabled:true,transport:async(url,init)=>{calls.push({url,...init,body:JSON.parse(init.body)});return Response.json(url.endsWith('summary')?{active:1,daily:[],pages:[],sources:[]}:true);}});
 const payload={session:crypto.randomUUID(),event:crypto.randomUUID(),kind:'view',path:'/anime?phone=123',referrer:'https://facebook.com/secret?phone=123',campaign:'anime_noviembre'};
 const request=(origin='https://www.evolucionurbana.store',extra={})=>new Request('https://www.evolucionurbana.store/api/traffic',{method:'POST',headers:{origin,'content-type':'application/json',...extra},body:JSON.stringify(payload)});
 assert.equal((await api.collect(request())).status,200);assert.equal(calls[0].body.p_path,'/');assert.equal(calls[0].body.p_source,'facebook.com');assert(!JSON.stringify(calls[0].body).includes(payload.session));assert(!JSON.stringify(calls[0].body).includes('123'));
 assert.equal((await api.collect(request('https://evil.example'))).status,403);assert.equal(calls.length,1);
 await api.collect(request(undefined,{'sec-gpc':'1'}));assert.equal(calls.length,1);
 assert.equal((await api.summary(new Request('https://test'))).status,401);
 assert.equal((await api.summary(new Request('https://test',{headers:{authorization:'Bearer '+token}}))).status,200);
 assert.equal((await trafficService({enabled:false}).collect(request())).status,503);
});
