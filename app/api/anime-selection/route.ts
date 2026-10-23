import {getAnimeProducts,getLiveAnimePricing,publicAnimeProduct} from '@/lib/live-products';
export async function GET(request:Request){
 const raw=new URL(request.url).searchParams.get('ids')||'';if(raw.length>6000)return Response.json({error:'Selección demasiado grande'},{status:400});
 const ids=raw.split(',').filter(Boolean);if(ids.length>100||ids.some(id=>!/^EU-(?:ANIME-\d{3,4}|[A-F0-9]{24})$/.test(id)))return Response.json({error:'Referencias inválidas'},{status:400});
 const selected=new Set(ids);return Response.json({items:(await getAnimeProducts()).filter(p=>selected.has(p.id)).map(publicAnimeProduct),pricing:await getLiveAnimePricing()},{headers:{'Cache-Control':'no-store'}});
}
