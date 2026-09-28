'use client';
import {useEffect,useState,useRef} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ArrowUpRight,ArrowRight,Menu,Search,ShoppingBag,BadgeCheck} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetTrigger,SheetDescription} from '@/components/ui/sheet';
import {Dialog,DialogContent,DialogTitle,DialogTrigger,DialogDescription} from '@/components/ui/dialog';
import {categories,money,wa} from '@/lib/config';
import type {Product} from '@/lib/types';
import Cart from './Cart';
import WhatsAppIcon from './WhatsAppIcon';
import ThemeToggle from '@/components/ui/theme-toggle';

const notices=[
'ARMA TU COMBO Y PAGA MENOS',
'RECIBE TU PEDIDO EN TODA COLOMBIA',
'ASESORÍA PERSONALIZADA AL WHATSAPP',
'TU ESTILO. TU PRÓXIMA EVOLUCIÓN.'
];

export default function Header(){

 const [count,setCount]=useState(0),
 [menuOpen,setMenuOpen]=useState(false),
 [searchOpen,setSearchOpen]=useState(false),
 [cartOpen,setCartOpen]=useState(false),
 [query,setQuery]=useState(''),
 [results,setResults]=useState<Product[]>([]),
 [loading,setLoading]=useState(false),
 [error,setError]=useState(false);

 const path=usePathname();

 const [lastPath,setLastPath]=useState(path);

 if(lastPath!==path){
   setLastPath(path);
   setSearchOpen(false);
   setMenuOpen(false);
   setCartOpen(false);
 }

 const isActive=(href:string)=>
 href==='/' ? path==='/' : path===href || path.startsWith(href+'/');


 // CORREGIDO: ya no bloquea la navegación móvil
 const goTop=(e:any)=>{
   if(path==='/'){
     e.preventDefault();
     window.scrollTo({
       top:0,
       behavior:'smooth'
     });
   }
 };


 const cache=useRef(new Map<string,Product[]>());

 const [suggestions,setSuggestions]=useState<Product[]>([]);


 useEffect(()=>{

  if(!menuOpen||suggestions.length)return;

  const controller=new AbortController();

  fetch('/api/products?discovery=1',{signal:controller.signal})
  .then(response=>{
    if(!response.ok)throw new Error('Discovery unavailable');
    return response.json() as Promise<{items:Product[]}>
  })
  .then(data=>setSuggestions(data.items||[]))
  .catch(()=>{});

  return()=>controller.abort();

 },[menuOpen,suggestions.length]);


 useEffect(()=>{

 const update=()=>{
 try{
 const rows=JSON.parse(localStorage.getItem('eu-cart-v2')||'[]');
 setCount(
 Array.isArray(rows)
 ? rows.reduce(
 (n:number,r:{quantity:number})=>n+(Number(r.quantity)||0),
 0)
 :0
 );
 }catch{
 setCount(0)
 }
 };

 const open=()=>setCartOpen(true);

 update();

 window.addEventListener('eu-cart',update);
 window.addEventListener('eu-open-cart',open);
 window.addEventListener('storage',update);

 return()=>{
 window.removeEventListener('eu-cart',update);
 window.removeEventListener('eu-open-cart',open);
 window.removeEventListener('storage',update);
 }

 },[]);


 useEffect(()=>{

 if(!searchOpen)return;

 const cached=cache.current.get(query);

 if(cached){
 setResults(cached);
 setLoading(false);
 setError(false);
 return;
 }

 const c=new AbortController();

 setLoading(true);
 setError(false);

 const timer=setTimeout(()=>{

 fetch(`/api/products?q=${encodeURIComponent(query)}`,{signal:c.signal})
 .then(r=>{
 if(!r.ok)throw Error();
 return r.json() as Promise<{items:Product[]}>
 })
 .then(d=>{

 if(!c.signal.aborted){

 const items=d.items.slice(0,4);

 cache.current.set(query,items);

 setResults(items);

 }

 })
 .catch(e=>{

 if(e.name!=='AbortError'){
 setResults([]);
 setError(true);
 }

 })
 .finally(()=>{

 if(!c.signal.aborted)
 setLoading(false);

 });

 },120);


 return()=>{
 clearTimeout(timer);
 c.abort();
 }

 },[query,searchOpen]);



return <>

<div className="announcement">

<div className="announcement-progress" aria-hidden="true">
<span/>
</div>

<span className="announcement-origin">
MODA URBANA / COLOMBIA 
<BadgeCheck size={16}/>
</span>


<div className="announcement-window">
<div className="announcement-track">

{[0,1].map(n=>
<div key={n}>
{notices.map(t=>
<span key={t}>
{t}<i>✦</i>
</span>
)}
</div>
)}

</div>
</div>


<a 
className="announcement-wa"
href={wa('Hola, quisiera asesoría de Evolución Urbana.')}
target="_blank"
rel="noopener noreferrer"
>
<WhatsAppIcon size={16}/>
WhatsApp
<ArrowUpRight size={13}/>
</a>


</div>



<header className="header">


<Sheet open={menuOpen} onOpenChange={setMenuOpen}>

<SheetTrigger 
className="icon-button mobile-menu"
aria-label="Abrir menú"
>
<Menu/>
</SheetTrigger>


<SheetContent side="left" className="premium-drawer">

<SheetTitle>
EVOLUCIÓN URBANA
</SheetTitle>

<SheetDescription>
Tu estilo. Tu próxima evolución.
</SheetDescription>



<nav className="drawer-nav" aria-label="Navegación móvil">


{[
{href:'/',name:'Inicio'},
{href:'/catalogo',name:'Todo el catálogo'},
...categories.map(c=>({
href:'/categoria/'+c.slug,
name:c.name
})),
{href:'/ofertas',name:'Combos'},
{href:'/nosotros',name:'Nuestra esencia'}

].map((i,n)=>

<Link

key={i.href}

href={i.href}

aria-current={
isActive(i.href)?"page":undefined
}

onClick={()=>setMenuOpen(false)}

>

<span>
0{n+1}
</span>

{i.name}

<ArrowUpRight size={18}/>

</Link>

)}

</nav>



{suggestions.length>0&&

<section className="menu-discovery">

<p>OTRAS PIEZAS PARA TI</p>

<div className="menu-discovery-rail">

{suggestions.map(p=>

<Link 
key={p.id}
href={"/producto/"+p.slug}
onClick={()=>setMenuOpen(false)}
>

<img 
src={p.images[0]}
alt={p.name}
/>

<strong>
{p.name}
</strong>

<small>
{p.pricingPending?"Consultar precio":money(p.price)}
</small>

</Link>

)}

</div>

</section>

}



<Link 
className="menu-catalog-link"
href="/catalogo"
onClick={()=>setMenuOpen(false)}
>
Explorar catálogo
<ArrowUpRight size={18}/>
</Link>


</SheetContent>

</Sheet>





<Link 
className="brand-logo" 
href="/" 
onClick={goTop}
aria-label="Evolución Urbana, inicio"
>

<img 
src="/imagenes/logo.png" 
alt="Evolución Urbana"
/>

<span>
EVOLUCIÓN
<small>
URBANA
</small>
</span>

</Link>




<nav className="desktop-nav">

<Link 
href="/" 
onClick={goTop}
aria-current={isActive("/")?"page":undefined}
>
Inicio
</Link>


<Link 
href="/catalogo"
aria-current={isActive("/catalogo")?"page":undefined}
>
Catálogo
</Link>


{categories.map(c=>

<Link
key={c.slug}
href={'/categoria/'+c.slug}
aria-current={
isActive('/categoria/'+c.slug)
?'page'
:undefined
}
>
{c.name}
</Link>

)}


<Link href="/ofertas">
Combos
<span className="nav-plus">+</span>
</Link>


</nav>



<div className="header-actions">


{/* RESTO DEL CÓDIGO DE BUSCADOR, TEMA Y CARRITO SE MANTIENE IGUAL */}


<ThemeToggle/>


<Sheet open={cartOpen} onOpenChange={setCartOpen}>

<SheetTrigger 
className="icon-button bag"
aria-label={`Mi selección, ${count} productos`}
>

<ShoppingBag size={20}/>

{count>0&&<span>{count}</span>}

</SheetTrigger>


<SheetContent className="cart-drawer">

<SheetTitle>
Tu selección
</SheetTitle>


<SheetDescription>
Tu próximo look, en un solo lugar.
</SheetDescription>


<Cart/>


</SheetContent>


</Sheet>


</div>


</header>

</>;

}