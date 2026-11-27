'use client';

import Link, {useLinkStatus} from 'next/link';
import {ArrowDown} from 'lucide-react';
import {catalogPageSize} from '@/lib/catalog-pagination';
import styles from './catalog-dock.module.css';

const format = new Intl.NumberFormat('es-CO');

function LoadMoreLabel() {
  const {pending} = useLinkStatus();
  return <span aria-live="polite">{pending ? 'Cargando productos…' : <>Mostrar más productos <ArrowDown size={17} aria-hidden="true"/></>}</span>;
}

export default function CatalogLoadMore({path, values, shown, total, page, pages}: {
  path: string;
  values: Record<string, string>;
  shown: number;
  total: number;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;
  const nextPage = page + Math.ceil(shown / catalogPageSize);
  const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value));
  query.set('hasta', String(nextPage));

  return <div className={styles.loadMore}>
    <p role="status">Has visto {format.format(shown)} de {format.format(total)} referencias</p>
    <div className={styles.loadTrack} aria-hidden="true"><span style={{width: `${shown / total * 100}%`}}/></div>
    {nextPage <= pages && <Link className={styles.loadButton} href={path + '?' + query} prefetch={false} scroll={false}>
      <LoadMoreLabel/>
    </Link>}
  </div>;
}
