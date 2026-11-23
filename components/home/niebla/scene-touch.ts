export function trackSceneTouch(
  element:HTMLElement,
  signal:AbortSignal,
  onTouch:(point:Touch)=>void,
) {
  const read = (event:TouchEvent) => {
    if (event.touches.length === 1) onTouch(event.touches[0]);
  };
  element.addEventListener('touchstart',read,{passive:true,signal});
  element.addEventListener('touchmove',read,{passive:true,signal});
}
