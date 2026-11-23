export default function EditorialWordmark({id}:{id?:string}) {
  const Tag = id ? 'h1' : 'div';
  return <Tag id={id} className="niebla-word" aria-label={id ? 'Evolución Urbana' : undefined} aria-hidden={id ? undefined : true}>
    <span className="niebla-word-line"><span data-ink>EVOLUCIÓN</span><i data-baseline/></span>
    <span className="niebla-word-line"><span data-ink>URBANA</span><i data-baseline/></span>
  </Tag>;
}
