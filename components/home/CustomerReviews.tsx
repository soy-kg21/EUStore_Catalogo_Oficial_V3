import reviews from '@/data/reviews.json';
import {Star} from 'lucide-react';
type Review={name:string;text:string;rating:number;date:string};
export default function CustomerReviews(){
 const entries=(reviews as Review[]).filter(r=>r.name&&r.text&&r.rating>=1&&r.rating<=5);
 if(!entries.length)return null;
 return <div className="customer-reviews">{entries.map((r,i)=><article key={i}><div aria-label={`${r.rating} de 5 estrellas`}>{Array.from({length:5},(_,n)=><Star key={n} size={16} fill={n<r.rating?'currentColor':'none'} aria-hidden="true"/>)}</div><blockquote>“{r.text}”</blockquote><p>{r.name}<time>{r.date}</time></p></article>)}</div>
}
