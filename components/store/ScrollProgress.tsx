'use client';

import {useEffect, useRef} from 'react';
import {usePathname} from 'next/navigation';
import {cinemaPageProgress} from '@/lib/anime-cinema';

export default function ScrollProgress() {
  const track = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    const bar = track.current;
    if (!bar) return;

    const root = document.documentElement;
    const header = document.querySelector('header.header');
    let cinema = document.querySelector<HTMLElement>('[data-anime-journey]');
    let frame = 0;
    let disposed = false;
    let needsMeasure = true;
    let maxScroll = 0;
    let lastHeader = -1;
    let lastProgress = -1;

    const update = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      if (needsMeasure) {
        needsMeasure = false;
        maxScroll = root.scrollHeight - root.clientHeight;
        const height = header?.getBoundingClientRect().height || 82;
        if (height !== lastHeader) {
          lastHeader = height;
          root.style.setProperty('--site-header-height', `${height}px`);
        }
      }

      const scroll = window.scrollY;
      const start = Number(cinema?.dataset.journeyStart);
      const end = Number(cinema?.dataset.journeyEnd);
      const progress = cinema?.dataset.enhanced === 'true' && cinema.dataset.reduced !== 'true'
        && Number.isFinite(start) && Number.isFinite(end)
        ? cinemaPageProgress(scroll, maxScroll, start, end)
        : maxScroll > 0 ? Math.min(1, Math.max(0, scroll / maxScroll)) : 0;
      if (progress !== lastProgress) {
        bar.style.setProperty('--scroll-progress', String(progress));
        lastProgress = progress;
      }
    };

    const schedule = () => {
      if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(update);
    };
    const measure = () => {
      needsMeasure = true;
      schedule();
    };
    const cinemaMeasure = () => {
      cinema = document.querySelector<HTMLElement>('[data-anime-journey]');
      measure();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    if (header) observer.observe(header);

    schedule();
    void document.fonts.ready.then(measure);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', measure);
    window.addEventListener('pageshow', measure);
    window.addEventListener('eu-cinema-measure', cinemaMeasure);
    document.addEventListener('visibilitychange', measure);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pageshow', measure);
      window.removeEventListener('eu-cinema-measure', cinemaMeasure);
      document.removeEventListener('visibilitychange', measure);
    };
  }, [path]);

  return <div ref={track} className="eu-scroll-progress" aria-hidden="true"><span/></div>;
}
