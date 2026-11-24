export const VS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const NOISE = `
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+3.7;a*=.5;}return s;}
float fbm4(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+3.7;a*=.5;}return s;}`;
export const FOG_FS = `
varying vec2 vUv;
uniform sampler2D tField;
uniform float uTime,uAspect,uIntroR,uFront,uBack;
${NOISE}
void main(){
  vec2 uv=vUv;
  vec3 f=texture2D(tField,uv).rgb;
  vec2 vel=(f.rg-.5)*2.; float hole=f.b;
  vec2 p=vec2(uv.x*uAspect,uv.y); float t=uTime;
  vec2 pb=p*1.25-vel*.16+vec2(t*.014,0.);
  float fb=fbm4(pb+.7*vec2(fbm4(pb*1.4+vec2(0.,t*.02)),fbm4(pb*1.4+vec2(4.1,2.3))));
  vec2 pf=p*1.9-vel*.45+vec2(t*.04,t*.008);
  vec2 q=vec2(fbm(pf+vec2(0.,t*.06)),fbm(pf+vec2(5.2,1.3)-t*.045));
  float ff=fbm(pf+1.8*q);
  float hm=(1.-smoothstep(0.,.6,uv.y));
  float front=smoothstep(.38,.86,ff)*(hm*1.05+.08)*(1.-hole*.92)*uFront;
  float back=smoothstep(.32,.92,fb)*(1.-hole*.5)*uBack;
  float rr=length((uv-vec2(.5,.52))*vec2(uAspect,1.));
  float intro=smoothstep(uIntroR-.12,uIntroR+.3,rr+(ff-.5)*.6);
  gl_FragColor=vec4(back,front,intro,ff);
}`;
export const COMP_FS = `
varying vec2 vUv;
uniform sampler2D tBg,tFog,tText,tFig;
uniform vec2 uRes,uBgScale,uMouse;
uniform vec4 uFig;
uniform vec3 uWordCh;
uniform float uLight,uTouch; uniform float uDpr,uAspect,uBgZoom,uFigLod,uWordOut,uWordIn,uHeadIn,uFigOut,uFigIn,uFray,uDark,uFigA,uGhost;
float h1(float n){return fract(sin(n)*43758.5453123);}
float vn1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h1(i),h1(i+1.),f);}
// Hilos: cada columna de 1,6 px cae (salida) o llega desde arriba (entrada) con un retardo por ruido.
vec3 fib(float c,float seed,float outA,float inA){
  float r=h1(c*.7548+seed*13.17);
  float n=vn1(c*.021+seed*41.3);
  float d=clamp(.62*n+.38*r,0.,1.);
  float lo=smoothstep(d*.6,d*.6+.4,outA);
  float li=smoothstep(d*.6,d*.6+.4,inA);
  float disp=lo*lo*1.25-(1.-li)*(1.-li)*.95;
  float trail=.028*(lo+(1.-li))*(.6+.8*r);
  float a=(1.-smoothstep(.55,1.,lo))*smoothstep(0.,.3,li);
  return vec3(disp,trail,a);
}
float word(vec2 p){return dot(textureLod(tText,p,0.).rgb,uWordCh);}
float head(vec2 p){return textureLod(tText,p,0.).g;}
vec4 fig(vec2 p){
  vec2 q=(p-uFig.xy)/uFig.zw;
  float m=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);
  vec4 t=textureLod(tFig,clamp(q,0.,1.),uFigLod);
  t.rgb*=t.a; return t*m;
}
void main(){
  vec2 uv=vUv;
  vec4 fg=texture2D(tFog,uv);
  vec2 buv=(uv-.5)*uBgScale/uBgZoom+.5-(uMouse-.5)*(.012+.035*uTouch);
  vec3 col=texture2D(tBg,buv).rgb;
  float l=dot(col,vec3(.299,.587,.114));
  col=pow(mix(vec3(l),col,.12),vec3(1.18))*.78;
  float glow=exp(-pow(length((uv-vec2(.5,.63))*vec2(uAspect,1.25))/.5,2.));
  col=mix(col,mix(vec3(.10,.105,.11),vec3(.40,.41,.43),glow*.9+fg.a*.25),fg.r*.8);
  col+=vec3(.10,.104,.11)*glow*(1.-uDark);
  col=mix(col,vec3(.65,.66,.63),uLight*.22); col=mix(col,mix(vec3(.035,.036,.038),vec3(.18,.19,.17),uLight),uDark);
  float c=floor(gl_FragCoord.x/(1.6*uDpr));
  float rc=h1(c*.311+7.);
  vec2 dm=(uv-uMouse)*vec2(uAspect,1.);
  float fr=uFray*exp(-dm.x*dm.x*260.)*exp(-dm.y*dm.y*14.);
  float frD=fr*(.012+.05*rc*rc), frT=fr*.012*rc;
  // Sobre la figura las columnas son más cortas (gaussiana vertical más estrecha) y caen menos
  float frF=uFray*exp(-dm.x*dm.x*260.)*exp(-dm.y*dm.y*48.);
  float frFD=frF*(.008+.026*rc*rc), frFT=frF*.007*rc;
  // Wordmark (canal R en la escena, B en el cierre)
  vec3 fw=fib(c,1.,uWordOut,uWordIn);
  float aw=0.,ws=0.;
  for(int k=0;k<5;k++){float fk=float(k),w=1.-fk*.16;aw+=word(vec2(uv.x,uv.y+fw.x+frD-fk*(fw.y+frT)))*w;ws+=w;}
  aw=aw/ws*fw.z;
  // Bloom del wordmark: dos niveles de mipmap del mismo lienzo de texto
  float hl=dot(textureLod(tText,uv,5.).rgb,uWordCh)*.6+dot(textureLod(tText,uv,6.5).rgb,uWordCh)*.4;
  col+=vec3(.95)*hl*.22*(1.-uWordOut)*uWordIn;
  col=mix(col,vec3(.93,.93,.92),clamp(aw*.92,0.,1.));
  // Wordmark fantasma: queda un eco tenue mientras los hilos caen, para que nunca haya un fotograma vacío
  col=mix(col,vec3(.62,.63,.64),word(uv)*uGhost);
  // Titular (canal G)
  vec3 fh=fib(c,2.,0.,uHeadIn);
  float ah=0.;ws=0.;
  for(int k=0;k<5;k++){float fk=float(k),w=1.-fk*.16;ah+=head(vec2(uv.x,uv.y+fh.x-fk*fh.y))*w;ws+=w;}
  col=mix(col,vec3(.93,.93,.92),clamp(ah/ws*fh.z,0.,1.));
  // Figura
  vec3 ff=fib(c,3.,uFigOut,uFigIn);
  vec4 fa=vec4(0.);ws=0.;
  for(int k=0;k<5;k++){float fk=float(k),w=1.-fk*.16;fa+=fig(vec2(uv.x,uv.y+ff.x+frFD-fk*(ff.y+frFT)))*w;ws+=w;}
  fa=fa/ws*ff.z*uFigA;
  float mv=clamp((ff.y+frFT)*30.,0.,1.);
  fa.rgb=mix(fa.rgb,vec3(.55+.35*rc)*fa.a,mv*.45);
  col=fa.rgb+col*(1.-fa.a);
  // Niebla delantera e intro
  col=mix(col,mix(vec3(.12,.125,.13),vec3(.47,.48,.5),fg.a*.75+glow*.15),fg.g*.85);
  col=mix(col,mix(vec3(.2,.205,.21),vec3(.58,.59,.61),fg.a),fg.b);
  // Acabado: viñeta, curva y negros profundos
  float v=length((uv-.5)*vec2(uAspect*.75,1.));
  col*=1.-.6*smoothstep(.4,1.1,v);
  col=mix(col,col*col*(3.-2.*col),.35);
  gl_FragColor=vec4(max(col-.01,0.),1.);
}`;
export const FAB_FS = `
varying vec2 vUv;
uniform sampler2D tFab;
uniform vec2 uRes,uFabScale,uLens,uMouse;
uniform float uDpr,uAspect,uLensR,uZoom,uProg;
void main(){
  vec2 uv=vUv;
  float z=1.14-.1*uProg;
  vec2 par=(uMouse-.5)*.012;
  vec2 fuv=(uv-.5)*uFabScale/z+.5-par;
  vec2 lc=(uLens-.5)*uFabScale/z+.5-par;
  vec2 dpx=(uv-uLens)*uRes;
  float pixelDistance=length(dpx);
  float R=uLensR*uDpr, r=pixelDistance/R;
  vec3 col=texture2D(tFab,fuv).rgb*.72;
  if(r<1.){
    float e=smoothstep(.5,1.,r);
    vec2 dir=dpx/max(pixelDistance,1.);
    vec2 luv=lc+(fuv-lc)/uZoom*(1.+.4*e*e);
    vec2 off=dir*uFabScale*e*e*.007;
    vec3 lcol=vec3(texture2D(tFab,luv+off).r,texture2D(tFab,luv).g,texture2D(tFab,luv-off).b)*1.08;
    lcol*=1.-.28*e*e;
    lcol+=vec3(.5)*smoothstep(.93,.985,r)*(1.-smoothstep(.985,1.,r))*.55;
    vec2 sp=dpx/R-vec2(-.42,.46); lcol+=vec3(.16)*exp(-dot(sp,sp)*9.);
    col=mix(col,lcol,1.-smoothstep(.992,1.,r));
  } else if(r<1.32) {
    col*=1.-.4*(1.-smoothstep(1.,1.32,r));
  }
  float v=length((uv-.5)*vec2(uAspect*.75,1.));
  col*=1.-.55*smoothstep(.45,1.1,v);
  gl_FragColor=vec4(max(col-.008,0.),1.);
}`;
