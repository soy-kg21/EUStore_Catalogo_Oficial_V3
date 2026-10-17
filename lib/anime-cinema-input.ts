/** Two deliberate gestures at categories; a wheel burst or one touch is one gesture. */
export const CINEMA_GESTURE_PX=12*1.08;
export const CINEMA_WHEEL_IDLE_MS=220;
export function createCinemaGestureGate(){
 let serial=0,wheelId=0,wheelAt=-Infinity,wheelDirection=0;
 let boundaryId=-1,boundaryDirection=0,boundaryCount=0;
 return {
  start(){wheelAt=-Infinity;return ++serial;},
  wheel(direction:number,time:number){
   if(time-wheelAt>CINEMA_WHEEL_IDLE_MS||direction!==wheelDirection)wheelId=++serial;
   wheelAt=time;wheelDirection=direction;return wheelId;
  },
  arrive(id=-1){boundaryId=id;boundaryDirection=0;boundaryCount=0;},
  boundary(direction:number,id:number){
   if(id===boundaryId)return false;
   if(direction!==boundaryDirection){boundaryDirection=direction;boundaryCount=0;}
   boundaryId=id;boundaryCount++;
   if(boundaryCount<2)return false;
   boundaryCount=0;return true;
  }
 };
}
