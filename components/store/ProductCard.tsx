import ProductPrice from './ProductPrice';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="product-card">
      <Link href={`/producto/${product.slug}`} className="card-image">
        <Image
          src={product.images[0]}
          sizes="(max-width: 600px) 48vw, (max-width: 1000px) 32vw, 25vw"
          alt={product.name}
          width={800}
          height={1000}
          preload={priority}
        />
        <span className="card-label">
          {product.category === 'camisetas'
            ? 'OVERSIZE · 270G'
            : product.category === 'conjuntos'
              ? 'CAMISETA + PANTALONETA'
              : 'SELECCIÓN URBANA'}
        </span>
        <span className="card-arrow"><ArrowUpRight size={19} /></span>
      </Link>
      <div className="card-info">
        <p>{product.color}</p>
        <Link href={`/producto/${product.slug}`}><h3>{product.name}</h3></Link>
        <ProductPrice product={product}/><p className="product-benefits">{product.warehouse==='B3'?'Envío según cantidad · Contra entrega':'Envío incluido · Contra entrega'}</p>{product.warehouse==='B1'&&<p className="product-benefits">Seguro + medias de obsequio</p>}
        <span className="card-sizes">
          {product.sizes.length > 6
            ? `${product.sizes[0]} — ${product.sizes[product.sizes.length - 1]}`
            : product.sizes.join(' / ')}
        </span>
      </div>
    </article>
  );
}
