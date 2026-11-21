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
import {BEAN_DROP_MS, beanDropPose, beanDropPosition} from './bean-drop-state.js';

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

/**
 * One GPU surface is shared by all four dividers. It is absolutely positioned
 * against the entire Start page (not an overflow-hidden divider).
 */
export function initBeanTransitions(site,overlay){
  const dividers=[...site.querySelectorAll(SELECTOR)];
  if(!overlay||!dividers.length)return {destroy(){}};

  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const scene=new Scene();
  const camera=new OrthographicCamera(-1.5,1.5,1.5,-1.5,.1,30);
  camera.position.set(0,0,7);
  camera.lookAt(0,0,0);
  scene.add(new AmbientLight(0xffffff,1.35));
  const sunlight=new DirectionalLight(0xfff5ca,2.4);
  sunlight.position.set(-2,4,6);
  scene.add(sunlight);
  const fill=new DirectionalLight(0x86b984,1.1);
  fill.position.set(3,-1,3);
  scene.add(fill);
  const pod=new Group();
  scene.add(pod);
  let sourceBean=fallbackBean();
  pod.add(sourceBean);

  let nativeBean=null,renderer=null;
  let active=null,frame=0,started=0,item=null;
  let startX=0,startY=0,endY=0,halfSize=105;
  const lastCross=new WeakMap();
  const reduceListener=()=>{
    if(reduce.matches)stop();
  };

  const webglAvailable=(()=>{
    try{
      const probe=document.createElement('canvas');
      const context=probe.getContext('webgl2')||probe.getContext('webgl');
      if(!context)return false;
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    }catch{return false;}
  })();

  // Use the actual Blender bean-pod geometry from the existing GLB asset.
  if(webglAvailable){
    new GLTFLoader().load('/assets/start-lifecycle-live.glb',gltf=>{
      nativeBean=fromBlender(gltf);
      if(nativeBean&&sourceBean!==nativeBean){
        pod.remove(sourceBean);
        sourceBean=nativeBean;
        pod.add(sourceBean);
      }
    },undefined,()=>{/* 3D fallback geometry remains available */});
  }

  function ensureItem(){
    if(!item){
      item=document.createElement('div');
      item.className='bean-fall-item';
      item.setAttribute('aria-hidden','true');
      overlay.appendChild(item);
    }
    return item;
  }
  function ensureRenderer(){
    if(renderer)return renderer;
    renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
    renderer.domElement.style.cssText='width:100%;height:100%;display:block;pointer-events:none';
    renderer.domElement.setAttribute('aria-hidden','true');
    return renderer;
  }
  function clearDisplay(){
    if(item){
      item.style.opacity='0';
      item.style.transform='translate3d(-9999px,-9999px,0)';
      item.replaceChildren();
    }
  }
  function stop(){
    if(frame)cancelAnimationFrame(frame);
    frame=0;
    active=null;
    clearDisplay();
  }
  function mountVisual(){
    const holder=ensureItem();
    halfSize=Math.max(75,holder.getBoundingClientRect().width/2||105);
    holder.replaceChildren();
    if(webglAvailable){
      try{
        const gl=ensureRenderer();
        const width=Math.round(halfSize*2);
        gl.setSize(width,width,false);
        gl.domElement.setAttribute('aria-hidden','true');
        holder.appendChild(gl.domElement);
        return;
      }catch{
        renderer?.dispose();
        renderer=null;
      }
    }
    const fallback=document.createElement('span');
    fallback.className='bean-fallback-pod';
    fallback.setAttribute('aria-hidden','true');
    holder.appendChild(fallback);
  }
  function tick(time){
    if(!active||site.hidden||document.hidden||reduce.matches){stop();return;}
    const elapsed=time-started;
    const pose=beanDropPose(elapsed);
    if(!pose.visible){stop();return;}
    const y=beanDropPosition(elapsed,startY,endY);
    const holder=ensureItem();
    // Absolute page coordinates: the 3D fruit crosses every section until
    // it reaches the actual bottom of the Start page, always at the same X.
    holder.style.transform='translate3d('+(startX-halfSize).toFixed(1)+'px,'+(y-halfSize).toFixed(1)+'px,0)';
    holder.style.opacity=String(pose.opacity);
    if(renderer){
      pod.position.set(0,0,0);
      pod.rotation.set(.04,pose.tilt*.27,pose.tilt);
      pod.scale.setScalar(pose.scale);
      pod.traverse(node=>{if(node.isMesh&&node.material)node.material.opacity=pose.opacity;});
      renderer.render(scene,camera);
    }else{
      holder.style.setProperty('--bean-scale',String(pose.scale));
      holder.style.setProperty('--bean-tilt',pose.tilt+'rad');
    }
    frame=requestAnimationFrame(tick);
  }
  function trigger(divider){
    if(site.hidden||document.hidden||reduce.matches)return;
    const now=performance.now();
    if(now-(lastCross.get(divider)||-10000)<BEAN_DROP_MS+200)return;
    const line=divider.querySelector('.bean-transition-line');
    if(!line)return;
    const lineRect=line.getBoundingClientRect();
    const siteRect=site.getBoundingClientRect();
    // Fixed to the line's midpoint, rather than the divider's mini canvas.
    startX=lineRect.left+lineRect.width/2-siteRect.left;
    startY=lineRect.top+lineRect.height/2-siteRect.top;
    // Use the entire document-height Start, not the current viewport height.
    endY=Math.max(startY,site.scrollHeight-38);
    lastCross.set(divider,now);
    stop();
    mountVisual();
    active=divider;
    started=performance.now();
    frame=requestAnimationFrame(tick);
  }

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)trigger(entry.target);});
  },{rootMargin:'-24% 0px -24% 0px',threshold:.13});
  dividers.forEach(el=>observer.observe(el));
  if(/^#bean-transition-0[1-4]$/.test(window.location.hash)){
    requestAnimationFrame(()=>{
      site.querySelector(window.location.hash)?.scrollIntoView({block:'center',behavior:'instant'});
    });
  }
  const onVisibility=()=>{if(document.hidden)stop();};
  document.addEventListener('visibilitychange',onVisibility);
  reduce.addEventListener?.('change',reduceListener);
  return {destroy(){
    observer.disconnect();
    stop();
    document.removeEventListener('visibilitychange',onVisibility);
    reduce.removeEventListener?.('change',reduceListener);
    renderer?.dispose();
    item?.remove();
  }};
}
