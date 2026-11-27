'use client';

import Form from 'next/form';
import Link from 'next/link';
import {Search} from 'lucide-react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import styles from './catalog-filter.module.css';

export type FilterOptions = {sizes: string[]; colors: string[]; brands: string[]};

export default function Filters({path, options, values, mobile, onApply}: {
  path: string;
  options: FilterOptions;
  values: Record<string, string>;
  mobile: boolean;
  onApply: () => void;
}) {
  const choice = (name: string, label: string, items: {value: string; label: string}[]) =>
    <label className={styles.field}>
      <span>{label}</span>
      {mobile ? <select name={name} defaultValue={values[name] || 'all'}>
        <option value="all">Todos</option>
        {items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select> : <Select name={name} defaultValue={values[name] || 'all'}>
        <SelectTrigger aria-label={label}><SelectValue/></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
        </SelectContent>
      </Select>}
    </label>;

  const results = path + '#catalogo-filtros';
  return <Form className={styles.form} action={results} prefetch={false} onSubmit={onApply}>
    <label className={styles.field}>
      <span>Buscar una referencia</span>
      <div className={styles.search}>
        <Search size={16} aria-hidden="true"/>
        <input type="search" aria-label="Buscar productos" name="q" defaultValue={values.q}
          enterKeyHint="search" autoComplete="off" placeholder="Nombre, marca o SKU" maxLength={100}/>
      </div>
    </label>
    <div className={styles.fields}>
      {choice('size', 'Talla', options.sizes.map(value => ({value, label: value})))}
      {choice('color', 'Color', options.colors.map(value => ({value, label: value})))}
      {choice('brand', 'Marca', options.brands.map(value => ({value, label: value})))}
      <label className={styles.field}>
        <span>Precio máximo (COP)</span>
        <input type="number" inputMode="numeric" name="max" min="0" step="1" defaultValue={values.max} placeholder="Sin límite"/>
      </label>
      {choice('availability', 'Disponibilidad', [
        {value: 'unknown', label: 'Por confirmar'},
        {value: 'confirmed', label: 'Stock confirmado'},
      ])}
      {choice('sort', 'Ordenar por', [
        {value: 'price-asc', label: 'Menor precio'},
        {value: 'price-desc', label: 'Mayor precio'},
        {value: 'name', label: 'Nombre A–Z'},
      ])}
    </div>
    <div className={styles.actions}>
      <button className="button" type="submit">Ver resultados</button>
      <Link prefetch={false} className={styles.reset} href={results} onClick={onApply}>Limpiar filtros</Link>
    </div>
  </Form>;
}
