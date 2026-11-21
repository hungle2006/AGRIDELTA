// Render each batch once and copy the frame to the pods along its divider.
import {
  Scene, OrthographicCamera, WebGLRenderer, Group, Mesh, MeshStandardMaterial,
  BufferGeometry, Float32BufferAttribute, Color, AmbientLight,
  DirectionalLight, DoubleSide
} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {beanDropPose, beanDropPosition, beanDropOrigins} from './bean-drop-state.js';

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

  let renderer=null,rendererWidth=0;
  const batches=new Map();
  let frame=0, destroyed=false;
  let scrollY=window.scrollY, scrollingDown=false;
  const onScroll=()=>{
    const nextY=window.scrollY;
    if(nextY!==scrollY)scrollingDown=nextY>scrollY;
    scrollY=nextY;
  };
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
      if(destroyed)return;
      const nativeBean=fromBlender(gltf);
      if(nativeBean){
        pod.remove(sourceBean);
        sourceBean.geometry.dispose();
        sourceBean.material.dispose();
        sourceBean=nativeBean;
        pod.add(sourceBean);
      }
    },undefined,()=>{/* 3D fallback geometry remains available */});
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
  function stop(){
    cancelAnimationFrame(frame);
    frame=0;
    for(const batch of batches.values()){
      for(const {holder} of batch.items)holder.remove();
    }
    batches.clear();
  }

  function mountVisual(x){
    const holder=document.createElement('div');
    holder.className='bean-fall-item';
    holder.setAttribute('aria-hidden','true');
    overlay.appendChild(holder);
    const halfSize=holder.getBoundingClientRect().width/2||105;
    if(webglAvailable){
      try{
        const gl=ensureRenderer();
        const canvas=document.createElement('canvas');
        const context=canvas.getContext('2d');
        if(context){
          const width=Math.round(halfSize*2);
          if(rendererWidth!==width){
            gl.setSize(width,width,false);
            rendererWidth=width;
          }
          canvas.width=gl.domElement.width;
          canvas.height=gl.domElement.height;
          holder.appendChild(canvas);
          return {holder,context,x,halfSize};
        }
      }catch{
        renderer?.dispose();
        renderer=null;
        rendererWidth=0;
      }
    }
    const fallback=document.createElement('img');
    fallback.src='/assets/start-bean-pod.webp';
    fallback.alt='';
    fallback.className='bean-fallback-pod';
    holder.appendChild(fallback);
    return {holder,x,halfSize};
  }

  function tick(time){
    frame=0;
    if(site.hidden||document.hidden||reduce.matches){stop();return;}
    for(const [divider,{items,started,startY,endY}] of batches){
      const elapsed=time-started;
      const pose=beanDropPose(elapsed);
      if(!pose.visible){
        for(const {holder} of items)holder.remove();
        batches.delete(divider);
        continue;
      }
      const y=beanDropPosition(elapsed,startY,endY);
      if(renderer&&items.some(item=>item.context)){
        pod.rotation.set(.04,pose.tilt*.27,pose.tilt);
        pod.scale.setScalar(pose.scale);
        renderer.render(scene,camera);
      }
      for(const {holder,context,x,halfSize} of items){
        holder.style.transform='translate3d('+(x-halfSize)+'px,'+(y-halfSize)+'px,0)';
        holder.style.opacity=String(pose.opacity);
        if(renderer&&context){
          const {width,height}=context.canvas;
          context.clearRect(0,0,width,height);
          context.drawImage(renderer.domElement,0,0,width,height);
        }else{
          holder.style.setProperty('--bean-scale',String(pose.scale));
          holder.style.setProperty('--bean-tilt',pose.tilt+'rad');
        }
      }
    }
    if(batches.size)frame=requestAnimationFrame(tick);
  }

  function trigger(divider){
    if(site.hidden||document.hidden||reduce.matches||batches.has(divider))return;
    const line=divider.querySelector('.bean-transition-line');
    if(!line)return;
    const lineRect=line.getBoundingClientRect();
    if(!lineRect.width)return;
    const siteRect=site.getBoundingClientRect();
    const padding=Math.min(28,lineRect.width*.1);
    const left=lineRect.left-siteRect.left+padding;
    const right=lineRect.right-siteRect.left-padding;
    const startY=lineRect.top+lineRect.height/2-siteRect.top;
    const endY=Math.max(startY,site.scrollHeight-38);
    const items=beanDropOrigins(left,right).map(mountVisual);
    batches.set(divider,{items,started:performance.now(),startY,endY});
    if(!frame)frame=requestAnimationFrame(tick);
  }

  const directDivider=/^#bean-transition-0[1-4]$/.test(window.location.hash)
    ? site.querySelector(window.location.hash)
    : null;
  let directPending=Boolean(directDivider);
  let observer;
  function observeDividers(){
    observer?.disconnect();
    const margin=Math.round(window.innerHeight*.24);
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        if(entry.target===directDivider&&directPending){
          directPending=false;
          trigger(entry.target);
        }else if(scrollingDown){
          trigger(entry.target);
        }
      }
    },{rootMargin:`-${margin}px 0px -${margin}px 0px`,threshold:.13});
    dividers.forEach(divider=>observer.observe(divider));
  }
  function onResize(){
    scrollingDown=false;
    observeDividers();
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onResize);
  observeDividers();
  const anchorFrame=directDivider&&requestAnimationFrame(()=>{
    directDivider.scrollIntoView({block:'center',behavior:'instant'});
  });

  const onVisibility=()=>{if(document.hidden)stop();};
  document.addEventListener('visibilitychange',onVisibility);
  reduce.addEventListener?.('change',reduceListener);
  return {destroy(){
    destroyed=true;
    observer.disconnect();
    cancelAnimationFrame(anchorFrame);
    stop();
    window.removeEventListener('scroll',onScroll);
    window.removeEventListener('resize',onResize);
    document.removeEventListener('visibilitychange',onVisibility);
    reduce.removeEventListener?.('change',reduceListener);
    renderer?.dispose();
    sourceBean.geometry.dispose();
    sourceBean.material.dispose();
  }};
}
