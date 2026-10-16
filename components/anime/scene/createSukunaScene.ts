import * as THREE from 'three';
import {GLTFLoader,type GLTF} from 'three/addons/loaders/GLTFLoader.js';
import {animeHeroPose,heroFlight,smoothStep} from '@/lib/anime-hero-motion';
/** Model: Sukuna by Wing, CC BY 4.0. See public/anime/hero/CREDITS.txt. */
export async function createSukunaScene(preloaded?:GLTF){
 const model=preloaded||await new GLTFLoader().loadAsync('/anime/hero/sukuna.glb');
 const scene=new THREE.Scene(),character=new THREE.Group();character.name='Sukuna / Jujutsu Kaisen';scene.add(character);character.add(model.scene);
 const box=new THREE.Box3().setFromObject(model.scene),height=box.max.y-box.min.y,scale=3.08/height;
 model.scene.scale.multiplyScalar(scale);model.scene.position.set(-(box.min.x+box.max.x)*.5*scale,-box.min.y*scale,-(box.min.z+box.max.z)*.5*scale);
 const materials=new Set<THREE.Material>(),geometries=new Set<THREE.BufferGeometry>(),textures=new Set<THREE.Texture>();
 model.scene.traverse(node=>{if(node instanceof THREE.Mesh){node.frustumCulled=false;geometries.add(node.geometry);for(const material of Array.isArray(node.material)?node.material:[node.material]){materials.add(material);for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);if(material.name==='damage')node.visible=false;if(material instanceof THREE.MeshStandardMaterial){material.metalness=0;material.roughness=.86;material.envMapIntensity=.3;}}}});
 const bone=(name:string)=>{const node=model.scene.getObjectByName(name);if(!node)throw new Error(`Missing model bone: ${name}`);return node;};
 const spine=bone('chest_132'),head=bone('head_76');
 const forward=[bone('R_arm_125'),bone('R_elbow_123'),bone('R_hand_120')] as const,draw=[bone('L_arm_101'),bone('L_elbow_99'),bone('L_hand_96')] as const;
 const waist=bone('waist_134'),middleSpine=bone('spine_133');
 const leftLeg=[bone('L_leg_140'),bone('L_knee_139'),bone('L_ankle_136')] as const,rightLeg=[bone('R_leg_147'),bone('R_knee_146'),bone('R_ankle_143')] as const;
 const controlled=[waist,middleSpine,spine,head,...forward,...draw,...leftLeg,...rightLeg],rest=new Map(controlled.map(node=>[node,node.quaternion.clone()]));
 scene.updateMatrixWorld(true);const footRest=new Map([leftLeg[2],rightLeg[2]].map(node=>[node,node.getWorldQuaternion(new THREE.Quaternion())]));
 let pointerX=0,pointerY=0;
 const delta=new THREE.Quaternion(),parentQ=new THREE.Quaternion(),worldQ=new THREE.Quaternion(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 function aim(node:THREE.Object3D,from:THREE.Vector3,to:THREE.Vector3){
  if(from.lengthSq()<1e-12||to.lengthSq()<1e-12)return;
  delta.setFromUnitVectors(from.normalize(),to.normalize());node.getWorldQuaternion(worldQ);node.parent!.getWorldQuaternion(parentQ);node.quaternion.copy(parentQ.invert().multiply(delta).multiply(worldQ));node.updateWorldMatrix(false,true);
 }
 function solve(chain:readonly THREE.Object3D[],target:THREE.Vector3,pole:THREE.Vector3){
  const [upper,elbow,hand]=chain;upper.getWorldPosition(a);elbow.getWorldPosition(b);hand.getWorldPosition(c);
  const first=a.distanceTo(b),second=b.distanceTo(c),direction=target.clone().sub(a),distance=Math.min(first+second-.003,Math.max(.01,direction.length()));direction.normalize();
  const side=pole.clone().sub(a).addScaledVector(direction,-pole.clone().sub(a).dot(direction)).normalize();
  const cosine=THREE.MathUtils.clamp((first*first+distance*distance-second*second)/(2*first*distance),-1,1),sine=Math.sqrt(Math.max(0,1-cosine*cosine));
  const middle=a.clone().addScaledVector(direction,first*cosine).addScaledVector(side,first*sine),end=a.clone().addScaledVector(direction,distance);
  aim(upper,b.clone().sub(a),middle.clone().sub(a));elbow.getWorldPosition(b);hand.getWorldPosition(c);aim(elbow,c.clone().sub(b),end.sub(b));
 }
 const hot=new THREE.MeshBasicMaterial({color:0xfff1ce}),orange=new THREE.MeshBasicMaterial({color:0xff751c,transparent:true,opacity:.84,blending:THREE.AdditiveBlending,depthWrite:false}),gold=new THREE.MeshBasicMaterial({color:0xffc46b,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending});[hot,orange,gold].forEach(m=>materials.add(m));
 const mesh=(parent:THREE.Object3D,geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0)=>{const node=new THREE.Mesh(geometry,material);node.position.set(x,y,z);parent.add(node);geometries.add(geometry);return node;};
 const arrow=new THREE.Group();scene.add(arrow);arrow.name='Reversible fire arrow';
 mesh(arrow,new THREE.CylinderGeometry(.014,.018,1.78,8),hot,-.65,0,0).rotation.z=Math.PI/2;
 mesh(arrow,new THREE.CylinderGeometry(.035,.04,1.78,8),orange,-.65,0,0).rotation.z=Math.PI/2;
 const tip=mesh(arrow,new THREE.ConeGeometry(.075,.34,24),hot,-1.64,0,0);tip.rotation.z=Math.PI/2;
 const aura=mesh(arrow,new THREE.ConeGeometry(.13,.54,24),orange,-1.53,0,0);aura.rotation.z=Math.PI/2;
 const flames=new THREE.Group();arrow.add(flames);
 for(let i=0;i<5;i++){const points=Array.from({length:13},(_,j)=>{const t=j/12,phase=t*8+i*1.26;return new THREE.Vector3(-1.65+t*1.9,Math.sin(phase)*(.025+t*.08),Math.cos(phase)*(.025+t*.08));});mesh(flames,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,.012+i*.002,5,false),i%2?orange:gold);}
 const particleGeometry=new THREE.SphereGeometry(.022,6,4);geometries.add(particleGeometry);
 const particles=new THREE.InstancedMesh(particleGeometry,gold,72);particles.frustumCulled=false;arrow.add(particles);const dummy=new THREE.Object3D();
 const energyLight=new THREE.PointLight(0xff8a37,2.7,4,2);scene.add(energyLight);
 const haloMaterial=new THREE.MeshBasicMaterial({color:0xccff00,transparent:true,opacity:.18,depthWrite:false});materials.add(haloMaterial);
 const halo=mesh(scene,new THREE.TorusGeometry(1.14,.008,4,96,Math.PI*1.72),haloMaterial,0,1.9,-.65);halo.rotation.set(.08,-.3,.2);
 const hemisphere=new THREE.HemisphereLight(0xf4f4ff,0x243522,2.1);scene.add(hemisphere);
 const key=new THREE.DirectionalLight(0xfff3e7,2.4);key.position.set(3,4,6);scene.add(key);
 const rim=new THREE.DirectionalLight(0xccff00,2.0);rim.position.set(-3,3,-3);scene.add(rim);
 const fill=new THREE.DirectionalLight(0xa6bde2,1);fill.position.set(-3,1,4);scene.add(fill);
 const camera=new THREE.PerspectiveCamera(33,1,.1,50);camera.position.set(2.1,2.05,6.4);camera.lookAt(-.25,1.62,0);
 const update=(progress:number)=>{
  const pose=animeHeroPose(progress),flight=heroFlight(progress);controlled.forEach(node=>node.quaternion.copy(rest.get(node)!));
  character.position.set(0,-pose.crouch,0);character.rotation.y=-.1+pose.turn;
  waist.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,pose.turn*.12,pose.lean*.3)));
  middleSpine.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,pose.turn*.15,pose.lean*.3)));
  spine.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,pose.turn*.22,pose.lean)));head.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-pointerY*.045,-.08+pointerX*.08,-pose.lean*.3)));scene.updateMatrixWorld(true);
  solve(forward,new THREE.Vector3(...pose.forward),new THREE.Vector3(-.8,1.65,1.1));solve(draw,new THREE.Vector3(...pose.draw),new THREE.Vector3(.8,1.8,1.0));scene.updateMatrixWorld(true);
  solve(leftLeg,new THREE.Vector3(.163+pose.stance,.168,.08),new THREE.Vector3(.5,.85,1));solve(rightLeg,new THREE.Vector3(-.163-pose.stance,.168,-.14),new THREE.Vector3(-.5,.85,1));
  for(const ankle of [leftLeg[2],rightLeg[2]]){ankle.parent!.getWorldQuaternion(parentQ);const facing=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),character.rotation.y*.4).multiply(footRest.get(ankle)!);ankle.quaternion.copy(parentQ.invert().multiply(facing));ankle.updateWorldMatrix(false,true);}
  arrow.visible=progress>.12&&progress<.73;
  arrow.position.set(.3+flight.x,2.27+flight.y,.63+flight.z);arrow.rotation.set(0,0,-.02-flight.t*.12);arrow.scale.setScalar(.8+.2*smoothStep(progress/.35));
  const intensity=flight.released?Math.max(.3,1-flight.t*.5):pose.energy;
  for(let i=0;i<72;i++){const t=i/71,angle=i*2.399+progress*6.5,radius=(.03+Math.sin(i*4.6)**2*.11)*intensity;dummy.position.set(-1.58+t*2.05,Math.sin(angle)*radius,Math.cos(angle)*radius);dummy.scale.setScalar((.4+Math.sin(i*3.3)**2*.8)*intensity);dummy.rotation.set(angle,i*.7,progress*3);dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);}
  flames.rotation.x=progress*2.4;particles.instanceMatrix.needsUpdate=true;gold.opacity=.3+intensity*.45;orange.opacity=.45+intensity*.4;energyLight.position.copy(arrow.position);energyLight.intensity=1.2+intensity*2;halo.rotation.z=.2-progress*.18;
  camera.position.fromArray(pose.camera);camera.position.x+=pointerX*.14;camera.position.y+=pointerY*.08;camera.lookAt(-.12+pointerX*.025,1.62,0);
  scene.updateMatrixWorld(true);model.scene.traverse(node=>{if(node instanceof THREE.SkinnedMesh)node.skeleton.update();});
 };
 update(0);
 return {scene,camera,character,arrow,spear:arrow,update,setPointer:(x:number,y:number)=>{pointerX=THREE.MathUtils.clamp(x,-1,1);pointerY=THREE.MathUtils.clamp(y,-1,1);},setTheme:(light:boolean)=>{hemisphere.intensity=light?2.55:2.1;rim.intensity=light?1.2:2;},dispose:()=>{textures.forEach(texture=>{const image=texture.source.data as {close?:()=>void}|undefined;image?.close?.();texture.dispose();});geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());}};
}
