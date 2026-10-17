import type {Metadata} from 'next';
import './globals.css';
import '@/components/experience/editorial-video.css';
import './premium.css';
import './enhancements.css';
import './integrated-navigation.css';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ScrollProgress from '@/components/store/ScrollProgress';
import {metadata as meta,isIndexingEnabled} from '@/lib/seo';
import {ORIGIN} from '@/lib/config';

export const metadata:Metadata={
  ...meta(
    'Evolución Urbana | Tienda de moda urbana en Colombia',
    'Descubre Evolución Urbana: camisetas oversize, zapatillas y conjuntos. Explora nuestro catálogo y compra con asesoría por WhatsApp. Envíos en Colombia.'
  ),
  metadataBase:new URL(ORIGIN),
  verification:process.env.GOOGLE_SITE_VERIFICATION
    ? {google:process.env.GOOGLE_SITE_VERIFICATION}
    : undefined,
  robots:isIndexingEnabled()
    ? {
        index:true,
        follow:true
      }
    : {
        index:false,
        follow:false
      }
};

export default function Layout({
  children
}:{
  children:React.ReactNode
}){

  return (
    <html lang="es-CO" suppressHydrationWarning>
      <head><script id="eu-theme-init" dangerouslySetInnerHTML={{__html:`try{if(localStorage.getItem("eu-theme")==="light")document.documentElement.dataset.theme="light"}catch{}`}}/></head>
      <body>

        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>

        <Header/>
        <ScrollProgress/>
        {children}

        <Footer/>

      </body>
    </html>
  );
}
