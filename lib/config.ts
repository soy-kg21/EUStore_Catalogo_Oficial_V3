export const ORIGIN=(process.env.NEXT_PUBLIC_SITE_URL||'https://www.evolucionurbana.store').replace(/\/$/,'');
export const WHATSAPP='573112231940';
export const categories=[{slug:'camisetas',name:'Camisetas',detail:'Siluetas amplias. Actitud propia.'},{slug:'zapatillas',name:'Zapatillas',detail:'Tu próximo paso empieza aquí.'},{slug:'conjuntos',name:'Conjuntos',detail:'Un look completo, a tu manera.'}];
export const money=(n:number)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
export const wa=(message:string)=>`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
