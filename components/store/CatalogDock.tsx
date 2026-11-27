'use client';

import {ArrowUp} from 'lucide-react';
import {useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject} from 'react';
import {createPortal, flushSync} from 'react-dom';
import styles from './catalog-dock.module.css';

export const catalogMobileQuery = '(max-width: 700px), (max-width: 1023px) and (pointer: coarse)';
const headerSlot = 'mobile-category-slot';
const dockTiming = {duration: 260, easing: 'cubic-bezier(.2,.85,.25,1)'};

function readDockPositions(rail: HTMLElement | null) {
  if (!rail || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const {left, right} = rail.getBoundingClientRect();
  const positions = new Map<HTMLAnchorElement, DOMRect>();
  for (const link of rail.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const box = link.getBoundingClientRect();
    if (box.width && box.right > left && box.left < right) positions.set(link, box);
  }
  const active = rail.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
  return {positions, source: active ? positions.get(active) : undefined};
}

export function catalogDockStart(dock: HTMLDivElement) {
  // Its zero-height sibling keeps the natural location while the dock is sticky.
  const start = dock.previousElementSibling?.getBoundingClientRect().top ?? 0;
  const inset = parseFloat(getComputedStyle(dock).top) || 0;
  return Math.max(0, window.scrollY + start - inset + 2);
}

export default function CatalogDock({id, dockRef, activeLabel, navLabel, children, actions}: {
  id?: string;
  dockRef: RefObject<HTMLDivElement | null>;
  activeLabel: string;
  navLabel: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const startRef = useRef<HTMLSpanElement>(null);
  const links = useRef<HTMLElement>(null);
  const moveFocus = useRef(false);
  const previousPositions = useRef<ReturnType<typeof readDockPositions>>(null);
  const running = useRef(new Set<Animation>());
  const wasPinned = useRef(false);
  const [placement, setPlacement] = useState<{slot: HTMLElement; pinned: boolean} | null>(null);
  const pinned = placement?.pinned ?? false;

  useEffect(() => {
    const dock = dockRef.current;
    const start = startRef.current;
    const slot = document.getElementById(headerSlot);
    const header = slot?.parentElement;
    if (!dock || !start || !slot || !header) return;
    const media = matchMedia(catalogMobileQuery);
    let frame = 0;
    let inset = Number.NaN;
    let measureInset = true;
    let previousPinned = false;

    const update = () => {
      frame = 0;
      const mobile = media.matches;
      if (mobile && measureInset) {
        inset = parseFloat(getComputedStyle(dock).top);
        measureInset = !Number.isFinite(inset);
      }
      // The sentinel marks the start, and the dock yields at the end of its section.
      // Both checks use the current frame so a fast scroll can cross either boundary.
      const next = mobile && Number.isFinite(inset) && window.scrollY > 0
        && start.getBoundingClientRect().top <= inset + .5
        && Math.abs(dock.getBoundingClientRect().top - inset) <= 1;
      if (next === previousPinned) return;

      previousPositions.current = mobile ? readDockPositions(links.current) : null;
      const focused = document.activeElement;
      moveFocus.current = Boolean(focused?.matches(':focus-visible') && (next
        ? links.current?.querySelector('[aria-current="page"]') === focused
        : slot.contains(focused)));
      previousPinned = next;
      // Commit the transfer and its animation before the browser paints this boundary.
      flushSync(() => setPlacement(mobile ? {slot, pinned: next} : null));
    };
    const schedule = () => {
      if (!frame && (media.matches || previousPinned)) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measureInset = true;
      schedule();
    };
    const resize = new ResizeObserver(onResize);
    resize.observe(header);
    resize.observe(document.body);
    media.addEventListener('change', onResize);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', onResize);
    window.addEventListener('pageshow', onResize);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      media.removeEventListener('change', onResize);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pageshow', onResize);
    };
  }, [dockRef]);

  useEffect(() => {
    const animations = running.current;
    return () => animations.forEach(animation => animation.cancel());
  }, []);

  useLayoutEffect(() => {
    const rail = links.current;
    const current = rail?.querySelector<HTMLAnchorElement>('a[aria-current="page"]');
    if (!pinned && rail && current && rail.scrollWidth > rail.clientWidth) {
      const railBox = rail.getBoundingClientRect();
      const tab = current.getBoundingClientRect();
      const width = Math.max(tab.width, current.scrollWidth);
      if (tab.left < railBox.left || tab.left + width > railBox.right) {
        rail.scrollLeft += tab.left - railBox.left - (rail.clientWidth - width) / 2;
      }
    }
    if (moveFocus.current) {
      moveFocus.current = false;
      const target = pinned ? placement?.slot.querySelector('button') : current ?? rail?.querySelector('a');
      target?.focus({preventScroll: true});
    }

    const before = previousPositions.current;
    previousPositions.current = null;
    const entering = pinned && !wasPinned.current;
    wasPinned.current = pinned;
    running.current.forEach(animation => animation.cancel());
    running.current.clear();
    if (!before) return;
    const move = (element: HTMLElement, from: Keyframe, to: Keyframe) => {
      const animation = element.animate([from, to], dockTiming);
      const animations = running.current;
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };
    const shifts = [...before.positions].flatMap(([link, original]) => {
      const next = link.getBoundingClientRect();
      const delta = original.left - next.left;
      return next.width && Math.abs(delta) > 1 ? [{link, delta}] : [];
    });
    const button = entering ? placement?.slot.querySelector('button') : undefined;
    const end = button?.getBoundingClientRect();
    for (const {link, delta} of shifts) {
      move(link, {transform: `translateX(${delta}px)`}, {transform: 'none'});
    }
    if (!pinned && current && !before.positions.has(current)) {
      move(current, {transform: 'translateY(-6px)', opacity: .3}, {transform: 'none', opacity: 1});
    }
    if (button && end) {
      const start = before.source;
      // Keep the trajectory within the middle of the toolbar when the source is near an edge.
      const dx = start ? Math.max(-56, Math.min(56, start.left + (start.width - end.width) / 2 - end.left)) : 0;
      const dy = start ? Math.min(66, start.top + (start.height - end.height) / 2 - end.top) : 24;
      move(button, {transform: `translate(${dx}px,${Math.max(14, dy)}px) scale(.92)`, opacity: .15},
        {transform: 'none', opacity: 1});
    }
  }, [activeLabel, pinned, placement]);

  function backToProducts() {
    const dock = dockRef.current;
    if (!dock) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top: catalogDockStart(dock), behavior: reduced ? 'instant' : 'smooth'});
  }

  return <>
    <span ref={startRef} className={styles.dockStart} aria-hidden="true"/>
    <div ref={dockRef} id={id} className={styles.dock} data-current-docked={pinned || undefined}>
      <nav ref={links} className={styles.links} aria-label={navLabel} onClickCapture={event => {
        if (pinned && event.target instanceof Element && event.target.closest('a:not([aria-current="page"])')) {
          previousPositions.current = readDockPositions(links.current);
        }
      }}>{children}</nav>
      {actions}
    </div>
    {placement && createPortal(
      <button type="button" className="mobile-current-category" data-docked={pinned || undefined}
        inert={!pinned} aria-current={pinned ? 'page' : undefined} onClick={backToProducts}
        aria-label={`${activeLabel}. Volver al inicio de los productos`}>
        <span key={activeLabel}>{activeLabel}</span>
        <ArrowUp size={13} aria-hidden="true"/>
      </button>,
      placement.slot,
    )}
  </>;
}
