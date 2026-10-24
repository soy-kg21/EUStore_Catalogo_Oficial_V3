type Revision={partial?:boolean;products:{section:string;route:{id:string;slug:string}}[];removedRoutes?:{section:string;id:string;slug:string}[]};
// An initial selective publication overlays the original catalog. It never
// turns an unselected section into an empty authoritative catalog.
export function mergePublishedProducts<T extends {id:string;slug:string}>(baseline:T[],published:T[],revision:Revision,sections:string[]):T[]{
 if(!revision.partial)return published;
 const routes=[...revision.products.filter(p=>sections.includes(p.section)).map(p=>p.route),...(revision.removedRoutes||[]).filter(p=>sections.includes(p.section))];
 const ids=new Set(routes.map(p=>p.id.toLowerCase())),slugs=new Set(routes.map(p=>p.slug));
 return [...baseline.filter(p=>!ids.has(p.id.toLowerCase())&&!slugs.has(p.slug)),...published];
}
