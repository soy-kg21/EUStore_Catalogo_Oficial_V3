'use client';

import {useEffect, useId, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play} from 'lucide-react';
import type {EditorialLook} from '@/lib/looks';
import {ORIGIN, money, wa} from '@/lib/config';
import './lookbook.css';

export default function Lookbook({looks}: {looks: EditorialLook[]}) {
  const [selected, setSelected] = useState(0);
  const [showPieces, setShowPieces] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const panelId = useId();
  useEffect(() => {
    if (paused || hovered || focused || showPieces || looks.length < 2) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      if (!document.hidden && !media.matches) timer = setTimeout(() => setSelected(i => (i + 1) % looks.length), 7000);
    };
    schedule(); document.addEventListener('visibilitychange', schedule); media.addEventListener('change', schedule);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', schedule); media.removeEventListener('change', schedule); };
  }, [selected, paused, hovered, focused, showPieces, looks.length]);
  const look = looks[selected] ?? looks[0];
  if (!look) return null;

  const choose = (index: number) => {
    setSelected((index + looks.length) % looks.length);
    setShowPieces(false);
  };
  const message = `Hola Evolución Urbana, me interesa el look «${look.name}».\n\n${look.pieces.map(piece => `${piece.name}\n${ORIGIN}/producto/${piece.slug}`).join('\n\n')}\n\nQuisiera confirmar las tallas disponibles y el total de esta combinación.\nMi talla de prenda es: \nMi talla de calzado es: \nMi ciudad es: `;

  return <div className="lookbook" data-playing={!paused && !hovered && !focused && !showPieces}
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="lookbook-stage">
      <div className="lookbook-portrait">
        {looks.map((item, index) => <Image quality={85} key={item.id} src={item.image}
          alt={index === selected ? `${item.name}: ${item.pieces.map(piece => piece.name).join(' y ')}` : ''}
          aria-hidden={index !== selected} fill sizes="(max-width: 700px) 90vw, (max-width: 1200px) 45vw, 550px"
          className={index === selected ? 'is-selected' : ''} />)}
        <span className="lookbook-image-caption">STREET FILES / EVOLUCIÓN URBANA</span>
        <span className="lookbook-frame-number" aria-hidden="true">0{selected + 1}</span>
        <span key={selected} className="lookbook-progress" aria-hidden="true"><i/></span>
      </div>
      <div className="lookbook-detail">
        <div className="lookbook-counter"><span>LOOK {String(selected + 1).padStart(2, '0')} / {String(looks.length).padStart(2, '0')}</span>
          {looks.length > 1 && <div><button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Reanudar looks' : 'Pausar looks'}>{paused ? <Play size={15}/> : <Pause size={15}/>}</button><button type="button" onClick={() => choose(selected - 1)} aria-label="Look anterior"><ArrowLeft size={17}/></button><button type="button" onClick={() => choose(selected + 1)} aria-label="Look siguiente"><ArrowRight size={17}/></button></div>}
        </div>
        <div aria-live="polite" aria-atomic="true" className="lookbook-copy">
          <p className="lookbook-eyebrow">{look.eyebrow}</p>
          <h3>{look.name}</h3>
          <p>{look.description}</p>
        </div>
        <div className="lookbook-preview" aria-label="Piezas de este look">
          {look.pieces.map(piece => <Link key={piece.slug} href={`/producto/${piece.slug}`} aria-label={`Ver ${piece.name}`}><Image quality={85} src={piece.images[0]} alt="" width={76} height={90} sizes="76px"/><span>{piece.name}</span><ArrowUpRight size={15}/></Link>)}
        </div>
        <button type="button" className="lookbook-explore" aria-expanded={showPieces} aria-controls={panelId} onClick={() => setShowPieces(!showPieces)}>
          {showPieces ? 'Cerrar detalles de las piezas' : 'Ver precios y detalles'}<ArrowUpRight size={18}/>
        </button>
        <div id={panelId} hidden={!showPieces} className="lookbook-pieces">
          {look.pieces.map(piece => <Link key={piece.slug} href={`/producto/${piece.slug}`} className="lookbook-piece">
            <Image quality={85} src={piece.images[0]} alt="" width={52} height={65} sizes="52px"/>
            <span>{piece.name}<small>{piece.pricingPending ? 'Consultar precio' : `${money(piece.price)} COP`}</small></span><ArrowUpRight size={15}/>
          </Link>)}
          <p className="lookbook-note">{look.note}</p>
        </div>
        <a className="lookbook-advice" href={wa(message)} target="_blank" rel="noopener noreferrer">Consultar esta combinación <ArrowRight size={15}/></a>
        <p className="lookbook-disclaimer">Inspiración visual creada con IA. Consulta los detalles en las fotos de cada producto.</p>
      </div>
    </div>
    <div className="lookbook-selector" role="group" aria-label="Elige una recomendación de look">
      {looks.map((item, index) => <button type="button" key={item.id} aria-pressed={index === selected} onClick={() => choose(index)}>
        <Image quality={85} src={item.image} alt="" width={40} height={50} sizes="40px"/>
        <span><small>{String(index + 1).padStart(2, '0')}</small>{item.name}<em>{item.pieces.length} piezas para explorar</em></span>
      </button>)}
    </div>
  </div>;
}
