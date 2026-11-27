'use client';

import Image from 'next/image';
import {ArrowDown} from 'lucide-react';
import {useEffect, useRef, type CSSProperties, type ReactNode} from 'react';
import {cinemaArtwork} from '@/lib/anime-cinema-art';
import styles from './universe.module.css';

const covers = {
  all: {name: 'Todas', src: cinemaArtwork.jordan.src, mobileFocus: '60%', mobilePivot: '75% 32%', desktopFocus: '18%'},
  anime: {name: 'Anime', src: cinemaArtwork.luffy.src, mobileFocus: '72%', mobilePivot: '76% 6%', desktopFocus: '0%'},
  cartoon: {name: 'Cartoon', src: cinemaArtwork.panther.src, mobileFocus: '56%', mobilePivot: '70% 8%', desktopFocus: '4%'},
  rock: {name: 'Rock', src: cinemaArtwork.slash.src, mobileFocus: '62%', mobilePivot: '75% 26%', desktopFocus: '15%'},
  urbanos: {name: 'Urbanas', src: cinemaArtwork.snoop.src, mobileFocus: '60%', mobilePivot: '73% 8%', desktopFocus: '4%'},
};

export default function AnimeUniverseHero({line, navigation}: {line: string; navigation: ReactNode}) {
  const stage = useRef<HTMLDivElement>(null);
  const cover = covers[line as keyof typeof covers] ?? covers.all;
  const focus = {
    '--cover-mobile-focus': cover.mobileFocus,
    '--cover-mobile-pivot': cover.mobilePivot,
    '--cover-desktop-focus': cover.desktopFocus,
  } as CSSProperties;

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let x = 0;
    let y = 0;
    const draw = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const horizontal = Math.max(-12, Math.min(12, (x - bounds.left) / bounds.width * 24 - 12));
      const vertical = Math.max(-7, Math.min(7, (y - bounds.top) / bounds.height * 14 - 7));
      element.style.setProperty('--cover-shift-x', `${horizontal}px`);
      element.style.setProperty('--cover-shift-y', `${vertical}px`);
    };
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      element.style.removeProperty('--cover-shift-x');
      element.style.removeProperty('--cover-shift-y');
    };
    element.addEventListener('pointermove', move, {passive: true});
    element.addEventListener('pointerleave', reset);
    motion.addEventListener('change', reset);
    return () => {
      reset();
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);

  return <section id="anime-inicio" className={styles.staticIntro} aria-labelledby="anime-hero-title">
    <div ref={stage} className={styles.staticCover} style={focus}>
      <div key={cover.src} className={styles.staticMedia}>
        <Image className={styles.staticArt} src={cover.src} alt="" fill sizes="100vw" loading="eager" fetchPriority="high"/>
      </div>
      <div className={styles.staticCopy}>
        <p>El universo sigue contigo</p>
        <h1 id="anime-hero-title">{cover.name}</h1>
      </div>
      <div className={styles.staticFooter}>
        <span>Tu próxima favorita empieza aquí</span>
        <a href="#coleccion">Explora los diseños <ArrowDown size={16} aria-hidden="true"/></a>
      </div>
    </div>
    <div className={styles.discoverWrap}>
      <div className={styles.discover} id="anime-discover">{navigation}</div>
    </div>
  </section>;
}
