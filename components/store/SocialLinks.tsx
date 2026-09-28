import {ArrowUpRight} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import {wa} from '@/lib/config';
export default function SocialLinks(){return <div className="social-links social-grid">
<a href="https://www.instagram.com/evolucion_urbanacol/" target="_blank" rel="noopener noreferrer"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg><span>Instagram<small>@evolucion_urbanacol</small></span><ArrowUpRight size={18}/></a>
<a href="https://www.facebook.com/evolucion.urbanacol" target="_blank" rel="noopener noreferrer"><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12A12 12 0 1 0 10.1 23.9v-8.4H7v-3.5h3.1V9.3c0-3.1 1.8-4.8 4.6-4.8 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-1.9.9-1.9 1.9V12h3.3l-.5 3.5H14v8.4A12 12 0 0 0 24 12Z"/></svg><span>Facebook<small>Evolución Urbana</small></span><ArrowUpRight size={18}/></a>
<a href="https://www.tiktok.com/@evolucion_urbanacol" target="_blank" rel="noopener noreferrer"><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 1h-3.9v15.7a3.3 3.3 0 1 1-2.8-3.3V9.5a7.2 7.2 0 1 0 6.7 7.2V8.8a9.6 9.6 0 0 0 5.4 1.6V6.5A5.5 5.5 0 0 1 16.6 1Z"/></svg><span>TikTok<small>@evolucion_urbanacol</small></span><ArrowUpRight size={18}/></a>
<a href={wa('Hola, quiero asesoría para armar mi próximo look.')} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={30}/><span>WhatsApp<small>+57 311 223 1940</small></span><ArrowUpRight size={18}/></a>
</div>}
