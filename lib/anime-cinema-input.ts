/** Two deliberate gestures at categories; a wheel burst or one touch is one gesture. */
export const CINEMA_GESTURE_PX=48;
export const CINEMA_REVERSE_GESTURE_PX=96;
export const CINEMA_WHEEL_IDLE_MS=360;
const WHEEL_EFFORT_MS=180;
export function createCinemaGestureGate(){
 let serial=0,wheelId=0,wheelAt=-Infinity,wheelDirection=0;
 let effortAt=0,effortPeak=0,effortTravel=0;
 let boundaryId=-1,boundaryDirection=0,boundaryCount=0;
 return {
  start(){wheelAt=-Infinity;return ++serial;},
  wheel(direction:number,time:number,delta=0){
   const amount=Math.abs(delta),fresh=time-wheelAt>CINEMA_WHEEL_IDLE_MS||direction!==wheelDirection;
   if(fresh){wheelId=++serial;effortAt=time;effortPeak=amount;effortTravel=0;}
   else{
    // A decaying trackpad tail remains one gesture. Steady wheel turns can
    // express another deliberate effort without requiring an artificial pause.
    if(amount<effortPeak*.85){effortAt=time;effortPeak=amount;effortTravel=0;}
    effortPeak=Math.max(effortPeak,amount);effortTravel+=amount;
    const threshold=direction<0?CINEMA_REVERSE_GESTURE_PX:CINEMA_GESTURE_PX;
    if(time-effortAt>=WHEEL_EFFORT_MS&&effortTravel>=threshold*2){wheelId=++serial;effortAt=time;effortPeak=amount;effortTravel=0;}
   }
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
