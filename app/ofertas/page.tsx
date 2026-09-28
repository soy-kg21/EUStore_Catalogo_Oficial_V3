import Link from 'next/link';
import {rules} from '@/lib/commercial';
import {money,wa} from '@/lib/config';
import {metadata as meta} from '@/lib/seo';
export const metadata=meta('Combos | Evolución Urbana','Combina tus piezas y conoce los beneficios por bodega.','/ofertas');
const offers=[
 {id:'B1-standard',warehouse:'B1',name:'Zapatillas seleccionadas',detail:'Tarifas para referencias participantes. Otras zapatillas de B1 conservan su precio y sus promociones propias.',category:'zapatillas'},
 {id:'B5-270',warehouse:'B5',name:'Camisetas oversize 270g',detail:'Combina referencias de camisetas de B5.',category:'camisetas'},
 {id:'B5-CP',warehouse:'B5',name:'Conjuntos 270g',detail:'Camiseta + pantaloneta. Combina referencias de conjuntos de B5.',category:'conjuntos'},
];
export default function Page(){return <main id="contenido" className="page-main">
 <nav className="breadcrumb" aria-label="Ubicación"><Link href="/">Inicio</Link><span>/</span><span>Combos y beneficios</span></nav>
 <p className="eyebrow">MEJOR EN COMBO</p><h1 className="page-title">Más estilo. Mejor juntos.</h1>
 <p className="page-intro">Elige tus referencias y descubre el precio según tu selección. Las cantidades y condiciones se calculan por bodega.</p>
 <section className="benefit-spotlight" aria-labelledby="b1-gift"><span className="benefit-code">B1</span><div><p className="eyebrow">UN DETALLE PARA TU PRÓXIMO PASO</p><h2 id="b1-gift">Todas las zapatillas de B1 incluyen medias de obsequio.</h2><p>El regalo aplica a todas las referencias de zapatillas nacionales de B1, independientemente de su promoción. Es exclusivo de esta bodega.</p></div><Link href="/categoria/zapatillas">Explorar zapatillas ↗</Link></section>
 <div className="offer-grid">{offers.map(item=><article className="offer-card" key={item.id}><span className="offer-warehouse">BODEGA {item.warehouse}</span><h2>{item.name}</h2><p>{item.detail}</p><table className="offer-prices"><caption>Precio por unidad según cantidad</caption><thead><tr><th>Cantidad</th><th>Por unidad</th></tr></thead><tbody>{rules[item.id].retail.map((price,i)=><tr key={i}><td>{i+1} {i?'unidades':'unidad'}</td><td>{money(price)}</td></tr>)}</tbody></table><Link href={'/categoria/'+item.category}>Elegir mis piezas →</Link></article>)}</div>
 <section className="editorial"><h2>Beneficios claros, desde el primer paso.</h2><p>Hasta 5 unidades por bodega se mantiene el pago contra entrega y el beneficio de envío según las condiciones de cada bodega. B1 y B2 incluyen seguro de transporte. En B3, de 4 a 5 pares se aplica el recargo logístico existente de $16.000 a $20.000, que confirma tu asesor.</p><h2>Tu look puede combinar varias bodegas.</h2><p>Los productos llegan en despachos separados. Conservas los beneficios y descuentos que correspondan a cada selección. En B5, camisetas y conjuntos suman para alcanzar el mismo escalón de cantidad; cada tipo de prenda conserva su tarifa. El resumen de tu selección muestra los valores aplicables.</p><h2>¿Buscas 6 unidades o más?</h2><p>Las cantidades se calculan por bodega. Desde 6 unidades de una bodega, el pedido requiere pago anticipado y envío cotizado. En B1, B2, B3 y B4, solicita precio mayorista; las demás bodegas conservan sus escalas disponibles.</p><a className="button" href={wa('Hola, quisiera una cotización mayorista con un asesor. Mi ciudad y cantidades son: ')} target="_blank" rel="noopener noreferrer">HABLAR CON UN ASESOR ↗</a></section>
 </main>}
