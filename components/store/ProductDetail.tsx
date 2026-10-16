'use client';

import ProductPrice from './ProductPrice';
import Image from 'next/image';
import { Check, Maximize2, MessageCircle, ShoppingBag } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { readCart, saveCart } from '@/lib/cart';
import { money, ORIGIN, wa } from '@/lib/config';
import type { Product } from '@/lib/types';

export default function ProductDetail({ product }: { product: Product }) {
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
  }, [product.id, product.sizes]);

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

  const message = `Hola Evolución Urbana, estoy interesado en:\nProducto: ${product.name}\nCódigo: ${product.sku}\nColor: ${product.color}\nTalla: ${size}\nPrecio: ${product.pricingPending ? "Por confirmar" : money(product.price)+" COP"}\n${ORIGIN}/producto/${product.slug}\nQuisiera confirmar disponibilidad, envío y forma de pago.`;

  return (
    <div className="detail-grid">
      <section aria-label="Galería del producto">
        <div className="gallery-main">
          <div ref={gallery} className="product-photo-rail" tabIndex={product.images.length > 1 ? 0 : undefined} aria-label="Fotografías del producto. Desliza para ver más."
            onScroll={event => {
              const rail = event.currentTarget;
              const index = Math.min(product.images.length - 1, Math.max(0, Math.round(rail.scrollLeft / Math.max(1, rail.clientWidth))));
              activePhoto.current = index;
              setActive(index);
            }}
            onKeyDown={event => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                selectPhoto(Math.min(product.images.length - 1, Math.max(0, active + (event.key === 'ArrowRight' ? 1 : -1))));
              }
            }}>
            {product.images.map((image, index) => <div className="product-photo-slide" key={image}>
              <Image src={image} alt={`${product.name}, vista ${index + 1}`} width={800} height={1000} sizes="(max-width: 850px) 100vw, 50vw" preload={index === 0} draggable={false} />
            </div>)}
          </div>
          {product.images.length > 1 && <span className="gallery-position" aria-live="polite">{active + 1} / {product.images.length}</span>}
          <Dialog>
            <DialogTrigger className="gallery-zoom" aria-label="Ampliar fotografía"><Maximize2 size={18} /></DialogTrigger>
            <DialogContent className="max-w-[90vw] sm:max-w-[800px]">
              <DialogTitle>{product.name}</DialogTitle>
              <Image src={product.images[active]} alt={product.name} width={800} height={1000} sizes="90vw" style={{ maxHeight: '75vh', width: '100%', objectFit: 'contain' }} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="thumbnails">
          {product.images.map((image, index) => (
            <button key={image} aria-label={`Ver foto ${index + 1}`} aria-pressed={index === active} onClick={() => selectPhoto(index)}>
              <Image src={image.replace('.webp', '-480.webp')} alt={`Vista ${index + 1}`} width={80} height={100} sizes="80px" />
            </button>
          ))}
        </div>
      </section>
      <section className="product-info">
        <p className="eyebrow">{product.category === 'camisetas' ? 'STREETWEAR / OVERSIZE 270G' : product.category === 'conjuntos' ? 'STREETWEAR / CONJUNTOS' : 'CALZADO / SELECCIÓN URBANA'}</p>
        <h1>{product.name}</h1>
        <div className="product-price"><ProductPrice product={product}/><small>Precio individual</small></div><ul className="benefit-list">{product.benefits.map(b=><li key={b}><Check size={14}/>{b}</li>)}</ul>
        <p className="product-meta">Referencia {product.sku}{product.brand ? ` · Marca registrada en catálogo: ${product.brand}` : ''}</p>
        <p className="product-description">{product.description}</p>
        <p><strong>Color:</strong> {product.color}</p>
        {product.state === 'review' && <p className="notice">Esta referencia tiene una discrepancia de color en el catálogo. Confirma el color de la fotografía con el asesor.</p>}
        <div className="size-label"><strong>Selecciona tu talla</strong><span>{size || 'Sin seleccionar'}</span></div>
        <div className="sizes" role="group" aria-label="Tallas comerciales">
          {product.sizes.map((productSize) => <button key={productSize} aria-pressed={size === productSize} onClick={() => { setSize(productSize); setFeedback(''); }}>{productSize}</button>)}
        </div>
        <p className="stock-note">Tallas de referencia. Confirmaremos existencias antes de cerrar tu pedido.</p>
        {size ? <a href={wa(message)} target="_blank" rel="noopener noreferrer" className="button whatsapp"><MessageCircle size={20} /> COMPRAR POR WHATSAPP</a> : <button className="button whatsapp" onClick={() => setFeedback('Selecciona una talla para continuar.')}><MessageCircle size={20} /> COMPRAR POR WHATSAPP</button>}
        <button className="button add-button" onClick={() => { try { add(size); } catch (error) { setFeedback((error as Error).message); } }}><ShoppingBag size={18} /> AÑADIR A MI SELECCIÓN</button>
        <div className="feedback" role="status">{feedback} {feedback.startsWith('Añadido') && <button onClick={() => window.dispatchEvent(new Event('eu-open-cart'))} style={{ textDecoration: 'underline' }}>Ver selección</button>}</div>
        <p className="stock-note"><Check size={13} style={{ display: 'inline', marginRight: 5 }} />Asesoría de talla y condiciones de entrega por WhatsApp.</p>
        <details className="details-row"><summary>Características y tallaje</summary><p>{product.material && product.material !== 'Pendiente de ficha técnica' ? `Material declarado: ${product.material}. ` : ''}{product.weight ? `Gramaje declarado: ${product.weight} g. ` : ''}{product.sizeNote}</p></details>
        <details className="details-row"><summary>Envíos y pago</summary><p>Las condiciones dependen de la colección, cantidad y ciudad. Consulta el resumen de tu selección; la cobertura y disponibilidad se confirman con el asesor. No se realizan cobros en esta web.</p></details>
      </section>
    </div>
  );
}
