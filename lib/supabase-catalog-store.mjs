// Server-side REST adapter. Credentials never belong in NEXT_PUBLIC_* variables.
const SHA = /^[a-f0-9]{64}$/;
const DOCUMENT = /^(active|revisions\/[a-f0-9-]{36})$/;
export function supabaseCatalogStore({url, key, bucket='eustore-catalog-assets', transport=fetch}) {
  let origin;
  try { const parsed=new URL(url); if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.search||parsed.hash||parsed.pathname!=='/')throw Error(); origin=parsed.origin; }
  catch { throw new Error('Configura EUSTORE_SUPABASE_URL con la URL HTTPS del proyecto.'); }
  if(typeof key!=='string'||key.length<32||!/^[-a-z0-9]{1,100}$/.test(bucket))throw new Error('Configura las credenciales privadas del almacenamiento.');
  const headers=key.startsWith('sb_secret_')?{apikey:key}:{apikey:key,Authorization:`Bearer ${key}`};
  const request=(path,init={})=>transport(origin+path,{...init,headers:{...headers,...init.headers},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
  const assetPath=name=>{if(!name.startsWith('assets/')||!SHA.test(name.slice(7)))throw new Error('Objeto inválido.');return '/storage/v1/object/'+bucket+'/'+name;};
  const dbRead=async (name,{metadataOnly=false,etag}={})=>{
    if(!DOCUMENT.test(name))throw new Error('Documento inválido.');
    const fields=metadataOnly?'etag':'document_text,etag';
    const response=await request('/rest/v1/eustore_sync_documents?key=eq.'+encodeURIComponent(name)+'&select='+fields+'&limit=1'+(etag?'&etag=eq.'+encodeURIComponent(etag):''));
    if(!response.ok)throw new Error('No se pudo leer la publicación persistente.');
    const rows=await response.json();if(!Array.isArray(rows))throw new Error('Respuesta de almacenamiento inválida.');
    return rows[0]?{...(metadataOnly?{}:{data:JSON.parse(rows[0].document_text)}),etag:rows[0].etag,metadata:{}}:null;
  };
  const head=async name=>{
    const response=await request(assetPath(name),{method:'HEAD'});
    if(response.status===404)return null;
    if(!response.ok)throw new Error('No se pudo verificar la fotografía persistente.');
    return {etag:response.headers.get('etag'),metadata:{mime:response.headers.get('content-type')||'application/octet-stream'}};
  };
  return {
    async getWithMetadata(name){
      if(!name.startsWith('assets/'))return dbRead(name);
      const response=await request(assetPath(name));
      if(response.status===404)return null;
      if(!response.ok)throw new Error('No se pudo leer la fotografía persistente.');
      return {data:await response.arrayBuffer(),etag:response.headers.get('etag'),metadata:{mime:response.headers.get('content-type')||'application/octet-stream'}};
    },
    async getMetadata(name){return name.startsWith('assets/')?head(name):dbRead(name,{metadataOnly:true});},
    async getWithMetadataIfMatch(name,etag){return dbRead(name,{etag});},
    async get(name){return (await this.getWithMetadata(name))?.data??null;},
    async set(name,value,options={}){
      const response=await request(assetPath(name),{method:'POST',headers:{'Content-Type':options.metadata?.mime||'application/octet-stream','x-upsert':'false','Cache-Control':'31536000'},body:value});
      if(response.ok)return {modified:true};
      // Storage reports an existing immutable object as 400 or 409 depending on version.
      let error;try{error=await response.json();}catch{}
      if((response.status===409||String(error?.statusCode)==='409'||error?.error==='Duplicate'||error?.code==='Duplicate')&&await head(name))return {modified:false};
      throw new Error('No se pudo guardar la fotografía persistente.');
    },
    async setJSON(name,value,options={}){
      if(!DOCUMENT.test(name)||(!options.onlyIfNew&&!options.onlyIfMatch))throw new Error('La escritura requiere control de versión.');
      const response=await request('/rest/v1/rpc/eustore_compare_and_set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({p_key:name,p_document:JSON.stringify(value),p_expected:options.onlyIfMatch||null,p_only_new:options.onlyIfNew===true})});
      if(!response.ok)throw new Error('No se pudo confirmar la publicación persistente.');
      const result=await response.json();if(typeof result?.modified!=='boolean')throw new Error('Confirmación persistente inválida.');return result;
    }
  };
}
