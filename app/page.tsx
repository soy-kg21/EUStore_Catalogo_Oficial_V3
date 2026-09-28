import Lookbook from '@/components/home/Lookbook';
import {resolveLooks} from '@/lib/looks';
import CategoryVisual from '@/components/home/CategoryVisual';
import SocialLinks from '@/components/store/SocialLinks';
import HeroMedia from '@/components/home/HeroMedia';
import EditorialVideo from '@/components/experience/EditorialVideo';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Layers,
  MessageCircle,
  Truck,
} from 'lucide-react';
import HomeMotion from '@/components/home/HomeMotion';
import ProductCard from '@/components/store/ProductCard';
import { categories, ORIGIN, wa, money } from '@/lib/config';
import { getProducts } from '@/lib/products';
import {discount} from '@/lib/product-display';
import { jsonLd } from '@/lib/seo';

export default async function Home() {
  const all = await getProducts();
  const looks = resolveLooks(all);
  const chosen = all.filter((product) => product.featured).slice(0, 4);
  const featured = chosen.length === 4 ? chosen : all.slice(0, 4);

  return (
    <>
    <main id="contenido" className="home-story" data-home-story>
      <HomeMotion />

      <section className="story-hero eu-cinematic" data-hero aria-labelledby="hero-title">
        <HeroMedia />

        <div className="story-hero-grid">
          <div className="story-hero-copy">
            <p className="story-kicker"><span /> EVOLUCIÓN URBANA / COLOMBIA</p>
            <h1 id="hero-title">VISTE<br /><em>DIFERENTE.</em></h1>
            <p className="story-hero-statement">Tu estilo no sigue reglas.<br />Tu historia tampoco.</p>
            <Link className="story-button story-button-light" href="/catalogo">
              EXPLORAR COLECCIÓN <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>

          <div className="story-hero-side" aria-hidden="true">
            <span>DROP / 001</span>
            <span>STREETWEAR ESENCIAL</span>
          </div>

          <div className="story-hero-foot">
            <span>PRENDAS CON CARÁCTER</span>
            <a href="#categorias">DESCUBRE MÁS <ArrowDown size={15} /></a>
            <span>01 — 05</span>
          </div>
          <div className="story-progress-track" aria-hidden="true"><span /></div>
        </div>
      </section>

      <div className="service-strip story-service-strip" aria-label="Beneficios de compra">
        <span><Truck size={18} /> Envíos a Colombia</span>
        <span><Layers size={18} /> Looks para combinar</span>
        <span><MessageCircle size={18} /> Asesoría personalizada</span>
      </div>

      <section className="category-story" id="categorias" aria-labelledby="category-title">
        <div className="category-story-intro" data-reveal>
          <p className="story-kicker"><span /> EXPLORA POR CATEGORÍA</p>
          <div>
            <h2 id="category-title">ENCUENTRA TU ESENCIA.</h2>
            <p>Descubre la colección que habla por ti.</p>
          </div>
          <span className="category-story-index">02 — 05</span>
        </div>

        <div className="category-rail" aria-label="Categorías disponibles">
          {categories.map((category, index) => {
            const products = all.filter((item) => item.category === category.slug);
            const product = products.find((item) => item.featured) ?? products[0];
            if (!product) return null;
            const lowest=products.filter(p=>!p.pricingPending).sort((a,b)=>a.price-b.price)[0];
            const maxOff=Math.max(...products.map(discount));

            return (
              <Link
                className="story-category-card"
                key={category.slug}
                href={`/categoria/${category.slug}`}
                data-reveal
              >
                <CategoryVisual category={category.slug} fallback={product.images[0]} />
                <span className="story-category-overlay" />
                <div className="story-category-top">
                  <span>0{index + 1}</span>
                  <span>{maxOff>0?`HASTA −${maxOff}%`:`${products.length} REFERENCIAS`}</span>
                </div>
                <div className="story-category-copy">
                  <p>{category.detail}</p>
                  <h3>{category.name}</h3><p className="category-benefit">Envío incluido · Contra entrega*</p>{lowest&&<p className="category-price">Desde {money(lowest.price)} <small>COP</small></p>}
                </div>
                <span className="story-category-action" aria-hidden="true">
                  VER COLECCIÓN <ArrowUpRight size={18} />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="category-scroll-hint">
          <span>ELIGE TU COLECCIÓN</span><i aria-hidden="true" /><span>*Condiciones de envío y pago según cantidad. <Link href="/contacto">Consultar condiciones</Link></span>
        </div>
      </section>

      <section className="editorial-selection" aria-labelledby="featured-title">
        <div className="editorial-heading" data-reveal>
          <div>
            <p className="story-kicker"><span /> CURADURÍA EVOLUCIÓN</p>
            <h2 id="featured-title">PIEZAS QUE<br />MARCAN EL RITMO.</h2>
          </div>
          <div className="editorial-heading-note">
            <p>Una selección para construir el look completo, sin perder tu identidad.</p>
            <Link href="/catalogo">VER TODO <ArrowRight size={17} /></Link>
          </div>
        </div>

        <div className="eu-curation-film">
          <EditorialVideo
            desktop="/media/curaduria/curaduria-pc.mp4"
            mobile="/media/curaduria/curaduria-mobile.mp4"
            desktopPoster="/media/curaduria/curaduria-pc.webp"
            mobilePoster="/media/curaduria/curaduria-mobile.webp"
            label="Looks urbanos en una escena nocturna"
          />
          <div className="eu-curation-copy">
            <p className="story-kicker"><span /> CURADURÍA / EVOLUCIÓN</p>
            <h3>LA CALLE ES<br />TU ESCENARIO.</h3>
            <Link className="story-button story-button-light" href="/catalogo">
              ENCUENTRA TU LOOK <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="product-grid editorial-product-grid">
          {featured.map((product, index) => (
            <div key={product.id} data-reveal className={`editorial-product editorial-product-${index + 1}`}>
              <ProductCard product={product} priority={index < 2} />
            </div>
          ))}
        </div>
      </section>

      <section className="look-story lookbook-story" aria-labelledby="look-title">
        <div className="look-story-number" aria-hidden="true">04</div>
        <div className="lookbook-heading">
          <div><p className="story-kicker"><span /> EL ARTE DE COMBINAR</p>
            <h2 id="look-title">COMBINA CON<br /><em>INTENCIÓN.</em></h2></div>
          <p>Ideas para inspirarte.<br />Tu manera de llevarlas.</p>
        </div>
        {looks.length ? <Lookbook looks={looks}/> : <div className="lookbook"><p>Descubre las piezas para construir tu próximo look.</p><Link className="story-button" href="/catalogo">EXPLORAR CATÁLOGO <ArrowUpRight size={19}/></Link></div>}
        <div className="lookbook-benefits">
          <span><MessageCircle/>Asesoría para elegir tu talla</span>
          <span><Layers/>Beneficios según tu selección</span>
          <span><Truck/>Entrega y disponibilidad por confirmar</span>
        </div>
      </section>

      <section className="home-final-cta" data-reveal>
        <p>¿NO SABES POR DÓNDE EMPEZAR?</p>
        <h2>ENCUENTRA TU<br />PRÓXIMA EVOLUCIÓN.</h2>
        <Link className="story-button" href={wa("Hola, quiero asesoría para armar mi próximo look.")} target="_blank" rel="noopener noreferrer">
          HABLAR CON UN ASESOR <ArrowUpRight size={19} />
        </Link>
        <SocialLinks /><span>05 — 05</span>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Evolución Urbana Store',
            url: ORIGIN,
            logo: `${ORIGIN}/imagenes/logo.png`,
          }),
        }}
      />
    </main>
    </>
  );
}
