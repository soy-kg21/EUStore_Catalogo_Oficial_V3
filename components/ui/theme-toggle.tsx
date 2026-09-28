'use client';
import {Moon, Sun} from 'lucide-react';
import {useEffect, useState} from 'react';

export default function ThemeToggle(){
  const [lightMode,setLightMode]=useState(false);
  useEffect(()=>{
    const sync=()=>setLightMode(document.documentElement.dataset.theme==='light');
    sync();
    const onStorage=(event:StorageEvent)=>{
      if(event.key!=='eu-theme'&&event.key!==null)return;
      if(event.newValue==='light')document.documentElement.dataset.theme='light';
      else delete document.documentElement.dataset.theme;
      sync();
    };
    window.addEventListener('storage',onStorage);
    return()=>window.removeEventListener('storage',onStorage);
  },[]);
  function toggleTheme(){
    const next=document.documentElement.dataset.theme!=='light';
    if(next)document.documentElement.dataset.theme='light';
    else delete document.documentElement.dataset.theme;
    try{localStorage.setItem('eu-theme',next?'light':'dark')}catch{/* Theme still works without storage. */}
    setLightMode(next);
  }
  return <button type="button" className="theme-toggle" onClick={toggleTheme}
    aria-label={lightMode?'Cambiar a modo oscuro':'Cambiar a modo claro'}
    title={lightMode?'Cambiar a modo oscuro':'Cambiar a modo claro'}>
    {lightMode?<Sun size={18}/>:<Moon size={18}/>}
  </button>;
}
