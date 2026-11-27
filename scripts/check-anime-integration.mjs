import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {catalogCollections} from '../lib/catalog-collections.ts';

const base=process.env.CATALOG_TEST_URL||'http://127.0.0.1:5178';
const roots=['/','/catalogo',...Object.values(catalogCollections).map(collection=>collection.path),'/anime','/shop','/cartoon','/rock','/urbanas','/carrito'];
const expectedLinks=['/','/catalogo',...Object.values(catalogCollections).map(collection=>collection.path),'/ofertas'];
for(const path of new Set(roots)){
 const response=await fetch(base+path);
 assert.equal(response.status,200,path);
 const html=await response.text();
 assert(html.includes('class="announcement-track"'),path);
 assert(html.includes('class="brand-logo"'),path);
 const navigation=html.match(/<nav class="desktop-nav"[\s\S]*?<\/nav>/)?.[0];
 assert(navigation,path);
 for(const href of expectedLinks)assert(navigation.includes('href="'+href+'"'),path+' → '+href);
 assert.equal([...html.matchAll(/class="eu-scroll-progress"/g)].length,1,path);
}

const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
const baseline=JSON.parse(await read('data/catalog-v4-baseline-sha256.json'));
for(const file of ['data/catalog.json','data/commercial-rules.json','lib/commercial.ts']){
 const source=(await read(file)).replaceAll('\r\n','\n');
 assert.equal(createHash('sha256').update(source).digest('hex'),baseline[file],file);
}
console.log('PASS: encabezado compartido, rutas de colecciones, una línea de progreso y fuentes históricas íntegras.');
