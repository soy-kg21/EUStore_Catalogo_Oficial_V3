'use client';

import Link from 'next/link';
import {SlidersHorizontal} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {catalogSections, type CatalogSection} from '@/lib/catalog-collections';
import CatalogDock from './CatalogDock';
import CatalogFilterPanel from './CatalogFilterPanel';
import Filters, {type FilterOptions} from './Filters';
import styles from './catalog-dock.module.css';

const countFormat = new Intl.NumberFormat('es-CO');
const filterNames = ['q', 'size', 'color', 'brand', 'max', 'availability', 'sort'];

export default function CatalogNavigation({active, total, path, options, values}: {
  active?: CatalogSection;
  total: number;
  path: string;
  options: FilterOptions;
  values: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const activeFilters = filterNames.filter(key => Boolean(values[key])).length;

  // Keep the existing reference-search link on the imported collection working.
  useEffect(() => {
    const openSearch = () => {
      dock.current?.closest('[data-catalog-start]')?.scrollIntoView({block: 'start'});
      setOpen(true);
    };
    const openFromHash = () => { if (window.location.hash === '#busqueda') openSearch(); };
    const followSearchLink = (event: MouseEvent) => {
      if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey &&
        event.target instanceof Element && event.target.closest('a[href="#busqueda"]')) openSearch();
    };
    const frame = requestAnimationFrame(openFromHash);
    window.addEventListener('hashchange', openFromHash);
    document.addEventListener('click', followSearchLink);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', openFromHash);
      document.removeEventListener('click', followSearchLink);
    };
  }, []);

  return <CatalogDock dockRef={dock} id="catalogo-filtros" navLabel="Categorías del catálogo"
    activeLabel={active ? catalogSections[active].shortName : 'Búsqueda'} actions={<>
    <span className={styles.count} role="status">
      {countFormat.format(total)} <span>{total === 1 ? 'referencia' : 'referencias'}</span>
    </span>
    <button ref={trigger} id="busqueda" type="button" className={styles.filter}
      aria-label="Filtros de productos" title="Filtros" aria-haspopup="dialog" aria-expanded={open}
      aria-controls={open ? 'catalogo-filter-panel' : undefined} onClick={() => setOpen(!open)}>
      <SlidersHorizontal size={18} aria-hidden="true"/>
      {activeFilters > 0 && <b aria-hidden="true">{activeFilters}</b>}
    </button>
    <CatalogFilterPanel open={open} onOpenChange={setOpen} trigger={trigger} id="catalogo-filter-panel"
      title="Filtros del catálogo">
      {mobile => <Filters path={path} options={options} values={values} mobile={mobile} onApply={() => setOpen(false)}/>}
    </CatalogFilterPanel>
    </>}>
    <Link href="/catalogo">Catálogo</Link>
    {Object.entries(catalogSections).map(([key, section]) =>
      <Link key={key} href={section.path} prefetch={false}
        aria-current={active === key ? 'page' : undefined}>{section.shortName}</Link>,
    )}
  </CatalogDock>;
}
