import {STAGE_TIMES,stageAt} from './lifecycle-state.js';

/** Real moving Blender renders for clients without a WebGL2 context. */
export function createVideoEarth(host,{onStage,onReady,onRootFinished,onError}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const plant=document.createElement('video');plant.className='blender-lifecycle-video';plant.src='/assets/start-lifecycle-motion.webm';plant.muted=true;plant.playsInline=true;plant.preload='auto';plant.autoplay=!reduced;plant.setAttribute('aria-hidden','true');host.append(plant);
 const roots=Array.from({length:5},()=>null);let lastStage=-1,ready=false,visible=true,wasPlaying=!reduced,lastUpdate=0;
 function update(now=0){if(ready&&visible&&!document.hidden&&now-lastUpdate>100){lastUpdate=now;const stage=stageAt(plant.currentTime);if(stage!==lastStage){lastStage=stage;onStage(stage);host.dataset.plantStage=String(stage);}host.dataset.lifecycleTime=plant.currentTime.toFixed(1);}requestAnimationFrame(update);}
 plant.addEventListener('loadeddata',()=>{if(ready)return;ready=true;host.dataset.sceneState='ready';host.dataset.geometry='blender-animated-video';onReady();if(!reduced)plant.play().catch(()=>{});update();});
 plant.addEventListener('error',()=>onError(new Error('Blender motion video could not load')));
 document.addEventListener('visibilitychange',()=>{if(document.hidden){wasPlaying=!plant.paused;plant.pause();}else if(visible&&wasPlaying)plant.play().catch(()=>{});});
 return {
  revealRoot(i){if(roots[i])return;const v=document.createElement('video');v.className='blender-root-video';v.muted=true;v.playsInline=true;v.src=`/assets/start-root-motion-${i}.webm`;v.setAttribute('aria-hidden','true');v.preload='auto';host.append(v);roots[i]=v;v.addEventListener('ended',()=>{host.dataset.rootCount=String(roots.filter(Boolean).length);onRootFinished(i);},{once:true});v.addEventListener('error',()=>onError(new Error('Blender root video could not load')));v.play().catch(()=>onError(new Error('Blender root playback blocked')));},
  seekStage(i){plant.pause();plant.currentTime=STAGE_TIMES[i]??0;},
  replay(){plant.currentTime=0;plant.play().catch(()=>{});},
  toggle(){if(plant.paused){plant.play().catch(()=>{});return true;}plant.pause();return false;},
  setVisible(v){visible=v;if(!v){wasPlaying=!plant.paused;plant.pause();}else if(wasPlaying)plant.play().catch(()=>{});},
  get ready(){return ready;}
 };
}
