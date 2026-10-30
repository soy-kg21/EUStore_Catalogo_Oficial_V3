'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  getCartSnapshot,
  getServerCartSnapshot,
  parseCart,
  saveCart,
  subscribeCart,
} from '@/lib/cart';
import { money, ORIGIN, wa } from '@/lib/config';
import type { quote } from '@/lib/pricing';
import type { CartLine } from '@/lib/types';
import QuantityControl from './QuantityControl';

type Quote = ReturnType<typeof quote>;
type QuoteState = { key: string; data: Quote | null; error: string };

export default function Cart() {
  const snapshot = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const lines = useMemo(() => parseCart(snapshot), [snapshot]);
  const ready = snapshot !== '';
  const quoteKey = JSON.stringify(lines);
  const [quoteState, setQuoteState] = useState<QuoteState>({ key: '', data: null, error: '' });
  const [actionError, setActionError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(()=>{const refresh=()=>{setRetry(n=>n+1);setQuoteState({key:'',data:null,error:''});};window.addEventListener('eu-catalog-updated',refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('eu-catalog-updated',refresh);window.removeEventListener('focus',refresh);};},[]);
  useEffect(() => {
    if (!ready || !lines.length) return;

    const controller = new AbortController();
    const timer = setTimeout(() => fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: quoteKey,
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as Quote & { error?: string };
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error(data.error || 'No fue posible actualizar la cotización.');
        setQuoteState({ key: quoteKey, data, error: '' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setQuoteState({
          key: quoteKey,
          data: null,
          error: error instanceof Error ? error.message : 'No fue posible actualizar la cotización.',
        });
      }), 150);

    return () => { clearTimeout(timer); controller.abort(); };
  }, [lines.length, quoteKey, ready, retry]);

  const change = (next: CartLine[]) => {
    try {
      saveCart(next);
      setActionError('');
    } catch {
      setActionError('Tu navegador no permite guardar la selección.');
    }
  };

  if (!ready) return <p>Cargando tu selección…</p>;
  if (!lines.length) {
    return (
      <div className="empty-state">
        <h2>Tu próximo look empieza aquí.</h2>
        <p>Añade productos, elige las tallas y consulta tu pedido por WhatsApp.</p>
        <Link className="button" href="/catalogo">EXPLORAR CATÁLOGO</Link>
      </div>
    );
  }

  const currentQuote = quoteState.key === quoteKey ? quoteState : null;
  const error = actionError || currentQuote?.error || '';
  // Keep controls mounted while the latest prices are being fetched.
  const data = quoteState.data;
  const pending = !currentQuote?.data;

  if (error) {
    return (
      <div className="notice" role="alert">
        {error}
        <p>Tu selección se conserva. Puedes intentar actualizar los precios otra vez.</p>
        <button className="button" onClick={() => { setActionError(''); setQuoteState({key: '', data: null, error: ''}); setRetry(value => value + 1); }}>Reintentar</button>
        <p><button onClick={() => change([])}>Vaciar selección</button></p>
      </div>
    );
  }
  if (!data) return <p role="status">Actualizando precios de tu selección…</p>;
  const rows = lines.map(line => {
    const row = data.rows.find(row => row.id === line.id && row.size === line.size);
    return row ? { ...row, quantity: line.quantity } : null;
  });
  if (rows.some(row => row === null)) return <p role="status">Actualizando precios de tu selección…</p>;

  const hasImported=data.rows.some(row=>row.product.collection==='importadas');
  const paymentNote=hasImported?'Zapatillas importadas: pago anticipado por unidad y envío incluido en el precio. Las condiciones de los demás artículos se detallan por separado.':data.advance?'Pago anticipado para los despachos mayoristas; confirmar condiciones de cada despacho.':'Pago contraentrega sujeto a cobertura.';
  const message = `Hola Evolución Urbana, quisiera asesoría para esta selección:\n\n${data.rows.map(row => `${row.product.name}\nSKU: ${row.product.sku} | Talla: ${row.size} | Cantidad: ${row.quantity}\n${row.total===null?'Precio por confirmar':money(row.total)+' COP'}\n${ORIGIN}/producto/${row.product.slug}`).join('\n\n')}\n\n${data.subtotal===null?'Solicito cotización personalizada.':'Productos: '+money(data.subtotal)+' COP'}\n${data.shippingPending?'Envío por cotizar con asesor':'Envío incluido'}\n${data.total===null?'Total pendiente de confirmación':'Total: '+money(data.total)+' COP'}\n${data.warehouses.length>1?'Despachos separados, conservando beneficios y descuentos.':''}\n${paymentNote}\nMi ciudad es: \nPor favor confirmar disponibilidad y total.`;

  return (
    <div className="cart-grid">
      <section>
        {rows.map((row) => row && (
          <article key={`${row.id}:${row.size}`} className="cart-line">
            <Link href={`/producto/${row.product.slug}`}>
              <Image quality={85} src={row.product.images[0].replace('.webp', '-480.webp')} alt={row.product.name} width={480} height={600} sizes="(max-width: 700px) 28vw, 160px" />
            </Link>
            <div>
              <Link href={`/producto/${row.product.slug}`}><h2>{row.product.name}</h2></Link>
              <p>Talla {row.size} · {row.product.color}</p>
              <strong aria-busy={pending}>{pending ? 'Actualizando…' : row.total===null ? 'A cotizar' : money(row.total)}</strong>
              <div className="cart-line-actions">
                <span className="quantity-label">Cantidad</span>
                <QuantityControl quantity={row.quantity} name={row.product.name} onChange={quantity => change(lines.map(line => line.id === row.id && line.size === row.size ? { ...line, quantity } : line))} />
                <button type="button" className="cart-remove" onClick={() => change(lines.filter(line => line.id !== row.id || line.size !== row.size))}>Eliminar</button>
              </div>
            </div>
          </article>
        ))}
      </section>
      <aside className="cart-summary" aria-busy={pending}>
        <h2>Tu selección</h2>
        <p>Los beneficios por cantidad se calculan por grupo de entrega.</p>
        {pending ? <p role="status" className="cart-updating">Actualizando precios y beneficios…</p> : <>
        {data.requiresQuote&&<div className="quote-alert" role="status"><h3>Una selección a tu medida.</h3><p>{data.pricePending?'Un asesor te ayudará a confirmar la mejor tarifa para tu selección.':'Tus productos ya tienen precio; falta cotizar el envío.'}</p>{data.reasons.map(reason=><p key={reason}>{reason}</p>)}</div>}
        {data.subtotal!==null&&<div className="summary-total"><span>Productos</span><strong>{money(data.subtotal)}</strong></div>}
        <p>{data.shippingPending?'Envío: cotización con asesor.':'Envío incluido.'}</p>
        {data.total!==null&&<div className="summary-total"><span>Total</span><strong>{money(data.total)}</strong></div>}
        <p>{paymentNote}</p>
        {data.b1>0&&<p>Tu calzado seleccionado incluye seguro de transporte y medias de obsequio.</p>}
        {data.b2>0&&<p>Tu calzado seleccionado incluye seguro de transporte.</p>}
        {data.warehouses.length>1&&<div className="logistics-note"><h3>Tu look, en entregas separadas.</h3><p>Elegiste productos de {data.warehouses.length} grupos de entrega. Llegarán en despachos separados y conservarás los beneficios, ofertas y descuentos que correspondan a cada uno.</p><a href={wa('Hola, quisiera entender cómo funcionan los despachos separados y los beneficios de mi selección.')} target="_blank" rel="noopener noreferrer">Resolver una duda por WhatsApp ↗</a></div>}
        <p>Confirmaremos existencias y cobertura contigo antes de cerrar el pedido.</p>
        </>}
        <a className="button whatsapp" href={pending ? undefined : wa(message)} aria-disabled={pending || undefined} onClick={event => { if(pending) event.preventDefault(); }} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/>{pending ? 'ACTUALIZANDO SELECCIÓN…' : data.requiresQuote?'RECIBIR ASESORÍA PERSONALIZADA':'CONTINUAR POR WHATSAPP'}</a>
        <Link className="reset" href="/catalogo">Seguir explorando</Link>
      </aside>
    </div>
  );
}
