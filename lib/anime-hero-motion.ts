/** Deterministic full-body choreography. Seeking backwards restores the same pose. */
export const HERO_RELEASE=.42;
export const clamp01=(value:number)=>Math.max(0,Math.min(1,value));
export const smoothStep=(value:number)=>{const t=clamp01(value);return t*t*(3-2*t);};
type Point=[number,number,number];
export type AnimeHeroPose={forward:Point;draw:Point;turn:number;lean:number;energy:number;crouch:number;stance:number;camera:Point};
const frames:{at:number;pose:AnimeHeroPose}[]=[
 {at:0,pose:{forward:[-.48,1.4,.2],draw:[.43,1.4,.2],turn:.25,lean:.02,energy:0,crouch:0,stance:.05,camera:[2.4,1.8,6.6]}},
 {at:.13,pose:{forward:[-.7,2.05,.4],draw:[.5,2.1,.5],turn:-.14,lean:-.02,energy:.3,crouch:.10,stance:.19,camera:[1.6,2,6.1]}},
 {at:.28,pose:{forward:[-1,2.32,.5],draw:[.55,2.43,.6],turn:-.35,lean:.08,energy:.8,crouch:.18,stance:.35,camera:[.8,2.1,5.8]}},
 {at:.38,pose:{forward:[-1.1,2.35,.6],draw:[.65,2.5,.6],turn:-.42,lean:.1,energy:1,crouch:.22,stance:.4,camera:[1.1,2.15,5.9]}},
 {at:HERO_RELEASE,pose:{forward:[-1.14,2.3,.6],draw:[-.17,2.38,.72],turn:.13,lean:-.08,energy:1,crouch:.14,stance:.4,camera:[1.8,2.08,6.6]}},
 {at:.58,pose:{forward:[-.92,2.16,.4],draw:[.25,1.7,.38],turn:.28,lean:-.05,energy:.6,crouch:.06,stance:.24,camera:[2.35,2.12,6.9]}},
 {at:.76,pose:{forward:[-.5,1.45,.3],draw:[.5,1.4,.3],turn:.18,lean:0,energy:.15,crouch:0,stance:.1,camera:[2.1,2,6.6]}},
 {at:1,pose:{forward:[-.48,1.4,.2],draw:[.43,1.4,.2],turn:.2,lean:.01,energy:0,crouch:0,stance:.05,camera:[2.2,1.9,6.6]}}
];
export function animeHeroPose(progress:number):AnimeHeroPose{
 const p=clamp01(progress),next=frames.findIndex(frame=>frame.at>=p);if(next<=0)return structuredClone(frames[0].pose);
 const a=frames[next-1],b=frames[next],t=smoothStep((p-a.at)/(b.at-a.at));
 const point=(from:Point,to:Point)=>from.map((value,i)=>value+(to[i]-value)*t) as Point;
 const value=(key:'turn'|'lean'|'energy'|'crouch'|'stance')=>a.pose[key]+(b.pose[key]-a.pose[key])*t;
 return {forward:point(a.pose.forward,b.pose.forward),draw:point(a.pose.draw,b.pose.draw),camera:point(a.pose.camera,b.pose.camera),turn:value('turn'),lean:value('lean'),energy:value('energy'),crouch:value('crouch'),stance:value('stance')};
}
export function heroFlight(progress:number){const t=clamp01((progress-HERO_RELEASE)/.27);return {released:progress>=HERO_RELEASE,t,x:-5.2*t,y:.55*t-.15*t*t,z:.15*t};}
