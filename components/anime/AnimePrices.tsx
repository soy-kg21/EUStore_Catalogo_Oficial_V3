import {animePublicTotals} from '@/lib/anime-commercial';
import {money} from '@/lib/config';
import {ArrowUpRight,Layers} from 'lucide-react';
import styles from './shop-premium.module.css';
export default function AnimePrices(){return <section className={styles.prices} id="precios" aria-labelledby="anime-prices-title">
 <div className={styles.sectionHeading}><div><p className={styles.kicker}>Más de tu estilo</p><h2 id="anime-prices-title">Un combo<br/>a tu medida<span className={styles.priceDot}>.</span></h2></div><div className={styles.priceIntro}><Layers size={22}/><p>Mezcla Anime, Cartoon, Rock y Urbanas.<br/>El precio se calcula por cantidad.</p><a href="#coleccion">Armar mi combo <ArrowUpRight size={16}/></a></div></div>
 <div className={styles.priceSteps}><span><b>01</b> Elige tus diseños</span><span><b>02</b> Combina tallas</span><span><b>03</b> Revisa tu combo</span></div>
 <div className={styles.priceGrid}>{animePublicTotals.map((total,i)=><div key={i} className={`${styles.priceTier} ${i===1?styles.priceFeatured:''}`}>
  <div className={styles.priceTierTop}><span>{String(i+1).padStart(2,'0')}</span>{i===1?<span className={styles.priceFlag}>COMBO DE 2</span>:<small>{i===0?'INDIVIDUAL':'TU SELECCIÓN'}</small>}</div>
  <span>{i+1} {i===0?'camiseta':'camisetas'}</span><strong>{money(total)}</strong><small>{i===0?'Precio individual':'Total de las camisetas'}</small>
  <div className={styles.priceMeter} aria-hidden="true">{[0,1,2,3,4].map(n=><i key={n} data-filled={n<=i}/>)}</div>
 </div>)}</div>
 <p className={styles.priceConditions}>Precios en COP. Envío estándar incluido de 1 a 5 camisetas; cobertura y contraentrega sujetos a validación. Referencias y tallas se confirman antes de cerrar el pedido.</p>
 <details className={styles.wholesale}><summary>¿Quieres 6 camisetas o más?<span>Ver precios mayoristas +</span></summary><div><p>De 6 a 11: <b>$38.400 por camiseta.</b> De 12 a 23: <b>$33.300 por camiseta.</b> Desde 24: cotización personalizada.</p><p>Pago anticipado, sin contraentrega y transporte separado por cotizar. Exclusivo para referencias de Anime Shop.</p></div></details>
 </section>;}
