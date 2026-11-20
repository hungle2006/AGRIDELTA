import {STAGE_TIMES,stageAt} from './lifecycle-state.js';
import {clamp01,rootRevealAt} from './scroll-story-state.js';

/** Real moving Blender renders for clients without a WebGL2 context. */
export function createVideoEarth(host,{onStage,onReady,onRootFinished,onComplete,onError}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const plant=document.createElement('video');plant.className='blender-lifecycle-video';plant.src='/assets/start-lifecycle-film.webm';plant.muted=true;plant.playsInline=true;plant.preload='auto';plant.autoplay=!reduced;plant.setAttribute('aria-hidden','true');host.append(plant);
 const roots=Array.from({length:5},()=>null);const lastSeek=Array.from({length:5},()=>0);let lastStage=-1,ready=false,visible=true,wasPlaying=!reduced,lastUpdate=0,scrollRoots=null;
 function update(now=0){if(ready&&visible&&!document.hidden&&now-lastUpdate>100){lastUpdate=now;const stage=stageAt(plant.currentTime);if(stage!==lastStage){lastStage=stage;onStage(stage);host.dataset.plantStage=String(stage);}host.dataset.lifecycleTime=plant.currentTime.toFixed(1);}requestAnimationFrame(update);}
 function paintScrollRoot(i){
  const v=roots[i];if(!v||scrollRoots===null)return;
  const amount=rootRevealAt(scrollRoots,i);
  v.style.opacity=amount>.001?'1':'0';
  if(v.readyState>=1&&Number.isFinite(v.duration)&&v.duration>0){
   const target=Math.min(v.duration-.015,Math.max(0,v.duration*amount));
   const delta=Math.abs(v.currentTime-target),now=performance.now();
   if(delta>.07&&(now-lastSeek[i]>115||delta>.45)){try{v.currentTime=target;lastSeek[i]=now;}catch{}}
  }
 }
 function syncScrollRoots(){
  if(scrollRoots===null)return;
  roots.forEach((v,i)=>{const amount=rootRevealAt(scrollRoots,i);
   if(amount>.001&&!v){
    const clip=document.createElement('video');clip.className='blender-root-video';clip.src=`/assets/start-root-motion-${i}.webm`;clip.muted=true;clip.playsInline=true;clip.preload='metadata';clip.setAttribute('aria-hidden','true');clip.pause();host.append(clip);roots[i]=clip;
    clip.addEventListener('loadedmetadata',()=>paintScrollRoot(i));
    clip.addEventListener('error',()=>onError(new Error('Blender root video could not load')));
   }
   paintScrollRoot(i);
  });
  host.dataset.rootCount=String(roots.filter((v,i)=>v&&rootRevealAt(scrollRoots,i)>.035).length);
 }
 plant.addEventListener('loadeddata',()=>{if(ready)return;ready=true;host.dataset.sceneState='ready';host.dataset.geometry='blender-animated-video';onReady();if(!reduced)plant.play().catch(()=>{});update();});
 plant.addEventListener('ended',()=>onComplete());
 plant.addEventListener('error',()=>onError(new Error('Blender motion video could not load')));
 document.addEventListener('visibilitychange',()=>{if(document.hidden){wasPlaying=!plant.paused;plant.pause();}else if(visible&&wasPlaying)plant.play().catch(()=>{});});
 return {
  setScrollRoots(progress){scrollRoots=clamp01(progress);syncScrollRoots();},
  revealRoot(i){if(roots[i])return;const v=document.createElement('video');v.className='blender-root-video';v.muted=true;v.playsInline=true;v.src=`/assets/start-root-motion-${i}.webm`;v.setAttribute('aria-hidden','true');v.preload='auto';host.append(v);roots[i]=v;v.addEventListener('ended',()=>{host.dataset.rootCount=String(roots.filter(Boolean).length);onRootFinished(i);},{once:true});v.addEventListener('error',()=>onError(new Error('Blender root video could not load')));v.play().catch(()=>onError(new Error('Blender root playback blocked')));},
  seekStage(i){plant.pause();plant.currentTime=STAGE_TIMES[i]??0;},
  replay(){plant.currentTime=0;plant.play().catch(()=>{});},
  toggle(){if(plant.paused){plant.play().catch(()=>{});return true;}plant.pause();return false;},
  setVisible(v){visible=v;if(!v){wasPlaying=!plant.paused;plant.pause();}else if(wasPlaying)plant.play().catch(()=>{});},
  get ready(){return ready;}
 };
}
