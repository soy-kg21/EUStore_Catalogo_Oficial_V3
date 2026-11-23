'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight, Pause, Play} from 'lucide-react';

const carriers = [
  {name:'Envía',logo:'envia.webp'},
  {name:'Inter Rapidísimo',logo:'inter-rapidisimo.webp'},
  {name:'TCC',logo:'tcc.webp'},
  {name:'Coordinadora',logo:'coordinadora.webp'},
];

function CarrierRow({duplicate=false}:{duplicate?:boolean}) {
  return <ul className="eu-carrier-row" aria-hidden={duplicate || undefined}>
    {carriers.map(carrier=><li className="eu-carrier" key={carrier.name}>
      <div className="eu-carrier-logo"><img src={'/transportadoras/'+carrier.logo} width={240} height={96} alt="" loading="lazy" /></div>
      <span>{carrier.name}</span>
    </li>)}
  </ul>;
}

export default function ShippingCarriers() {
  const section = useRef<HTMLElement>(null);
  const [paused,setPaused] = useState(false);

  useEffect(()=>{
    const node = section.current!;
    const observer = new IntersectionObserver(([entry])=>node.toggleAttribute('data-in-view',entry.isIntersecting));
    observer.observe(node);
    const syncVisibility = ()=>node.toggleAttribute('data-page-hidden',document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange',syncVisibility);
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',syncVisibility);};
  },[]);

  return <section className="eu-shipping eu-chapter" ref={section} data-paused={paused} aria-labelledby="shipping-title">
    <div className="eu-section-heading">
      <div>
        <p className="eu-label">Envíos en Colombia</p>
        <h2 className="eu-display" id="shipping-title">Transportadoras</h2>
      </div>
      <Link className="eu-text-link" href="/contacto">Consultar condiciones de envío <ArrowUpRight size={18}/></Link>
    </div>
    <div className="eu-carrier-window" id="shipping-carriers">
      <div className="eu-carrier-track"><CarrierRow/><CarrierRow duplicate/></div>
    </div>
    <div className="eu-shipping-note">
      <p>Confirmamos la transportadora según el destino y la bodega de tu pedido.</p>
      <button type="button" className="eu-shipping-toggle" aria-controls="shipping-carriers" onClick={()=>setPaused(value=>!value)}>
        {paused ? <Play size={16} aria-hidden="true"/> : <Pause size={16} aria-hidden="true"/>}
        {paused ? 'Reanudar transportadoras' : 'Pausar transportadoras'}
      </button>
    </div>
  </section>;
}
