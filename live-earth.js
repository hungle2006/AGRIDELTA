import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {LIFECYCLE_SECONDS,STAGE_TIMES,stageAt} from './lifecycle-state.js';

/** Actual Blender geometry/animation rendered live; no plant or soil image planes. */
export function createLiveEarth(host,{onStage=()=>{},onReady=()=>{},onRootFinished=()=>{},onError=()=>{}}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const actions=[];
 let renderer,scene,camera,mixer,model,clock=0,last=0,running=!reduced,visible=true,lastStage=-1,ready=false,manualTarget=null,frameCount=0;
 const branches=Array.from({length:5},()=>({meshes:[],uniform:{value:0},progress:0,target:0,done:false}));
 const trunk={meshes:[],uniform:{value:0}};
 const control={revealRoot(i){if(i>=0&&i<5)branches[i].target=1;},seekStage(i){manualTarget=STAGE_TIMES[i]??0;running=false;},replay(){clock=0;manualTarget=null;running=true;lastStage=-1;},toggle(){running=!running;return running;},setVisible(v){visible=v;last=0;},get ready(){return ready;}};
 function fail(e){host.dataset.sceneState='error';onError(e);}
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<720?1.65:2));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
  host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-5.55,5.55,3.1,-3.1,.1,60);camera.position.set(0,2.2,13);camera.lookAt(0,-.16,0);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();scene.environmentIntensity=.38;
  scene.add(new THREE.HemisphereLight(0xeaffef,0x53300e,2.1));
  const sun=new THREE.DirectionalLight(0xffe9b4,3.4);sun.position.set(-4,6,-3);scene.add(sun);
  const fill=new THREE.DirectionalLight(0xffffff,1.5);fill.position.set(2,4,7);scene.add(fill);
  const rootsLight=new THREE.PointLight(0xffbd54,2.5,8);rootsLight.position.set(0,-.6,2);scene.add(rootsLight);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fail(new Error('WebGL context lost'));});
  new ResizeObserver(resize).observe(host);resize();
  new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('/assets/start-lifecycle-live.glb',g=>{
   model=g.scene;scene.add(model);model.updateMatrixWorld(true);
   model.traverse(o=>{if(!o.isMesh)return;
    let ancestor=o;while(ancestor&&!Number.isInteger(ancestor.userData.rootIndex))ancestor=ancestor.parent;
    if(ancestor){const idx=ancestor.userData.rootIndex,branch=idx<0?trunk:branches[idx];if(!branch)return;branch.meshes.push(o);o.visible=idx<0;
     o.geometry=o.geometry.clone();const pos=o.geometry.attributes.position,travel=new Float32Array(pos.count),v=new THREE.Vector3(),origin=idx===0||idx===4?-.25:-.48;let max=0;
     for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);travel[i]=idx<0?Math.max(0,.15-v.y):Math.hypot(v.x,v.y-origin);max=Math.max(max,travel[i]);}
     for(let i=0;i<travel.length;i++)travel[i]/=max||1;o.geometry.setAttribute('aRootTravel',new THREE.BufferAttribute(travel,1));
     const materials=Array.isArray(o.material)?o.material:[o.material];const mapped=materials.map(m=>{m=m.clone();m.emissive?.set(0xcd731c);m.emissiveIntensity=.65;m.roughness=.65;
      m.onBeforeCompile=shader=>{shader.uniforms.uRootGrowth=branch.uniform;shader.vertexShader='attribute float aRootTravel; varying float vRootTravel;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRootTravel=aRootTravel;');shader.fragmentShader='uniform float uRootGrowth; varying float vRootTravel;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vRootTravel>uRootGrowth) discard;');};m.customProgramCacheKey=()=>`root-growth-${idx}`;return m;});o.material=Array.isArray(o.material)?mapped:mapped[0];
    }else{const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(/leaf|lamina/i.test(m.name)){m.side=THREE.DoubleSide;m.roughness=.52;}if(m.map)m.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());});}
   });
   mixer=new THREE.AnimationMixer(model);for(const clip of g.animations){const action=mixer.clipAction(clip);action.setLoop(THREE.LoopOnce,1);action.clampWhenFinished=true;action.play();actions.push(action);}
   ready=true;clock=0;mixer.setTime(0);host.dataset.sceneState='ready';host.dataset.geometry='blender-glb';resize();onReady();
  },undefined,fail);
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const mobile=innerWidth<720;
   if(mobile){const span=6.2;camera.left=-span*w/h/2;camera.right=span*w/h/2;camera.top=span/2;camera.bottom=-span/2;}
   else{camera.left=-5.55;camera.right=5.55;camera.top=11.1*h/w/2;camera.bottom=-camera.top;}camera.updateProjectionMatrix();
   if(model){model.traverse(o=>{if(Number.isInteger(o.userData.rootIndex))o.scale.x=mobile?.39:1;});model.updateMatrixWorld(true);}
  }
  renderer.setAnimationLoop(now=>{if(!last)last=now;const dt=Math.min((now-last)/1000,.05);last=now;if(!visible||document.hidden||host.closest('[hidden]'))return;
   if(ready){if(manualTarget!==null){const diff=manualTarget-clock;clock+=diff*(1-Math.exp(-dt*6));if(Math.abs(diff)<.015){clock=manualTarget;manualTarget=null;}}
    else if(running)clock=Math.min(LIFECYCLE_SECONDS,clock+dt);actions.forEach(a=>a.paused=false);mixer.setTime(clock);const st=stageAt(clock);if(st!==lastStage){lastStage=st;host.dataset.plantStage=String(st);onStage(st);}if(clock>=LIFECYCLE_SECONDS)running=false;
    trunk.uniform.value=Math.min(.31,clock*.065);
    branches.forEach((b,i)=>{if(b.target){b.meshes.forEach(o=>o.visible=true);b.progress=Math.min(1,b.progress+dt/(reduced?.05:1.35));b.uniform.value=THREE.MathUtils.smoothstep(b.progress,0,1);if(b.progress===1&&!b.done){b.done=true;host.dataset.rootCount=String(branches.filter(x=>x.done).length);onRootFinished(i);}}});
    frameCount++;if(frameCount%45===0){host.dataset.lifecycleTime=clock.toFixed(1);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);}
   }
   renderer.render(scene,camera);
  });
 }catch(e){fail(e);}
 return control;
}
