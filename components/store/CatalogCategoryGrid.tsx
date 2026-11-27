'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {useEffect, useRef} from 'react';
import {catalogSections, type CatalogSection} from '@/lib/catalog-collections';
import styles from './catalog-category-grid.module.css';

const sections = Object.keys(catalogSections) as CatalogSection[];
const countFormat = new Intl.NumberFormat('es-CO');

export default function CatalogCategoryGrid({counts}: {counts: Record<CatalogSection, number>}) {
  const grid = useRef<HTMLElement>(null);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px) and (pointer: fine), (min-width: 1024px)');
    if (!grid.current || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = Array.from(grid.current.querySelectorAll<HTMLElement>('[data-category-card]'));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = cards.indexOf(entry.target as HTMLElement);
        const first = wide.matches ? index - index % 2 : index;
        const row = cards.slice(first, first + (wide.matches ? 2 : 1));

        for (const card of row) {
          card.dataset.visible = 'true';
          observer.unobserve(card);
        }
      }
    }, {threshold: 0.14});

    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return <section ref={grid} className={styles.grid} aria-label="Categorías del catálogo">
    {sections.map((key, index) => {
      const section = catalogSections[key];
      const count = counts[key];
      return <Link key={key} href={section.path} prefetch={false} className={styles.card}
        data-category-card aria-label={section.name} aria-describedby={`catalogo-${key}-count`}>
        <Image className={styles.art} src={section.image} fill alt=""
          style={{objectPosition: section.imagePosition}}
          sizes="(min-width: 2100px) 980px, (min-width: 768px) 46vw, 90vw"
          loading={index === 0 ? 'eager' : 'lazy'}/>
        <div className={styles.copy}>
          {'badge' in section && <span className={styles.badge}>{section.badge}</span>}
          <h2>{section.name}</h2>
          <p id={`catalogo-${key}-count`}>
            {countFormat.format(count)} {key === 'anime' ? (count === 1 ? 'diseño' : 'diseños') : (count === 1 ? 'referencia' : 'referencias')}
          </p>
          <span className={styles.action}>Explorar colección <ArrowUpRight size={17} aria-hidden="true"/></span>
        </div>
      </Link>;
    })}
  </section>;
}
