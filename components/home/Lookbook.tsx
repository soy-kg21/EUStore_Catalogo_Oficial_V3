'use client';

import {useId, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, ArrowUpRight} from 'lucide-react';
import type {EditorialLook} from '@/lib/looks';
import {ORIGIN, money, wa} from '@/lib/config';
import './lookbook.css';

export default function Lookbook({looks}: {looks: EditorialLook[]}) {
  const [selected, setSelected] = useState(0);
  const [showPieces, setShowPieces] = useState(false);
  const panelId = useId();
  const look = looks[selected] ?? looks[0];
  if (!look) return null;

  const choose = (index: number) => {
    setSelected((index + looks.length) % looks.length);
    setShowPieces(false);
  };
  const message = `Hola Evolución Urbana, me interesa el look «${look.name}».\n\n${look.pieces.map(piece => `${piece.name}\n${ORIGIN}/producto/${piece.slug}`).join('\n\n')}\n\nQuisiera confirmar las tallas disponibles y el total de esta combinación.\nMi talla de prenda es: \nMi talla de calzado es: \nMi ciudad es: `;

  return <div className="lookbook">
    <div className="lookbook-stage">
      <div className="lookbook-portrait">
        {looks.map((item, index) => <Image key={item.id} src={item.image}
          alt={index === selected ? `${item.name}: ${item.pieces.map(piece => piece.name).join(' y ')}` : ''}
          aria-hidden={index !== selected} fill sizes="(max-width: 700px) 240px, 320px"
          className={index === selected ? 'is-selected' : ''} />)}
        <span className="lookbook-image-caption">ESTILO / EVOLUCIÓN</span>
      </div>
      <div className="lookbook-detail">
        <div className="lookbook-counter"><span>LOOK {String(selected + 1).padStart(2, '0')} / {String(looks.length).padStart(2, '0')}</span>
          {looks.length > 1 && <div><button type="button" onClick={() => choose(selected - 1)} aria-label="Look anterior"><ArrowLeft size={17}/></button><button type="button" onClick={() => choose(selected + 1)} aria-label="Look siguiente"><ArrowRight size={17}/></button></div>}
        </div>
        <div aria-live="polite" aria-atomic="true" className="lookbook-copy">
          <p className="lookbook-eyebrow">{look.eyebrow}</p>
          <h3>{look.name}</h3>
          <p>{look.description}</p>
        </div>
        <button type="button" className="lookbook-explore" aria-expanded={showPieces} aria-controls={panelId} onClick={() => setShowPieces(!showPieces)}>
          {showPieces ? 'Ocultar las piezas' : 'Ver las piezas'}<ArrowUpRight size={18}/>
        </button>
        <div id={panelId} hidden={!showPieces} className="lookbook-pieces">
          {look.pieces.map(piece => <Link key={piece.slug} href={`/producto/${piece.slug}`} className="lookbook-piece">
            <Image src={piece.images[0]} alt="" width={52} height={65} sizes="52px"/>
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
        <Image src={item.image} alt="" width={40} height={50} sizes="40px"/>
        <span><small>{String(index + 1).padStart(2, '0')}</small>{item.name}</span>
      </button>)}
    </div>
  </div>;
}
