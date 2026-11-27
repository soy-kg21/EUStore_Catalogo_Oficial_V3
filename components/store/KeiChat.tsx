'use client';

import {ArrowUpRight, MessageCircle, Send, X} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {readCart} from '@/lib/cart';
import {money, wa} from '@/lib/config';
import type {KeiResponse} from '@/lib/kei';
import styles from './kei-chat.module.css';

type Turn = {question: string; answer?: KeiResponse};
const prompts = ['Revisa mi carrito', 'Envíos de importadas', 'Combos que puedo armar'];

export default function KeiChat() {
  const route=usePathname();
  const dock=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const panel=useRef<HTMLElement>(null);
  const end=useRef<HTMLDivElement>(null);
  const anchor=useRef<string|undefined>(undefined);
  const [open,setOpen]=useState(false);
  const [turns,setTurns]=useState<Turn[]>([]);
  const [value,setValue]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    if(!open)return;
    panel.current?.focus({preventScroll:true});

    const viewport=window.visualViewport;
    const element=dock.current;
    if(!viewport||!element)return;

    const syncViewport=()=>{
      const bottomInset=viewport.scale===1
        ?Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop)
        :0;
      element.style.setProperty('--kei-keyboard-inset',`${bottomInset}px`);
      element.style.setProperty('--kei-visible-height',viewport.scale===1?`${viewport.height}px`:'100dvh');
    };

    syncViewport();
    viewport.addEventListener('resize',syncViewport);
    viewport.addEventListener('scroll',syncViewport);
    return ()=>{
      viewport.removeEventListener('resize',syncViewport);
      viewport.removeEventListener('scroll',syncViewport);
      element.style.removeProperty('--kei-keyboard-inset');
      element.style.removeProperty('--kei-visible-height');
    };
  },[open]);
  useEffect(()=>{const thread=end.current?.parentElement;if(open&&thread)thread.scrollTop=thread.scrollHeight;},[open,turns]);

  async function ask(question: string) {
    const message=question.trim();
    if(!message||busy)return;
    setValue('');
    setBusy(true);
    setTurns(previous=>[...previous.slice(-9),{question:message}]);
    let answer: KeiResponse;
    try {
      const lines=readCart();
      const response=await fetch('/api/kei',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message,pathname:route,productId:anchor.current,lines}),signal:AbortSignal.timeout(15000)});
      if(!response.ok)throw Error();
      answer=await response.json() as KeiResponse;
      anchor.current=answer.productId??anchor.current;
    }catch{
      answer={text:'No pude consultar el catálogo ahora. Intenta de nuevo o habla con el equipo por WhatsApp.',products:[],
        human:wa('Hola, quisiera ayuda con el catálogo de Evolución Urbana.')};
    }
    setTurns(previous=>previous.map((turn,index)=>index===previous.length-1?{...turn,answer}:turn));
    setBusy(false);
  }

  function close() {
    setOpen(false);
    trigger.current?.focus({preventScroll:true});
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(value);
  }

  return <div ref={dock} className={styles.dock}>
    {open&&<aside ref={panel} id="kei-panel" className={styles.panel} aria-labelledby="kei-title" tabIndex={-1}
      onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();close();}}}>
      <header className={styles.header}><MessageCircle size={20} aria-hidden="true"/>
        <div><h2 id="kei-title">KEI</h2><small>Asesor virtual de Evolución Urbana</small></div>
        <button className={styles.icon} type="button" aria-label="Cerrar chat" onClick={close}><X size={20}/></button>
      </header>
      <div className={styles.thread} role="log" aria-label="Conversación con KEI" aria-live="polite">
        <p className={styles.reply}>Hola, soy KEI. Te ayudo a encontrar tu estilo, combinar referencias y entender tu envío antes de pedir.</p>
        {turns.map(({question,answer},i)=><div key={i} className={styles.turn}>
          <p className={styles.question}>{question}</p>
          {answer&&<div className={styles.reply}>
            {answer.opening&&<p>{answer.opening}</p>}
            <p>{answer.text}</p>
            {answer.products.length>0&&<ul>{answer.products.map(product=><li key={product.id}>
              <Link href={product.href} onClick={close}><span>{product.name}<small>{money(product.price)}{product.sharedDispatch?' · Mismo despacho':''}</small></span><ArrowUpRight size={16} aria-hidden="true"/></Link>
            </li>)}</ul>}
            {answer.human&&<a className={styles.contact} href={answer.human} target="_blank" rel="noopener noreferrer">Hablar con un asesor <ArrowUpRight size={15}/></a>}
          </div>}
        </div>)}
        {busy&&<p className={styles.reply}>Estoy revisando el catálogo…</p>}
        <div ref={end}/>
      </div>
      {!turns.length&&<div className={styles.prompts}>{prompts.map(prompt=><button type="button" key={prompt} onClick={()=>{
        panel.current?.focus({preventScroll:true});
        void ask(prompt);
      }}>{prompt}</button>)}</div>}
      <form className={styles.form} onSubmit={submit}>
        <input aria-label="Mensaje para KEI" placeholder="Pregúntame por una referencia…" value={value} maxLength={420} onChange={event=>setValue(event.target.value)}/>
        <button className={styles.icon} type="submit" aria-label="Enviar mensaje" disabled={!value.trim()||busy}><Send size={17}/></button>
      </form>
    </aside>}
    <button ref={trigger} type="button" className={styles.trigger} aria-label={open?'Cerrar chat con KEI':'Abrir chat con KEI'}
      aria-expanded={open} aria-controls={open?'kei-panel':undefined} onClick={()=>open?close():setOpen(true)}>
      {open?<X size={19} aria-hidden="true"/>:<MessageCircle size={20} aria-hidden="true"/>}
      <span>{open?'KEI':'Soy KEI'}</span>
    </button>
  </div>;
}
