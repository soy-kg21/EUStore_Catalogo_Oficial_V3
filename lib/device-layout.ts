type DisplayMetrics={width:number;height:number;screenWidth:number;screenHeight:number;touchPoints:number;coarse:boolean};

/** Distinguish a phone's requested desktop viewport from a tablet or a touch PC. */
export function deviceLayout(metrics:DisplayMetrics){
 const {width,height,screenWidth,screenHeight,touchPoints,coarse}=metrics;
 const phoneDesktop=touchPoints>0&&coarse&&Math.min(screenWidth,screenHeight)<=600&&width>=900&&width>screenWidth*1.15;
 const scale=Math.max(1,Math.min(2.5,width/1920,height/1080));
 return {phoneDesktop,scale};
}

/** Runs before first paint; all geometry remains in CSS pixels, without page zoom. */
function installDeviceLayout(resolve:typeof deviceLayout){
 const root=document.documentElement;
 const update=()=>{
  const layout=resolve({width:window.innerWidth,height:window.innerHeight,screenWidth:window.screen.width,screenHeight:window.screen.height,touchPoints:navigator.maxTouchPoints||0,coarse:window.matchMedia('(pointer:coarse)').matches});
  root.dataset.phoneDesktop=String(layout.phoneDesktop);
  root.style.setProperty('--eu-ui-scale',layout.scale.toFixed(4));
  window.dispatchEvent(new Event('eu-display-change'));
 };
 update();
 window.addEventListener('resize',update,{passive:true});
 window.addEventListener('orientationchange',update,{passive:true});
}

export const DEVICE_LAYOUT_SCRIPT=`(${installDeviceLayout.toString()})(${deviceLayout.toString()})`;
