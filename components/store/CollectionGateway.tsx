import Link from 'next/link';
import Image from 'next/image';
import {ArrowDown,ArrowUpRight,Footprints,Shirt} from 'lucide-react';
import styles from './collection-gateway.module.css';
import ImportedCollectionLink from './ImportedCollectionLink';
export const upcomingCollections={
 zapatillas:{title:'Zapatillas',current:'Zapatillas nacionales',currentDetail:'Explora modelos, colores y tallas de la colección actual.',next:'Zapatillas importadas',path:'/zapatillas-importadas',eyebrow:'Import Division',image:'/media/categorias/categoria_zapatillas_img1.webp',editorial:'/media/collections/importadas-editorial.webp',alt:'Zapatillas grises y blancas en un escenario urbano con luz verde',icon:Footprints},
 conjuntos:{title:'Conjuntos',current:'Camiseta + pantaloneta',currentDetail:'Combinaciones listas para llevar a tu manera.',next:'Buzos + sudaderas',path:'/conjuntos-buzos',eyebrow:'Comfort Division',image:'/media/categorias/categoria_conjunto_cp_img1.webp',editorial:'/media/collections/conjuntos-editorial.webp',alt:'Conjunto negro y blanco de buzo y sudadera en un estudio urbano',icon:Shirt},
} as const;
export default function CollectionGateway({category}:{category:keyof typeof upcomingCollections}){
 const collection=upcomingCollections[category];
 return <section className={styles.gateway} aria-labelledby={`${category}-lines-title`}>
  <div className={styles.heading}><div><p>{collection.title} / Elige tu línea</p><h2 id={`${category}-lines-title`}>EL ESTILO SIGUE<br/><em>EVOLUCIONANDO.</em></h2></div><span>La colección que conoces.<br/>Un nuevo universo por descubrir.</span></div>
  <div className={styles.grid}>
   <a href={`#catalogo-${category}`} className={styles.current} style={{backgroundImage:`linear-gradient(90deg,#080c0bf2,#080c0b55),url('${collection.image}')`}}><span className={styles.number}>01</span><span className={styles.tag}>Colección actual</span><h3>{collection.current}</h3><p>{collection.currentDetail}</p><span className={styles.action}>Explorar colección <ArrowDown size={16}/></span></a>
   {category==='zapatillas'?<ImportedCollectionLink variant="gateway"/>:<Link href={collection.path} className={styles.next}><Image className={styles.gatewayImage} src={collection.editorial} alt="" fill sizes="(max-width:700px) 90vw, 44vw" quality={85}/><span className={styles.number}>02</span><span className={styles.tag}>Comfort Division / Explora esta línea</span><h3>{collection.next}</h3><p>Encuentra referencias, fotografías, tallas y precios. Elige tu conjunto y continúa con asesoría.</p><span className={styles.action}>VER MODELOS Y PRECIOS <ArrowUpRight size={16}/></span></Link>}
  </div>
 </section>;
}
