import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {animeHeroPose,heroFlight,smoothStep,HERO_RELEASE} from '../lib/anime-hero-motion.ts';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
const data=fs.readFileSync('public/anime/hero/sukuna.glb'),gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
assert.equal(gltf.asset.extras.title,'Sukuna');assert(gltf.asset.extras.license.includes('CC-BY-4.0'));assert(data.length<3.2*1024*1024);
const source=stripTypeScriptTypes(fs.readFileSync('components/anime/scene/createSukunaScene.ts','utf8')).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'');
const {createSukunaScene}=new Function('THREE','GLTFLoader','animeHeroPose','heroFlight','smoothStep',source+'\nreturn {createSukunaScene};')(THREE,GLTFLoader,animeHeroPose,heroFlight,smoothStep),rig=await createSukunaScene(gltf);
let checks=0;
const snapshot=()=>{const values=[];rig.scene.traverse(node=>{assert(node.matrixWorld.elements.every(Number.isFinite),node.name);if(node.isBone)values.push(...node.matrixWorld.elements);});values.push(...rig.arrow.position.toArray(),...rig.camera.position.toArray());return values.map(v=>+v.toFixed(8));};
const poses=new Map();
for(const p of [0,.1,.25,.44,HERO_RELEASE,.61,.78,.9,1]){rig.update(p);poses.set(p,snapshot());checks++;}
for(const p of [1,.9,.78,.61,HERO_RELEASE,.44,.25,.1,0]){rig.update(p);assert.deepEqual(snapshot(),poses.get(p),'Reverse scroll must reproduce exactly the same skeleton and arrow');checks++;}
assert.notDeepEqual(poses.get(0),poses.get(.44));assert.equal(heroFlight(HERO_RELEASE-.0001).released,false);assert.equal(heroFlight(HERO_RELEASE).released,true);
rig.update(HERO_RELEASE);const before=rig.arrow.position.clone();rig.update(HERO_RELEASE+.0001);assert(before.distanceTo(rig.arrow.position)<.01,'Arrow release must be continuous');checks++;
let vertices=0;rig.scene.traverse(node=>{if(node.isSkinnedMesh){for(let i=0;i<node.geometry.attributes.position.count;i+=67){const point=new THREE.Vector3();node.getVertexPosition(i,point);assert(point.toArray().every(Number.isFinite));vertices++;}}});assert(vertices>200);checks++;
rig.update(0);const neutralKnee=rig.scene.getObjectByName('L_knee_139').quaternion.clone(),neutralCamera=rig.camera.position.clone();
rig.update(.38);assert(neutralKnee.angleTo(rig.scene.getObjectByName('L_knee_139').quaternion)>.05);assert(neutralCamera.distanceTo(rig.camera.position)>.5);assert(rig.character.position.y<-.2);checks++;
for(const p of [0,.13,.28,.38,HERO_RELEASE,.58,.76,1]){rig.update(p);for(const name of ['L_ankle_136','R_ankle_143']){const foot=rig.scene.getObjectByName(name).getWorldPosition(new THREE.Vector3());assert(Math.abs(foot.y-.168)<.02,name+' must keep ground contact');}checks++;}
rig.update(.3);const noPointer=snapshot();rig.setPointer(1,-1);rig.update(.3);assert.notDeepEqual(snapshot(),noPointer);rig.setPointer(0,0);rig.update(.3);assert.deepEqual(snapshot(),noPointer);checks++;
rig.dispose();console.log(`PASS: ${checks} comprobaciones 3D: nueve poses reproducibles en reversa, apoyo de pies, flexión de piernas, cámara, cursor, lanzamiento continuo y ${vertices} vértices deformados. Sin navegador/WebGL.`);
