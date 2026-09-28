import Image from 'next/image';
import images from '@/data/category-images.json';
export default function CategoryVisual({category,fallback}:{category:string;fallback:string}){
 const frames=(images as Record<string,string[]>)[category]||[];
 const items=frames.length?frames:[fallback];
 return <div className={`category-frames ${items.length>1?'has-slides':''}`} style={{'--frames':items.length} as React.CSSProperties}>{items.map((src,index)=><Image key={src} src={src} alt="" fill sizes="(max-width:700px) 90vw,33vw" style={{animationDelay:`${index*5}s`}}/>)}</div>
}
