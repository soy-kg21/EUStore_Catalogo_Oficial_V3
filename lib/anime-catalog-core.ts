export type AnimeLine = 'anime' | 'cartoon' | 'rock' | 'urbanos';
export type AnimeProduct = {
  id:string; slug:string; name:string; image:string; thumbnail:string; backdrop:string;
  category:string; line:AnimeLine; sizes:readonly string[]; price:number; isNew:boolean; availability:'Disponible';
  material:string; weightGrams:number|null; fit:string; releaseBatch:string; sourceName:string;
  canonicalId?:string; searchAliases?:string[]; supplier?:{pdf:string;page:number;key:string;name:string};
};
export type AnimeClientProduct = Omit<AnimeProduct,'sourceName'|'releaseBatch'|'supplier'|'canonicalId'>;
export const animeLines = [{id:'anime',name:'Anime'},{id:'cartoon',name:'Cartoon'},{id:'rock',name:'Rock'},{id:'urbanos',name:'Urbanas'}] as const;
export const normalizeAnimeText=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').trim();
export const animeCategorySlug=(s:string)=>normalizeAnimeText(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export type AnimeFilters={linea:string;categoria:string;q:string;doble?:boolean};
export function readAnimeFilters(search:string):AnimeFilters{
  const p=new URLSearchParams(search),linea=p.get('linea')||'';
  return {linea:animeLines.some(l=>l.id===linea)?linea:'',categoria:p.get('categoria')||'',q:(p.get('q')||'').slice(0,100)};
}
export function filterAnimeProducts<T extends AnimeClientProduct>(products:T[],filters:AnimeFilters):T[]{
  const q=normalizeAnimeText(filters.q);
  return products.filter(p=>(!filters.linea||p.line===filters.linea)&&(!filters.categoria||animeCategorySlug(p.category)===filters.categoria)&&(!q||normalizeAnimeText(`${p.name} ${p.id} ${p.category} ${p.line} ${p.searchAliases?.join(' ')||''}`).includes(q)));
}
function diversify<T extends AnimeClientProduct>(rows:T[]):T[]{
  const groups=new Map<string,T[]>();
  for(const p of rows){const key=`${p.line}:${p.category}`;const group=groups.get(key)||[];group.push(p);groups.set(key,group);}
  const lines=animeLines.map(line=>[...groups.entries()].filter(([key])=>key.startsWith(line.id+':')).map(([,items])=>items));
  const result:T[]=[];let categoryRound=0;
  while(result.length<rows.length){
    let added=false;
    for(const categories of lines){if(!categories.length)continue;for(let step=0;step<categories.length;step++){
      const group=categories[(categoryRound+step)%categories.length];if(group.length){result.push(group.shift()!);added=true;break;}
    }}
    if(!added)break;categoryRound++;
  }
  return result;
}
/** 19 nuevos + 6 originales por bloque completo de 25 mientras ambas listas alcancen.
 * Al agotarse una lista, mostrar el resto una sola vez, sin ocultar productos. */
export function orderAnimeProducts<T extends AnimeClientProduct>(products:T[]):T[]{
  const fresh=diversify(products.filter(p=>p.isNew)),original=diversify(products.filter(p=>!p.isNew));
  const result:T[]=[];let n=0,o=0;
  while(n<fresh.length&&o<original.length){
    if(Math.round((result.length+1)*.76)>n)result.push(fresh[n++]);else result.push(original[o++]);
  }
  return [...result,...fresh.slice(n),...original.slice(o)];
}
export function animeLineHref(line:AnimeLine){return line==='urbanos'?'/urbanas':`/${line}`;}
