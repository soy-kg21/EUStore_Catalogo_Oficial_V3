import Link from 'next/link';

export default function CatalogHeading({title = 'Todo el catálogo.', section, detail = 'Explora prendas y calzado. Combina tu estilo, elige tu talla y conversemos.'}: {
  title?: string;
  section?: string;
  detail?: string;
}) {
  return <>
    <nav className="breadcrumb" aria-label="Ruta de navegación">
      <Link href="/">Inicio</Link><span aria-hidden="true">/</span>
      {section
        ? <><Link href="/catalogo">Catálogo</Link><span aria-hidden="true">/</span><span aria-current="page">{section}</span></>
        : <span aria-current="page">Catálogo</span>}
    </nav>
    <div className="catalog-head">
      <p className="eyebrow">ENCUENTRA LO QUE VA CONTIGO</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-intro">{detail}</p>
    </div>
  </>;
}
