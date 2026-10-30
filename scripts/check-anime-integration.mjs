import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes,createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {animeCategorySlug,animeLines} from '../lib/anime-catalog-core.ts';
const require=createRequire(import.meta.url),read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8').replaceAll('\r\n','\n');
const baseline=JSON.parse(read('data/general-baseline-sha256.json'));
let path='/anime';const Link=({href,children,...props})=>React.createElement('a',{href,...props},children);
const simple=({children,...props})=>React.createElement('div',props,children);
const slot={Sheet:simple,SheetContent:simple,SheetTitle:simple,SheetTrigger:simple,SheetDescription:simple,Dialog:simple,DialogContent:simple,DialogTitle:simple,DialogTrigger:simple,DialogDescription:simple};
const Cart=()=>React.createElement('div',null,'Original catalog cart');
function renderHeader(){
 const javascript=ts.transpileModule(read('components/store/Header.tsx'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,exports={};
 const config={categories:[{slug:'camisetas',name:'Camisetas'},{slug:'zapatillas',name:'Zapatillas'},{slug:'conjuntos',name:'Conjuntos'}],money:String,wa:value=>'https://wa.me/test?text='+encodeURIComponent(value)};
 const mockRequire=name=>name.endsWith('.css')?{__esModule:true,default:{}}:name==='next/link'?{__esModule:true,default:Link}:name==='next/navigation'?{usePathname:()=>path,useRouter:()=>({push(){}})}:name.includes('/ui/sheet')||name.includes('/ui/dialog')?slot:name==='@/lib/config'?config:name==='@/lib/anime-selection'?{useAnimeSelection:()=>({count:0}),openAnimeCombo(){}}:name==='@/lib/anime-routes'?{isAnimeShopPath:value=>/^\/(anime|cartoon|rock|urbanas|shop)(\/|$)/.test(value)}:name==='./Cart'?{__esModule:true,default:Cart}:name.includes('AnimeComboDrawer')?{__esModule:true,default:()=>null}:name==='./WhatsAppIcon'||name.endsWith('theme-toggle')?{__esModule:true,default:()=>null}:require(name);
 new Function('require','exports',javascript)(mockRequire,exports);return renderToStaticMarkup(React.createElement(exports.default));
}
let checks=0;
for(path of ['/','/catalogo','/categoria/camisetas','/categoria/zapatillas','/categoria/conjuntos','/anime','/shop','/cartoon','/rock','/urbanas','/anime/hellsing-negro']){
 const html=renderHeader();assert(html.includes('class="announcement-track"'));assert(html.includes('MODA URBANA / COLOMBIA'));assert(html.includes('class="brand-logo"'));assert(!html.includes('Navegación Anime Shop'));
 for(const href of ['/','/catalogo','/categoria/camisetas','/categoria/zapatillas','/categoria/conjuntos','/anime','/ofertas'])assert(html.includes('href="'+href+'"'),path+': '+href);checks++;
}
for(const [file,expected] of Object.entries(baseline)){assert.equal(createHash('sha256').update(read(file)).digest('hex'),expected,file);checks++;}
console.log(`PASS: ${checks} comprobaciones de integración: mismo menú original, Inicio y tres categorías generales accesibles desde once rutas; ticker, datos generales, estilos base y pie preservados; inicio y tarifa B7 actualizados según el alcance autorizado.`);
