'use client';

import Link from 'next/link';
import {ArrowDown, ArrowUpRight} from 'lucide-react';
import EditorialWordmark from './EditorialWordmark';
import {loadEditorialScene, useNearbyMotion} from './use-editorial-motion';
import './niebla.css';

export default function NieblaHero() {
  const section = useNearbyMotion(loadEditorialScene,false);

  return <section className="niebla" ref={section} aria-labelledby="niebla-word">
    <div className="niebla-hero-range"><div className="niebla-frame">
      <img className="niebla-land" src="/niebla/llanura.webp" alt="" fetchPriority="high" />
      <EditorialWordmark id="niebla-word"/>
      <img className="niebla-figure" src="/niebla/codigo-nocturno.webp"
        alt="Look Código nocturno de Evolución Urbana, con camiseta gráfica oversize, pantalón negro y zapatillas."
        fetchPriority="high" />
      <canvas className="niebla-screen" aria-hidden="true" />
      <canvas className="niebla-fibers" aria-hidden="true" />
      <div className="niebla-intro" aria-hidden="true" />
      <div className="niebla-top niebla-opening">
        <p>Moda urbana <span>/</span> Colombia</p>
      </div>
      <div className="niebla-caption niebla-opening">
        <span>Moda de calle</span>
        <strong>Código nocturno</strong>
        <a href="#categorias">Explora por categoría <ArrowDown size={15} /></a>
      </div>
      <div className="niebla-action niebla-opening">
        <p>Camisetas oversize,<br />zapatillas y conjuntos.</p>
        <Link className="niebla-button" href="/catalogo">Ver catálogo <ArrowUpRight size={19} /></Link>
      </div>
      <div className="niebla-manifest">
        <h2><span><b data-ink>VISTE</b><i data-baseline /></span><span><b data-ink>DIFERENTE.</b><i data-baseline /></span></h2>
        <a className="niebla-end" href="#categorias">Explora por categoría <ArrowDown size={16} /></a>
      </div>
    </div></div>
  </section>;
}
