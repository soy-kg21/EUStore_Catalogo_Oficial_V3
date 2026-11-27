'use client';

import {useSyncExternalStore, type ReactNode, type RefObject} from 'react';
import {X} from 'lucide-react';
import {Popover, PopoverAnchor, PopoverContent} from '@/components/ui/popover';
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet';
import {catalogMobileQuery} from './CatalogDock';
import styles from './catalog-filter.module.css';

function subscribeToMobile(change: () => void) {
  const media = matchMedia(catalogMobileQuery);
  media.addEventListener('change', change);
  return () => media.removeEventListener('change', change);
}

function fitSheet(panel: HTMLDivElement | null) {
  if (!panel) return;
  const viewport = window.visualViewport;
  const update = () => {
    const height = viewport?.height ?? window.innerHeight;
    const bottom = Math.max(0, window.innerHeight - (height + (viewport?.offsetTop ?? 0)));
    panel.style.setProperty('--filter-height', height + 'px');
    panel.style.setProperty('--filter-bottom', bottom + 'px');
    panel.toggleAttribute('data-short-viewport', height < 235);
  };
  update();
  viewport?.addEventListener('resize', update);
  viewport?.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  return () => {
    viewport?.removeEventListener('resize', update);
    viewport?.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
}

export default function CatalogFilterPanel({open, onOpenChange, trigger, id, title, children}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  trigger: RefObject<HTMLButtonElement | null>;
  id: string;
  title: string;
  children: (mobile: boolean) => ReactNode;
}) {
  const mobile = useSyncExternalStore(subscribeToMobile, () => matchMedia(catalogMobileQuery).matches, () => false);
  const close = <button type="button" className={styles.close} aria-label="Cerrar filtros"
    onClick={() => onOpenChange(false)}><X size={20} aria-hidden="true"/></button>;
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    trigger.current?.focus({preventScroll: true});
  };

  if (mobile) {
    return <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent id={id} side="bottom" ref={fitSheet} showCloseButton={false} className={styles.sheet}
        aria-describedby={undefined} onCloseAutoFocus={restoreFocus}>
        <div className={styles.heading}><SheetTitle>{title}</SheetTitle>{close}</div>
        {children(true)}
      </SheetContent>
    </Sheet>;
  }

  return <Popover open={open} onOpenChange={onOpenChange}>
    <PopoverAnchor virtualRef={trigger}/>
    <PopoverContent id={id} className={styles.popover} aria-labelledby={id + '-title'} align="end"
      sideOffset={10} collisionPadding={12} onCloseAutoFocus={restoreFocus}
      onInteractOutside={event => {
        if (event.target instanceof Node && trigger.current?.contains(event.target)) event.preventDefault();
      }}>
      <div className={styles.heading}><h2 id={id + '-title'}>{title}</h2>{close}</div>
      {children(false)}
    </PopoverContent>
  </Popover>;
}
