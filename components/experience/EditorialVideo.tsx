'use client';

import { Play, Pause } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  desktop: string;
  mobile: string;
  desktopPoster: string;
  mobilePoster: string;
  label: string;
  eager?: boolean;
};

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };

export default function EditorialVideo({
  desktop, mobile, desktopPoster, mobilePoster, label, eager = false,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const toggle = useRef<() => void>(() => {});
  const id = useId();
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const element = video.current;
    const root = container.current;
    if (!element || !root) return;
    const screen = window.matchMedia('(max-width: 700px)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let near = eager;
    // Playback begins from the actual initial visibility, independent of the
    // control's CSS animation and the first IntersectionObserver callback.
    const initial = root.getBoundingClientRect();
    let visible = initial.bottom > 0 && initial.top < window.innerHeight;
    near = near || visible;
    let manual: boolean | null = null;
    let disposed = false;
    let pending = false;
    let unavailable = false;
    let generation = 0;
    const wantsPlayback = () => manual ?? (!motion.matches && !connection?.saveData && !['slow-2g','2g','3g'].includes(connection?.effectiveType || ''));

    function sync() {
      if (disposed || unavailable) return;
      const wanted = wantsPlayback();
      if (near && wanted && !document.hidden && !element!.getAttribute('src')) {
        element!.muted = true;
        element!.preload = 'auto';
        element!.poster = screen.matches ? mobilePoster : desktopPoster;
        element!.src = screen.matches ? mobile : desktop;
        element!.load();
      }
      if (!wanted || !visible || document.hidden) {
        element!.pause();
        return;
      }
      if (!element!.getAttribute('src') || !element!.paused || pending) return;
      pending = true;
      const attempt = generation;
      let interrupted = false;
      element!.play().catch((error: DOMException) => {
        interrupted = error.name === 'AbortError';
        if (!disposed && attempt === generation && !interrupted) {
          manual = false;
          setPlaying(false);
        }
      }).finally(() => {
        if (!disposed && attempt === generation) {
          pending = false;
          if (interrupted) sync();
        }
      });
    }

    const started = () => { setHasFrame(true); setPlaying(true); };
    const paused = () => setPlaying(false);
    const broken = () => {
      unavailable = true;
      setPlaying(false);
      setHasFrame(false);
      setFailed(true);
    };
    const changedScreen = () => {
      generation += 1;
      pending = false;
      unavailable = false;
      element.pause();
      element.removeAttribute('src');
      element.load();
      setHasFrame(false);
      setFailed(false);
      sync();
    };
    const changedPreference = () => { manual = null; sync(); };

    element.addEventListener('playing', started);
    element.addEventListener('pause', paused);
    element.addEventListener('error', broken);
    screen.addEventListener('change', changedScreen);
    motion.addEventListener('change', changedPreference);
    connection?.addEventListener('change', changedPreference);
    document.addEventListener('visibilitychange', sync);

    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) near = true;
      sync();
    });
    viewport.observe(root);
    const proximity = eager ? null : new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { near = true; sync(); }
    }, { rootMargin: '250px' });
    proximity?.observe(root);

    toggle.current = () => {
      manual = element.paused;
      near = true;
      // A failed media request can be retried with an explicit click.
      if (unavailable) {
        unavailable = false;
        setFailed(false);
        element.removeAttribute('src');
      }
      sync();
    };
    sync();
    setMounted(true);

    return () => {
      disposed = true;
      toggle.current = () => {};
      viewport.disconnect();
      proximity?.disconnect();
      screen.removeEventListener('change', changedScreen);
      motion.removeEventListener('change', changedPreference);
      connection?.removeEventListener('change', changedPreference);
      document.removeEventListener('visibilitychange', sync);
      element.removeEventListener('playing', started);
      element.removeEventListener('pause', paused);
      element.removeEventListener('error', broken);
      element.pause();
      element.removeAttribute('src');
      element.load();
    };
  }, [desktop, mobile, desktopPoster, mobilePoster, eager]);

  return (
    <div className={`eu-video ${hasFrame ? 'eu-video-has-frame' : ''}`} ref={container}>
      <picture className="eu-video-poster">
        <source media="(max-width: 700px)" srcSet={mobilePoster} />
        {/* Native picture selects one responsive poster before hydration. */}
        <img src={desktopPoster} alt={label} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} />
      </picture>
      <video ref={video} id={id} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
      <div className="eu-video-shade" aria-hidden="true" />
      {mounted && <button type="button" className={`eu-video-control ${playing ? 'is-playing' : 'is-paused'}`} aria-controls={id}
        aria-label={`${playing ? 'Pausar' : 'Reproducir'} video: ${label}`}
        onClick={() => toggle.current()}>
        <span className="video-control-icon" aria-hidden="true">{playing ? <Pause size={16}/> : <Play size={16}/>}</span>
        <span className="video-control-label">{playing ? 'Pausar video' : failed ? 'Reintentar video' : 'Reproducir video'}</span>
      </button>}
      {failed && <span className="eu-video-status" role="status">Video no disponible. Mostrando imagen.</span>}
    </div>
  );
}
