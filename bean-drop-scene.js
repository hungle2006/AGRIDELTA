/**
 * AGRIDELTA Bean Fall: loads the real "Fruit bean pod" geometry exported
 * from blender/start_lifecycle.py in the existing Start GLB. Never uses GIF.
 * One WebGL renderer is moved between scroll dividers, active for only 2 s.
 */
import {
  Scene, OrthographicCamera, WebGLRenderer, Group, Mesh, MeshStandardMaterial,
  BufferGeometry, Float32BufferAttribute, Color, AmbientLight,
  DirectionalLight, DoubleSide
} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {BEAN_DROP_MS, beanDropPose} from './bean-drop-state.js';

const SELECTOR='[data-bean-divider]';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

/* Fallback geometric bean pod until the project's real Blender GLB is ready.
   The cross-sections follow a tapered organic curve and five seed bulges. */
function fallbackBean(){
  const geometry=new BufferGeometry();
  const vertices=[],colors=[],indices=[],rings=46,sides=18;
  const color=new Color();
  for(let i=0;i<=rings;i++){
    const u=i/rings;
    const taper=Math.pow(Math.sin(Math.PI*u),.7);
    const fiveBeans=[.16,.34,.51,.68,.85].reduce((s,center)=>s+.10*Math.exp(-Math.pow((u-center)/.058,2)),0);
    const radius=.015+(.18+fiveBeans)*taper;
    const x=.24*Math.sin(Math.PI*u)-.11+.035*Math.sin(2.5*Math.PI*u);
    const y=.87-1.74*u;
    const z=.09*Math.sin(2*Math.PI*u);
    for(let j=0;j<sides;j++){
      const angle=j/sides*Math.PI*2;
      const dx=radius*Math.cos(angle);
      vertices.push(x+dx,y,z+radius*.72*Math.sin(angle));
      const light=.69+.27*Math.max(0,Math.cos(angle))+.05*Math.sin(u*Math.PI*8);
      color.setRGB(clamp(.22*light,.03,.75),clamp(.57*light,.1,1),clamp(.10*light,.02,.65));
      colors.push(color.r,color.g,color.b);
      if(i<rings){
        const next=i*sides+(j+1)%sides;
        const cur=i*sides+j;
        indices.push(cur,next,cur+sides,next,next+sides,cur+sides);
      }
    }
  }
  geometry.setAttribute('position',new Float32BufferAttribute(vertices,3));
  geometry.setAttribute('color',new Float32BufferAttribute(colors,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new Mesh(geometry,new MeshStandardMaterial({
    vertexColors:true,side:DoubleSide,roughness:.48,metalness:0,
    transparent:true,opacity:1
  }));
}

function fromBlender(gltf){
  let found=null;
  gltf.scene.traverse(node=>{
    if(found || !node.isMesh)return;
    if(/fruit.*bean.*pod/i.test(node.name.replaceAll('_',' ')))found=node;
  });
  if(!found)return null;
  const geometry=found.geometry.clone();
  geometry.computeBoundingBox();
  let box=geometry.boundingBox;
  const span={x:box.max.x-box.min.x,y:box.max.y-box.min.y,z:box.max.z-box.min.z};
  const longest=Math.max(span.x,span.y,span.z);
  if(longest<=.001)return null;
  if(span.z===longest)geometry.rotateX(-Math.PI/2);
  else if(span.x===longest)geometry.rotateZ(Math.PI/2);
  geometry.center();
  geometry.computeBoundingBox();
  box=geometry.boundingBox;
  const height=box.max.y-box.min.y||1;
  geometry.scale(1.64/height,1.64/height,1.64/height);
  geometry.computeVertexNormals();
  const sourceMaterial=Array.isArray(found.material)?found.material[0]:found.material;
  const material=sourceMaterial?.clone() || new MeshStandardMaterial({color:0x4a9943,roughness:.52});
  material.transparent=true;
  material.opacity=1;
  material.side=DoubleSide;
  const model=new Mesh(geometry,material);
  model.name='Blender bean pod · AGRIDELTA';
  return model;
}

export function initBeanTransitions(site){
  const dividers=[...site.querySelectorAll(SELECTOR)];
  if(!dividers.length)return {destroy(){}};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const scene=new Scene();
  const camera=new OrthographicCamera(-1.5,1.5,1.5,-1.5,.1,30);
  camera.position.set(0,0,7);
  camera.lookAt(0,0,0);
  scene.add(new AmbientLight(0xffffff,1.35));
  const sunlight=new DirectionalLight(0xfff5ca,2.4);
  sunlight.position.set(-2,4,6);scene.add(sunlight);
  const fill=new DirectionalLight(0x86b984,1.1);
  fill.position.set(3,-1,3);scene.add(fill);
  const pod=new Group();
  scene.add(pod);
  let sourceBean=fallbackBean();
  pod.add(sourceBean);
  let nativeBean=null,renderer=null,active=null,frame=0,started=0,cssTimeout=0;
  const lastCross=new WeakMap();
  const supportsWebGL=(()=>{try{
    const canvas=document.createElement('canvas');
    return !!(canvas.getContext('webgl2')||canvas.getContext('webgl'));
  }catch{return false;}})();

  // Reuse the same Blender fruit mesh already shipped for the growing plant.
  if(supportsWebGL){
    const loader=new GLTFLoader();
    loader.load('/assets/start-lifecycle-live.glb',gltf=>{
      nativeBean=fromBlender(gltf);
      if(nativeBean && !active){
        pod.remove(sourceBean);sourceBean=nativeBean;pod.add(sourceBean);
      }
    },undefined,()=>{/* fallback pod is already a real 3D mesh */});
  }
  function makeRenderer(){
    if(renderer)return renderer;
    renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
    renderer.domElement.setAttribute('aria-hidden','true');
    renderer.domElement.style.cssText='display:block;width:100%;height:100%;pointer-events:none';
    return renderer;
  }
  function stop(clear=true){
    cancelAnimationFrame(frame);frame=0;
    if(active){
      active.classList.remove('bean-is-dropping');
      if(clear)active.querySelector('.bean-pod-target')?.replaceChildren();
      active=null;
    }
  }
  function cssFall(divider){
    const host=divider.querySelector('.bean-pod-target');
    host.replaceChildren();
    const shape=document.createElement('span');
    shape.className='bean-fallback-pod';
    host.appendChild(shape);
    divider.classList.remove('bean-is-dropping');
    void host.offsetWidth;
    divider.classList.add('bean-is-dropping');
    clearTimeout(cssTimeout);
    cssTimeout=setTimeout(()=>{divider.classList.remove('bean-is-dropping');host.replaceChildren();},BEAN_DROP_MS);
  }
  function tick(now){
    if(!active || document.hidden || site.hidden){stop();return;}
    const pose=beanDropPose(now-started);
    if(!pose.visible){stop();return;}
    pod.position.set(pose.x,pose.y,0);
    pod.rotation.set(.07,pose.tilt*.39,pose.tilt);
    pod.scale.setScalar(pose.scale);
    pod.traverse(child=>{
      if(child.isMesh && child.material)child.material.opacity=pose.opacity;
    });
    renderer.render(scene,camera);
    frame=requestAnimationFrame(tick);
  }
  function trigger(divider){
    if(site.hidden || document.hidden || reduce.matches)return;
    const now=performance.now();
    if(now-(lastCross.get(divider)||-10000)<BEAN_DROP_MS+120)return;
    lastCross.set(divider,now);
    stop();
    if(!supportsWebGL){cssFall(divider);return;}
    try{
      const host=divider.querySelector('.bean-pod-target');
      const {width,height}=host.getBoundingClientRect();
      if(width<20 || height<20)return;
      makeRenderer();
      host.replaceChildren(renderer.domElement);
      renderer.setSize(Math.round(width),Math.round(height),false);
      camera.left=-1.5*width/Math.max(height,1);
      camera.right=1.5*width/Math.max(height,1);
      camera.updateProjectionMatrix();
      if(nativeBean && sourceBean!==nativeBean){
        pod.remove(sourceBean);sourceBean=nativeBean;pod.add(sourceBean);
      }
      active=divider;
      divider.classList.add('bean-is-dropping');
      started=performance.now();
      frame=requestAnimationFrame(tick);
    }catch{
      // Low-memory mobile WebGL failure should not break the Start page.
      stop();renderer?.dispose();renderer=null;cssFall(divider);
    }
  }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)trigger(entry.target);});
  },{rootMargin:'-24% 0px -24% 0px',threshold:.13});
  dividers.forEach(el=>observer.observe(el));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  return {destroy(){observer.disconnect();stop();renderer?.dispose();clearTimeout(cssTimeout);}};
}
