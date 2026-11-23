import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {collectionOf} from '@/lib/catalog-presentation.mjs';
import {getProducts} from '@/lib/products';
import {categories, money, wa} from '@/lib/config';
import {jsonLd, siteSchema} from '@/lib/seo';
import ServiceAnnouncements from '@/components/home/ServiceAnnouncements';
import CategoryVisual from '@/components/home/CategoryVisual';
import ShippingCarriers from '@/components/home/niebla/ShippingCarriers';
import ProductCard from '@/components/store/ProductCard';
import SocialLinks from '@/components/store/SocialLinks';
import NieblaHero from '@/components/home/niebla/NieblaHero';
import {ClosingScene, MaterialLens, StoryInteractions} from '@/components/home/niebla/StoryInteractions';
import '@/components/home/niebla/story.css';

export default async function Home() {
  const all = await getProducts();
  const featured = ['oversize','nacionales','conjuntos-cortos','importadas'].flatMap(collection => {
    const rows = all.filter(product => collectionOf(product) === collection);
    const product = rows.find(product => product.featured) ?? rows[0];
    return product ? [product] : [];
  });
  const groups = categories.flatMap(category => {
    const rows = all.filter(product => product.category === category.slug);
    if (!rows.length) return [];
    const priced = rows.filter(product => !product.pricingPending && product.price > 0);
    return [{...category, count: rows.length, image: rows[0].images[0],
      from: priced.length ? Math.min(...priced.map(product => product.price)) : null}];
  });
  const shoe = all.find(product => product.slug === 'vans-old-skool-negro-blanco');
  return <main id="contenido" className="home-story niebla-home" data-home-story>
    <StoryInteractions />
    <NieblaHero />

    <section className="eu-collection eu-chapter" id="categorias" aria-labelledby="category-title">
      <div className="eu-collection-pin">
        <div className="eu-running"><span>Colección / Evolución Urbana</span><span>{String(groups.length).padStart(2,'0')} categorías</span></div>
        <div className="eu-collection-window">
          <div className="eu-collection-track">
            <div className="eu-collection-intro">
              <h2 className="eu-display" id="category-title">Moda urbana.<br /><em>A tu manera.</em></h2>
              <p>Explora camisetas, zapatillas y conjuntos.</p>
            </div>
            {groups.map((group,index) => <Link prefetch={false} href={'/categoria/'+group.slug} key={group.slug} className="eu-collection-card">
              <div className="eu-collection-photo"><CategoryVisual category={group.slug} fallback={group.image} /></div>
              <div className="eu-card-caption"><small>{String(index+1).padStart(2,'0')}</small><h3>{group.name}</h3><ArrowUpRight size={20}/></div>
              <p>{group.from !== null ? 'Desde '+money(group.from)+' COP' : group.detail}</p>
            </Link>)}
          </div>
        </div>
        <div className="eu-rail-progress" aria-hidden="true"><i /></div>
      </div>
    </section>

    <section className="eu-material" aria-labelledby="material-title">
      <div className="eu-material-pin">
        <img className="eu-material-photo" src="/niebla/zapatilla-lluvia.webp" alt="Detalle editorial de una zapatilla negra con franja blanca, cordones y gotas de agua." loading="lazy" />
        <MaterialLens />
        <div className="eu-material-copy"><p className="eu-label">Detalle de calzado</p>
          <h2 id="material-title" className="eu-display">Costuras<br /><em>y textura.</em></h2>
          <Link prefetch={false} className="eu-text-link" href={shoe ? '/producto/'+shoe.slug : '/categoria/zapatillas'}>
            {shoe ? shoe.name : 'Ver zapatillas'} <ArrowUpRight size={17}/>
          </Link>
        </div>
      </div>
    </section>

    <section className="eu-stats eu-chapter" aria-label="El catálogo general en cifras">
      <p className="eu-label">El catálogo, en cifras</p>
      <dl>{groups.map(group => <div key={group.slug}><dt>{group.name}</dt><dd>
        <span data-total={group.count} aria-hidden="true">{group.count.toLocaleString('es-CO')}</span><small aria-hidden="true">refs.</small>
        <span className="sr-only">{group.count} referencias</span>
      </dd></div>)}</dl>
    </section>

    <section className="eu-pieces eu-chapter" aria-labelledby="featured-title">
      <div className="eu-section-heading"><div><p className="eu-label">Evolución Urbana / Catálogo</p>
        <h2 className="eu-display" id="featured-title">Piezas <br className="eu-pieces-break"/><em>destacadas</em></h2></div>
        <Link className="eu-text-link" href="/catalogo">Explorar catálogo <ArrowUpRight size={18}/></Link>
      </div>
      <div className="eu-piece-grid">{featured.map(product => <div className="eu-piece" key={product.id}><ProductCard product={product} /></div>)}</div>
    </section>

    <ShippingCarriers />
    <ServiceAnnouncements />

    <ClosingScene>
      <div className="eu-close-title"><p className="eu-label">Asesoría de estilo</p><h2 className="eu-display" id="close-title">Encuentra tu <br/>próxima <br/>evolución.</h2></div>
      <div className="eu-close-contact"><p>¿Qué look tienes en mente? Hablemos de tallas, combinaciones y envíos.</p>
        <a className="niebla-button" href={wa('Hola, quiero asesoría para armar mi próximo look.')} target="_blank" rel="noopener noreferrer">Hablar con un asesor <ArrowUpRight size={18}/></a></div>
    </ClosingScene>
    <section className="eu-social eu-chapter" aria-label="Redes y contacto de Evolución Urbana"><SocialLinks /></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(siteSchema())}}/>
  </main>;
}
