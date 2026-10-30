'use client';

import ProductPrice from './ProductPrice';
import {productReference,shortProductDescription,productInquiryMessage} from '@/lib/product-content';
import Image from 'next/image';
import { Check, Maximize2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { readCart, saveCart } from '@/lib/cart';
import { money, ORIGIN, wa } from '@/lib/config';
import type { Product } from '@/lib/types';
import {orderedShoeSizes,shoeSizeLabel} from '@/lib/shoe-sizes';
import importedStyles from './imported-collection.module.css';

export default function ProductDetail({ product }: { product: Product }) {
  const imported=product.collection==='importadas',footwear=product.category==='zapatillas',buzos=product.collection==='conjuntos-buzos';
  const reference=productReference(product),sizeSystem=footwear&&!imported?'Nac':product.sizeSystem;
  const sizes=footwear?orderedShoeSizes(product.sizes):product.sizes;
  const units=[...new Set(sizes.map(value=>shoeSizeLabel(value,sizeSystem).system).filter(Boolean))];
  const [active, setActive] = useState(0);
  const gallery = useRef<HTMLDivElement>(null);
  const activePhoto = useRef(0);
  const selectPhoto = (index: number) => {
    const rail = gallery.current;
    if (!rail) return;
    rail.scrollTo({ left: index * rail.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  useEffect(() => {
    const rail = gallery.current;
    if (!rail) return;
    const observer = new ResizeObserver(() => {
      rail.scrollTo({ left: activePhoto.current * rail.clientWidth, behavior: 'instant' });
    });
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);
  const [size, setSize] = useState('');
  const [feedback, setFeedback] = useState('');

  const add = useCallback((selected: string) => {
    if (product.variants?.find(v=>v.size===selected)?.quantity===0) throw new Error('Esta talla está agotada.');
    if (!product.sizes.includes(selected)) throw new Error('Elige una talla válida.');
    const rows = readCart();
    const line = rows.find((item) => item.id === product.id && item.size === selected);

    if (line) {
      if (line.quantity >= 100) throw new Error('Cantidad máxima: 100.');
      line.quantity += 1;
    } else {
      rows.push({ id: product.id, size: selected, quantity: 1 });
    }

    saveCart(rows);
    setSize(selected);
    setFeedback('Añadido a tu selección.');
    return { id: product.id, size: selected, status: 'added_to_selection' };
  }, [product.id, product.sizes, product.variants]);

  useEffect(() => {
    type ModelContext = {
      registerTool: (tool: unknown, options: { signal: AbortSignal }) => void;
    };
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context) return;

    const controller = new AbortController();
    try {
      context.registerTool(
        {
          name: 'add_product_to_selection',
          description: 'Añade esta referencia y talla a la selección local. No envía mensajes ni realiza compras.',
          inputSchema: {
            type: 'object',
            properties: { size: { type: 'string', enum: product.sizes } },
            required: ['size'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false },
          execute: (input: unknown) => {
            const selected = (input as { size?: unknown })?.size;
            if (typeof selected !== 'string') throw new Error('Talla requerida');
            return add(selected);
          },
        },
        { signal: controller.signal },
      );
    } catch {
      // The human interface remains available when WebMCP is unsupported.
    }

    return () => controller.abort();
  }, [add, product.sizes]);

  const message = productInquiryMessage(product,size,ORIGIN);

  return (
    <div className={`detail-grid ${footwear?importedStyles.importedDetail:''}`}>
      <section aria-label="Galería del producto">
        <div className="gallery-main">
          <div ref={gallery} className="product-photo-rail" tabIndex={product.images.length > 1 ? 0 : undefined} aria-label="Fotografías del producto. Desliza para ver más."
            onScroll={event => {
              const rail = event.currentTarget;
              const index = Math.min(product.images.length - 1, Math.max(0, Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth))));
              if(activePhoto.current!==index){activePhoto.current=index;setActive(index);}
            }}
            onKeyDown={event => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                selectPhoto(Math.min(product.images.length - 1, Math.max(0, active + (event.key === 'ArrowRight' ? 1 : -1))));
              }
            }}>
            {product.images.map((image, index) => <div className="product-photo-slide" key={image}>
              <Image quality={85} unoptimized={image.startsWith('/api/catalog-media/')} src={image} alt={`${product.name}, vista ${index + 1}`} width={800} height={1000} sizes="(max-width: 850px) 100vw, 50vw" preload={index === 0} draggable={false} />
            </div>)}
          </div>
          {product.images.length > 1 && <span className="gallery-position" aria-live="polite">{active + 1} / {product.images.length}</span>}
          <Dialog>
            <DialogTrigger className="gallery-zoom" aria-label="Ampliar fotografía"><Maximize2 size={18} /></DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-[800px]">
              <DialogTitle>{product.name}</DialogTitle>
              <Image quality={85} unoptimized={product.images[active].startsWith('/api/catalog-media/')} src={product.images[active]} alt={product.name} width={800} height={1000} sizes="90vw" style={{ maxHeight: '75vh', width: '100%', objectFit: 'contain' }} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="thumbnails">
          {product.images.map((image, index) => (
            <button key={image} aria-label={`Ver foto ${index + 1}`} aria-pressed={index === active} onClick={() => selectPhoto(index)}>
              <Image quality={85} unoptimized={image.startsWith('/api/catalog-media/')} src={image} alt={`Vista ${index + 1}`} width={80} height={100} sizes="80px" />
            </button>
          ))}
        </div>
      </section>
      <section className="product-info">
        <p className="eyebrow">{imported?'CALZADO / ZAPATILLAS IMPORTADAS':footwear?'CALZADO / ZAPATILLAS NACIONALES':buzos?'STREETWEAR / BUZOS Y SUDADERAS':product.category === 'camisetas' ? 'STREETWEAR / OVERSIZE 270G' : 'STREETWEAR / CONJUNTOS'}</p>
        <h1>{product.name}</h1>
        <div className="product-price"><ProductPrice product={product}/><small>{footwear?'Precio por par':product.category==='conjuntos'?'Precio por conjunto':'Precio individual'}</small></div><ul className="benefit-list">{product.benefits.map(b=><li key={b}><Check size={14}/>{b}</li>)}</ul>
        <p className="product-meta">Referencia {reference||'Por confirmar'}{product.brand ? ` · ${imported?'Marca':'Marca registrada en catálogo'}: ${product.brand}` : ''}</p>
        <p className="product-description">{shortProductDescription(product)}</p>
        <p><strong>Color:</strong> {product.color}</p>
        {product.state === 'review' && <p className="notice">Esta referencia tiene una discrepancia de color en el catálogo. Confirma el color de la fotografía con el asesor.</p>}
        <div className={footwear?importedStyles.sizePanel:undefined}>
          <div className="size-label"><strong>Selecciona tu talla</strong><span>{size ? footwear ? `${shoeSizeLabel(size,sizeSystem).label} ${shoeSizeLabel(size,sizeSystem).system}`.trim() : size : (footwear&&units.length===1?'Sistema '+units[0]:'Sin seleccionar')}</span></div>
          <div className={footwear?importedStyles.sizeOptions:'sizes'} role="group" aria-label={footwear?`Tallas de zapatillas ${imported?'importadas':'nacionales'}`:'Tallas comerciales'}>
            {sizes.map(productSize=>{const unavailable=product.variants?.find(v=>v.size===productSize)?.quantity===0,display=shoeSizeLabel(productSize,sizeSystem);return <button type="button" key={productSize} disabled={unavailable} aria-label={`Talla ${footwear?`${display.label} ${display.system}`.trim():productSize}${unavailable?', agotada':''}`} aria-pressed={size===productSize} onClick={()=>{setSize(productSize);setFeedback('');}}>{footwear?<><strong>{display.label}</strong>{units.length>1&&display.system&&<small>{display.system}</small>}</>:productSize}</button>;})}
          </div>
          <p className="stock-note">{imported?'Selecciona la talla de esta referencia. Confirmaremos existencias y ajuste antes de cerrar tu pedido.':'Tallas de referencia. Confirmaremos existencias antes de cerrar tu pedido.'}</p>
          {footwear&&<a className={importedStyles.sizeAdvice} href={wa(`Hola, necesito asesoría para elegir mi talla en las zapatillas ${imported?'importadas':'nacionales'} ${product.name}. Referencia ${reference||'Por confirmar'}.`)} target="_blank" rel="noopener noreferrer">¿Tienes dudas con tu talla? Te asesoramos ↗</a>}
        </div>
        {size&&product.variants?.find(v=>v.size===size)?.quantity!==0 ? <a href={wa(message)} target="_blank" rel="noopener noreferrer" className="button whatsapp"><MessageCircle size={20} /> COMPRAR POR WHATSAPP</a> : <button className="button whatsapp" onClick={() => setFeedback('Selecciona una talla para continuar.')}><MessageCircle size={20} /> COMPRAR POR WHATSAPP</button>}
        <button className="button add-button" onClick={() => { try { add(size); } catch (error) { setFeedback((error as Error).message); } }}><ShoppingBag size={18} /> AÑADIR A MI SELECCIÓN</button>
        <div className="feedback" role="status">{feedback} {feedback.startsWith('Añadido') && <button onClick={() => window.dispatchEvent(new Event('eu-open-cart'))} style={{ textDecoration: 'underline' }}>Ver selección</button>}</div>
        <p className="stock-note"><Check size={13} style={{ display: 'inline', marginRight: 5 }} />Asesoría de talla y condiciones de entrega por WhatsApp.</p>
        <details className="details-row product-facts" open><summary>Detalles de esta referencia</summary><dl><div><dt>Referencia</dt><dd>{reference||'Por confirmar'}</dd></div>{product.brand&&<div><dt>Marca</dt><dd>{product.brand}</dd></div>}<div><dt>Colección</dt><dd>{imported?'Zapatillas importadas':footwear?'Zapatillas nacionales':buzos?'Buzos y sudaderas':product.category==='camisetas'?'Camisetas oversize':'Camiseta + pantaloneta'}</dd></div>{product.color&&<div><dt>Color</dt><dd>{product.color}</dd></div>}{product.material&&<div><dt>Material</dt><dd>{product.material}</dd></div>}{product.weight&&<div><dt>Gramaje</dt><dd>{product.weight} g</dd></div>}<div><dt>Disponibilidad</dt><dd>{product.stock===0?'Agotado':'Confirmado'}</dd></div><div><dt>Tallas</dt><dd>{sizes.map(v=>footwear?shoeSizeLabel(v,sizeSystem).label:v).join(' · ')}{footwear&&units.length===1?' '+units[0]:''}</dd></div></dl></details>
        <details className="details-row"><summary>Características y tallaje</summary><p>{product.material && product.material !== 'Pendiente de ficha técnica' ? `Material declarado: ${product.material}. ` : ''}{product.weight ? `Gramaje declarado: ${product.weight} g. ` : ''}{product.sizeNote}</p></details>
        <details className="details-row"><summary>Envíos y pago</summary><p>{imported?'Pago anticipado por unidad. El envío está incluido en el precio de las zapatillas importadas. Recibe asesoría sobre esta referencia y coordina talla, pago y entrega directamente por WhatsApp. No se realizan cobros en esta web.':'Las condiciones dependen de la colección, cantidad y ciudad. Consulta el resumen de tu selección; la cobertura y disponibilidad se confirman con el asesor. No se realizan cobros en esta web.'}</p></details>
      </section>
    </div>
  );
}
