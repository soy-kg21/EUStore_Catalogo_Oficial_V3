'use client';

import {useEffect} from 'react';

const nativeCursor = 'input:not([type="button"],[type="submit"],[type="reset"],[type="checkbox"],[type="radio"]),textarea,select,[contenteditable]:not([contenteditable="false"])';
const action = 'a[href],button,[role="button"],[role="link"],[role="tab"],summary,label[for],input:is([type="button"],[type="submit"],[type="reset"],[type="checkbox"],[type="radio"])';

function mountCursor(signal: AbortSignal) {
  const root = document.documentElement;
  const ring = document.createElement('div');
  ring.className = 'eu-cursor';
  ring.hidden = true;
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);

  let x = 0, y = 0, targetX = 0, targetY = 0;
  let frame = 0, hitFrame = 0;
  function hide() {
    ring.hidden = true;
    root.classList.remove('eu-ring-on');
    cancelAnimationFrame(frame);
    cancelAnimationFrame(hitFrame);
    frame = hitFrame = 0;
  }
  function paint() {
    ring.style.transform = `translate3d(${x}px,${y}px,0)`;
  }
  function move() {
    frame = 0;
    x += (targetX - x) * .25;
    y += (targetY - y) * .25;
    paint();
    if (Math.abs(x - targetX) + Math.abs(y - targetY) > .25) frame = requestAnimationFrame(move);
  }
  function updateTarget(target: EventTarget | null) {
    if (!(target instanceof Element) || target.closest(nativeCursor)) {
      hide();
      return false;
    }
    ring.toggleAttribute('data-action', Boolean(target.closest(action)));
    return true;
  }
  function follow(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return hide();
    if (!updateTarget(event.target)) return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (ring.hidden) {
      x = targetX;
      y = targetY;
      paint();
      ring.hidden = false;
      root.classList.add('eu-ring-on');
    } else if (!frame) {
      frame = requestAnimationFrame(move);
    }
  }
  const passive = {passive: true, signal};
  document.addEventListener('pointermove', follow, passive);
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') hide();
  }, passive);
  document.addEventListener('pointerout', event => {
    if (!event.relatedTarget) hide();
  }, passive);
  document.addEventListener('scroll', () => {
    if (ring.hidden || hitFrame) return;
    hitFrame = requestAnimationFrame(() => {
      hitFrame = 0;
      updateTarget(document.elementFromPoint(targetX, targetY));
    });
  }, {...passive, capture: true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') hide();
  }, {signal});
  document.addEventListener('visibilitychange', hide, {signal});
  window.addEventListener('blur', hide, {signal});
  signal.addEventListener('abort', () => {
    hide();
    ring.remove();
  }, {once: true});
}

export default function StoreCursor() {
  useEffect(() => {
    const media = matchMedia('(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)');
    let controller: AbortController | undefined;
    function sync() {
      controller?.abort();
      if (!media.matches) return;
      controller = new AbortController();
      mountCursor(controller.signal);
    }
    sync();
    media.addEventListener('change', sync);
    return () => {
      media.removeEventListener('change', sync);
      controller?.abort();
    };
  }, []);
  return null;
}
