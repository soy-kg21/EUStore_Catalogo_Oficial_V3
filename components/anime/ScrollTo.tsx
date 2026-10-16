'use client';
import type {ReactNode} from 'react';
export default function ScrollTo({id,className,children}:{id:string;className?:string;children:ReactNode}){return <button className={className} onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}>{children}</button>;}
