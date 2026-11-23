export const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export function smooth(start: number, end: number, value: number) {
  const progress = clampProgress((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}

export function readSceneProgress(root: HTMLElement, visibleHeight: number, pinnedTop: number, travel: number, closing: boolean) {
  const offset = pinnedTop - root.getBoundingClientRect().top;
  return clampProgress(closing ? (visibleHeight + offset) / (visibleHeight + travel) : offset / travel);
}

export function fiberTiming(progress: number, closing: boolean) {
  return closing
    ? {wordOut:0, wordIn:smooth(.2,.75,progress), figureOut:0, figureIn:smooth(.35,.98,progress), titleIn:0, ghost:0, dark:0}
    : {wordOut:smooth(.07,.46,progress), wordIn:1, figureOut:smooth(.03,.50,progress), figureIn:1,
      titleIn:smooth(.28,.80,progress), ghost:.16*smooth(.1,.22,progress)*(1-smooth(.36,.56,progress)),
      dark:.8*smooth(.18,.62,progress)};
}

export function sceneCopy(root: HTMLElement, closing: boolean) {
  const opening = root.querySelectorAll<HTMLElement>('.niebla-opening');
  const endingLink = root.querySelector<HTMLAnchorElement>('.niebla-end');
  let previous = -1;

  return {
    update(progress: number) {
      if (progress === previous) return;
      previous = progress;
      const open = 1-smooth(0,.07,progress);
      const end = closing ? smooth(.72,.90,progress) : smooth(.88,1,progress);
      root.style.setProperty('--opening',String(open));
      root.style.setProperty('--ending',String(end));
      opening.forEach(el => { el.inert = open < .1; });
      if (endingLink) endingLink.inert = end < .1;
      root.toggleAttribute('data-ending',end >= .1);
    },
    reset() {
      root.removeAttribute('data-ending');
      root.style.removeProperty('--opening');
      root.style.removeProperty('--ending');
      opening.forEach(el => { el.inert = false; });
      if (endingLink) endingLink.inert = false;
    },
  };
}

export function drawLettering(context: CanvasRenderingContext2D, frame: DOMRect, elements: NodeListOf<HTMLElement>, color: (element: HTMLElement) => string) {
  context.textBaseline = 'alphabetic';
  elements.forEach(element => {
    const bounds = element.getBoundingClientRect();
    const baseline = element.nextElementSibling!.getBoundingClientRect().top - frame.top;
    const style = getComputedStyle(element);
    const label = element.textContent ?? '';
    context.font = '800 '+style.fontSize+' NieblaArchivo';
    context.fillStyle = color(element);
    context.save();
    context.translate(bounds.left - frame.left, baseline);
    context.scale(bounds.width / Math.max(1,context.measureText(label).width),1);
    context.fillText(label,0,0);
    context.restore();
  });
}
