"use client";
import Link from "next/link";
import type {ReactNode} from "react";

export default function ScrollToTopLink({children,className,ariaLabel}:{children:ReactNode;className?:string;ariaLabel?:string}){
 const handleClick=()=>{window.requestAnimationFrame(()=>window.scrollTo({top:0,behavior:"smooth"}));};
 return <Link href="/#top" className={className} aria-label={ariaLabel} onClick={handleClick}>{children}</Link>;
}
