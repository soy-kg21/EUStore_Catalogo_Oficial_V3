// Validate responsive candidates against real source files and rendered markup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const require=createRequire(import.meta.url),root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const records=JSON.parse(read('data/anime-catalog.json'));
const dimensions=JSON.parse(read('data/anime-image-dimensions.json'));
const sharp=createRequire(require.resolve('next/package.json'))('sharp');
const exports={};
new Function('require','exports',ts.transpileModule(read('lib/anime-image.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(name=>{
 assert.equal(name,'@/data/anime-image-dimensions.json');return dimensions;
},exports);
let checks=0;
for(const product of records){
 const [original,thumbnail]=await Promise.all([product.image,product.thumbnail].map(file=>sharp(new URL('public'+file,root).pathname).metadata()));
 const actual=metadata=>[5,6,7,8].includes(metadata.orientation)?[metadata.height,metadata.width]:[metadata.width,metadata.height];
 assert.deepEqual(dimensions[product.id],[...actual(original),...actual(thumbnail)],product.id);
 const props=exports.animeImageProps(product);
 assert(!props.src.includes('/_next/image'));assert(fs.existsSync(new URL('public'+props.src,root)));
 if(props.srcSet){
  const candidates=props.srcSet.split(', ').map(value=>value.split(' '));
  assert.deepEqual(candidates.map(c=>c[1]),[`${actual(thumbnail)[0]}w`,`${actual(original)[0]}w`]);
  assert.equal(candidates[1][0],product.image);
 }else assert.equal(props.src,product.image);
 checks++;
}
assert.equal(exports.animeImageProps({id:'future-product',image:'/future.webp'}).src,'/future.webp');
const imageModule={};
new Function('require','exports',ts.transpileModule(read('components/anime/AnimeCatalogImage.tsx'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(name=>name==='@/lib/anime-image'?exports:require(name),imageModule);
for(const line of ['anime','cartoon','rock','urbanos']){
 const product=records.find(p=>p.line===line&&!p.canonicalId);
 for(const eager of [false,true]){
  const html=renderToStaticMarkup(React.createElement(imageModule.default,{product,alt:product.name,eager}));
  assert(!html.includes('/_next/image'));assert(html.includes(`loading="${eager?'eager':'lazy'}"`));
  assert(html.includes('decoding="async"'));assert(html.includes('srcSet='));checks++;
 }
}
console.log(`PASS: ${checks} comprobaciones de fotos originales, resoluciones reales y marcado de imágenes de las cuatro líneas.`);
