import {gzipSync,gunzipSync} from 'node:zlib';
export class CatalogChanged extends Error {}
export function packCatalog(row,etag){
 if(!row||row.etag!==etag)throw new CatalogChanged('La publicación cambió durante la lectura.');
 const document=row.data;
 if(typeof document?.revision!=='string'||!Array.isArray(document.products))throw new Error('Publicación persistente inválida.');
 return {revision:document.revision,etag,body:gzipSync(Buffer.from(JSON.stringify(document))).toString('base64')};
}
export function unpackCatalog(entry){return JSON.parse(gunzipSync(Buffer.from(entry.body,'base64')).toString('utf8'));}
// Every request checks the small active ETag; only a new ETag needs the full body.
// Errors are never converted into a stale or empty catalog.
export async function readPublicCatalogEntry(store,scope,loadCached){
 for(let attempt=0;attempt<2;attempt++){
  const metadata=await store.getMetadata('active');
  if(!metadata?.etag)throw new Error('Falta activar la publicación recuperada en el almacenamiento.');
  try{return await loadCached(scope,metadata.etag);}
  catch(error){if(!(error instanceof CatalogChanged)||attempt===1)throw error;}
 }
 throw new Error("No se pudo estabilizar la publicación.");
}
