'use client';

import {useEffect, useRef} from 'react';
import Link from 'next/link';
import {ArrowDown, ArrowUpRight} from 'lucide-react';
import './niebla.css';

export default function NieblaHero() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = section.current!;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let controller: AbortController;
    function setup() {
      controller?.abort();
      controller = new AbortController();
      const {signal} = controller;
      if (preference.matches) return;
      import('./scene').then(({mountScene}) => {
        if (!signal.aborted) return mountScene(root, signal);
      }).catch(() => { if (!signal.aborted) controller.abort(); });
    }
    setup();
    preference.addEventListener('change', setup);
    return () => {
      controller.abort();
      preference.removeEventListener('change', setup);
    };
  }, []);

  return <section className="niebla" ref={section} aria-labelledby="niebla-word">
    <div className="niebla-frame">
      <img className="niebla-land" src="/niebla/llanura.webp" alt="" fetchPriority="high" />
      <h1 id="niebla-word" className="niebla-word"><span data-ink>KAEL</span><i data-baseline /></h1>
      <img className="niebla-figure" src="/niebla/codigo-nocturno.webp"
        alt="Look Código nocturno de Evolución Urbana, con camiseta gráfica oversize, pantalón negro y zapatillas."
        fetchPriority="high" />
      <canvas className="niebla-screen" aria-hidden="true" />
      <div className="niebla-intro" aria-hidden="true" />
      <div className="niebla-top niebla-opening">
        <p>Editorial <span>/</span> Niebla</p>
        <span className="niebla-look">Lookbook de calle</span>
      </div>
      <div className="niebla-caption niebla-opening">
        <span>Look de la colección</span>
        <strong>Código nocturno</strong>
        <a href="#categorias">Descubre más <ArrowDown size={15} /></a>
      </div>
      <div className="niebla-action niebla-opening">
        <p>El gráfico en la espalda.<br />La ciudad por delante.</p>
        <Link className="niebla-button" href="/catalogo">Ver colección <ArrowUpRight size={19} /></Link>
      </div>
      <div className="niebla-manifest">
        <h2><span><b data-ink>VISTE</b><i data-baseline /></span><span><b data-ink>DIFERENTE.</b><i data-baseline /></span></h2>
        <a className="niebla-end" href="#categorias">Explora por categoría <ArrowDown size={16} /></a>
      </div>
    </div>
  </section>;
}
