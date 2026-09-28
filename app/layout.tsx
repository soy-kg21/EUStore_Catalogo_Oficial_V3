import type {Metadata} from 'next';
import './globals.css';
import '@/components/experience/editorial-video.css';
import './premium.css';
import './enhancements.css';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ScrollProgress from '@/components/store/ScrollProgress';
import {metadata as meta} from '@/lib/seo';

export const metadata:Metadata={
  ...meta(
    'Evolución Urbana Store | Moda urbana en Colombia',
    'Camisetas oversize, zapatillas y conjuntos. Encuentra tu estilo y compra con asesoría por WhatsApp.'
  ),
  metadataBase:new URL('https://www.evolucionurbana.store'),
  icons:{
    icon:'/imagenes/logo.png'
  },
  robots:process.env.INDEXING_ENABLED==='true'
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