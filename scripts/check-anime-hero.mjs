// Server render of the real component: verifies the three real garments and links for every division.
// This does not replace an interactive browser layout review.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire,stripTypeScriptTypes} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {ImageConfigContext} from 'next/dist/shared/lib/image-config-context.shared-runtime.js';
import {imageConfigDefault} from 'next/dist/shared/lib/image-config.js';
const require=createRequire(import.meta.url),read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const records=JSON.parse(read('data/anime-catalog.json')),routes=JSON.parse(read('data/anime-public-routes.json'));
const experiences=new Function(stripTypeScriptTypes(read('lib/anime-experience.ts')).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')+'\nreturn animeExperience;')();
const styles=new Proxy({},{get:(_target,name)=>String(name)});
function loadComponent(file){
 if(file.endsWith('.json'))return JSON.parse(read(file));
 const javascript=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,exports={};
 const componentRequire=name=>name.endsWith('.module.css')?{__esModule:true,default:styles}:name==='@/lib/anime-cinema-runtime'?{mountAnimeCinema(){}}:name==='@/lib/anime-cinema-art'?loadComponent('lib/anime-cinema-art.ts'):name==='@/lib/anime-routes'?{animeProductHref:id=>routes[id].path}:name==='./AnimeProductLink'?{__esModule:true,default:({productId,...props})=>React.createElement(require('next/link').default,props)}:name==='./AnimeActionScene'?loadComponent('components/anime/AnimeActionScene.tsx'):name==='./AnimeCatalogImage'?loadComponent('components/anime/AnimeCatalogImage.tsx'):name==='@/lib/anime-image'?loadComponent('lib/anime-image.ts'):name==='@/data/anime-image-dimensions.json'?loadComponent('data/anime-image-dimensions.json'):require(name);
 new Function('require','exports',javascript)(componentRequire,exports);return exports;
}
const exports=loadComponent('components/anime/AnimeUniverseHero.tsx');
const expected={anime:['gojo','naruto','goku','luffy'],cartoon:['popeye','johnny','scooby','panther'],rock:['slash','freddie','kurt','ozzy'],urbanos:['jordan','ghostface','canserbero','snoop'],shop:['gojo','popeye','slash','jordan']};
let checks=0;
for(const [line,experience] of Object.entries(experiences)){
 const products=experience.heroIds.map(id=>records.find(product=>product.id===id));assert.equal(products.length,3);assert.equal(new Set(products.map(p=>p.id)).size,3);
 assert(products.every(p=>line==='shop'?p.line==='anime':p.line===line));
 const html=renderToStaticMarkup(React.createElement(ImageConfigContext.Provider,{value:{...imageConfigDefault,qualities:[75,85]}},React.createElement(exports.default,{products,division:experience.eyebrow,title:experience.title,description:experience.description,line})));
 assert.deepEqual([...html.matchAll(/data-cinema-art="([^"]+)"/g)].map(m=>m[1]),expected[line]);checks++;
 for(const match of html.matchAll(/background-image:url\(&#x27;([^&]+)&#x27;\)/g))assert(fs.existsSync(new URL('../public'+match[1],import.meta.url)));
 if(line==='urbanos')assert(html.includes('jordan-cinema-v2.webp'));
 assert.equal([...html.matchAll(/<img /g)].length,3);assert(html.includes('<canvas'));assert(!html.includes('data-cinema="brand-a"'));assert(!html.includes('data-cinema="label-a"'));assert(html.includes('data-cinema="copy-title"'));if(line==='anime'||line==='shop'){assert(html.includes('GOJO SATORU'));assert(html.includes('TU UNIVERSO'));assert(html.includes('A LA CALLE'));}assert.equal((html.match(/data-cinema-shot=/g)||[]).length,4);assert(html.includes('href="#anime-inicio"'));assert(!html.includes('href="/categoria/camisetas"'));assert(html.includes('data-cinema-home'));for(const product of products){assert(html.includes(`href="${routes[product.id].path}"`));assert(html.includes(product.name.replaceAll('&','&amp;')));checks++;}
 assert(html.includes('href="#anime-discover"'));assert(html.includes('href="#precios"'));checks++;
}
console.log(`PASS: ${checks} comprobaciones del hero real renderizado: cinco secuencias aprobadas, Jordan remodelado, camisetas por línea, enlaces individuales y accesos a colección y precios. Sin navegador.`);
