import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight,Layers,MessageCircle,Sparkles} from 'lucide-react';
import {metadata as meta} from '@/lib/seo';
import {wa} from '@/lib/config';
import styles from './essence.module.css';

export const metadata=meta('Nuestra esencia | Evolución Urbana Store','Tu estilo tiene algo que decir. Descubre nuestra selección de streetwear, Anime Shop y asesoría personalizada en Colombia.','/nosotros');

const edits=[
 {name:'La calle.',label:'STREET / ESSENTIALS',detail:'Siluetas amplias. Actitud propia.',href:'/categoria/camisetas',image:'/media/looks/codigo-nocturno.webp'},
 {name:'Tu universo.',label:'ANIME / EXPRESSION',detail:'Lleva contigo lo que te inspira.',href:'/anime',image:'/anime/cinema/gojo-atlas.webp'},
 {name:'El siguiente paso.',label:'SNEAKERS / EDIT',detail:'Ese detalle que completa tu look.',href:'/categoria/zapatillas',image:'/media/categorias/categoria_zapatillas_img1.webp'},
];

export default function Page(){
 return <main id="contenido" className={`page-main ${styles.page}`}>
  <nav className="breadcrumb" aria-label="Ubicación"><Link href="/">Inicio</Link><span>/</span><span>Nuestra esencia</span></nav>
  <section className={styles.hero} aria-labelledby="essence-title">
   <div className={styles.heroCopy}><p className={styles.kicker}>NUESTRA ESENCIA / EVOLUCIÓN URBANA</p><h1 id="essence-title">TU ESTILO.<br/><em>TU HISTORIA.</em></h1><p>Hay prendas que te pones.<br/>Y otras que hablan por ti.</p><span>Reunimos streetwear, calzado y universos gráficos para que combines lo que eres con lo que te inspira. Sin perder tu identidad.</span><Link className={styles.primary} href="/catalogo">Encuentra tu próxima pieza <ArrowUpRight size={18}/></Link><small>MODA URBANA / COLOMBIA</small></div>
   <div className={styles.heroArt}><Image src="/media/looks/codigo-nocturno.webp" alt="Un look urbano de Evolución Urbana en una escena nocturna" fill sizes="(max-width:700px) 90vw, 48vw" quality={90} preload/><span className={styles.artTag}>EU / EL ARTE DE SER TÚ</span><div className={styles.artStatement}>LA CALLE INSPIRA.<br/><strong>TÚ LE DAS SENTIDO.</strong></div></div>
  </section>
  <section className={styles.manifesto} aria-labelledby="manifesto-title"><p className={styles.kicker}>UN ESTILO QUE EVOLUCIONA CONTIGO</p><h2 id="manifesto-title">Lo que eliges llevar<br/>también cuenta quién eres.</h2><p>Una camiseta oversize, tus zapatillas favoritas, un conjunto que resuelve el día o ese diseño de tu universo favorito. Tú eliges las piezas. Tú creas la combinación.</p></section>
  <section className={styles.edits} aria-label="Explora nuestra identidad">{edits.map((edit,index)=><Link href={edit.href} key={edit.href} className={styles.edit}>
   <Image className={index===1?styles.atlas:styles.editImage} src={edit.image} alt="" fill sizes="(max-width:700px) 90vw, 30vw" quality={85}/><span className={styles.editIndex}>0{index+1}</span><div><p>{edit.label}</p><h2>{edit.name}</h2><span>{edit.detail}</span></div><ArrowUpRight size={23}/>
  </Link>)}</section>
  <section className={styles.values} aria-label="Nuestra forma de acompañarte"><div><Sparkles size={23}/><h2>Expresión propia.</h2><p>Referencias para mezclar, experimentar y vestir a tu manera.</p></div><div><Layers size={23}/><h2>Combina con intención.</h2><p>Explora los combos de cada colección y revisa sus beneficios antes de elegir.</p></div><div><MessageCircle size={23}/><h2>Una conversación cercana.</h2><p>Te orientamos por WhatsApp para confirmar tallas, disponibilidad y entrega en tu ciudad.</p></div></section>
  <section className={styles.closing}><div><p className={styles.kicker}>TU PRÓXIMA EVOLUCIÓN</p><h2>Empieza con algo<br/>que vaya contigo.</h2></div><a className={styles.primary} href={wa('Hola Evolución Urbana, quiero asesoría para encontrar mi estilo y armar un look.')} target="_blank" rel="noopener noreferrer">Hablemos de tu estilo <ArrowUpRight size={18}/></a></section>
 </main>;
}
