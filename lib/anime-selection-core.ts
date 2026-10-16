import index from '../data/anime-index.json';
export type AnimeSelection={id:string;size?:string;quantity:number};
const ids=new Set(index.ids),aliases=index.aliases as Record<string,string>;
export const animeSelectionLineKey=(row:Pick<AnimeSelection,'id'|'size'>)=>`${row.id}:${row.size||''}`;
export function parseAnimeSelection(raw:string):AnimeSelection[]{
 try{const input:unknown=JSON.parse(raw);if(!Array.isArray(input))return [];const lines=new Map<string,AnimeSelection>();
 for(const item of input.slice(0,200)){
  if(typeof item!=='string'&&(!item||typeof item!=='object'))continue;
  const value=(typeof item==='string'?{id:item}:item) as {id?:unknown;size?:unknown;quantity?:unknown};if(typeof value.id!=='string')continue;
  const id=aliases[value.id]||value.id;if(!ids.has(id))continue;
  const size=typeof value.size==='string'&&['S','M','L','XL'].includes(value.size)?value.size:undefined;
  const quantity=value.quantity===undefined?1:typeof value.quantity==='number'&&Number.isInteger(value.quantity)?Math.min(99,Math.max(0,value.quantity)):0;if(!quantity)continue;
  const row={id,...(size?{size}:{}),quantity},key=animeSelectionLineKey(row),previous=lines.get(key);
  lines.set(key,{...row,quantity:Math.min(99,quantity+(previous?.quantity||0))});if(lines.size>=100)break;
 }return [...lines.values()];}catch{return [];}
}
export function changeAnimeSelection(rows:AnimeSelection[],id:string,size:string|undefined,patch:{quantity?:number;nextSize?:string;add?:number}):AnimeSelection[]{
 const key=animeSelectionLineKey({id,size}),current=rows.find(row=>animeSelectionLineKey(row)===key);
 const quantity=patch.quantity??((current?.quantity||0)+(patch.add||0)),replacement={id,size:patch.nextSize??size,quantity};
 const next=rows.flatMap(row=>animeSelectionLineKey(row)===key?(quantity>0?[replacement]:[]):[row]);
 if(!current&&quantity>0)next.push(replacement);
 return parseAnimeSelection(JSON.stringify(next));
}
