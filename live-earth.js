import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {LIFECYCLE_SECONDS, STAGE_TIMES, stageAt} from './lifecycle-state.js';
import {rootRevealAt} from './scroll-story-state.js';
import {mountPlantFallback, mountRootFallback} from './earth-fallback.js';

const PLANT_ASSET = '/assets/start-lifecycle-live.glb';
export const INITIAL_PLANT_TIME = STAGE_TIMES[2];
let modelRequest;

function loadModel() {
  modelRequest ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(PLANT_ASSET);
  return modelRequest;
}

function createRenderer(host) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', {alpha: true, antialias: true});
  if (!context) throw new Error('WebGL 2 is not available');
  const renderer = new THREE.WebGLRenderer({canvas, context});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  return renderer;
}

function createScene() {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff8db, 0x9f7355, 1.5));
  const sun = new THREE.DirectionalLight(0xffe8bc, 2.25);
  sun.position.set(-3, 5, 4);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xeeffef, 1.85);
  rim.position.set(2, 4, -3);
  scene.add(rim);
  return scene;
}

// Fixed square composition shared with the Blender fallback renders.
function observeSize(renderer, host, draw) {
  const resize = () => {
    if (!host.clientWidth) return;
    renderer.setSize(host.clientWidth, host.clientWidth, false);
    draw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return observer;
}

function orthographicCamera(span, height, target) {
  const camera = new THREE.OrthographicCamera(-span/2, span/2, span/2, -span/2, .1, 25);
  camera.position.set(0, height, 10);
  camera.lookAt(0, target, 0);
  return camera;
}

export function createLiveEarth(host, onUpdate) {
  let time = INITIAL_PLANT_TIME;
  let playing = false;
  let lastFrame = 0;
  let frame = 0;
  let renderedTime = null;
  let inView = true;
  let visible = true;
  let renderer, observer, mixer, action, fallback;

  function draw() {
    if (mixer) {
      action.reset().play();
      mixer.setTime(time);
      renderer.render(scene, camera);
      if (host.dataset.sceneState !== 'ready') host.dataset.sceneState = 'ready';
    }
    fallback?.(time, playing && visible && inView && !document.hidden);
    if (renderedTime !== time) {
      renderedTime = time;
      host.dataset.plantStage = String(stageAt(time));
    }
  }

  function tick(now) {
    frame = 0;
    if (!playing || !inView || !visible || document.hidden) {
      lastFrame = 0;
      return;
    }
    if (lastFrame && now-lastFrame < 30) {
      refresh();
      return;
    }
    if (lastFrame) time = Math.min(LIFECYCLE_SECONDS, time + Math.min((now-lastFrame)/1000, .08));
    lastFrame = now;
    if (time >= LIFECYCLE_SECONDS) playing = false;
    draw();
    refresh();
  }

  function refresh() {
    onUpdate(stageAt(time), playing, time >= LIFECYCLE_SECONDS);
    if (playing && inView && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick);
  }

  function showFallback() {
    observer?.disconnect();
    renderer?.dispose();
    renderer?.domElement.remove();
    mixer = null;
    host.dataset.sceneState = 'fallback';
    fallback = mountPlantFallback(host);
    draw();
  }

  const scene = createScene();
  const camera = orthographicCamera(3.65, 3.10, 1.23);
  try {
    renderer = createRenderer(host);
    observer = observeSize(renderer, host, draw);
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      showFallback();
    }, {once: true});
    loadModel().then(({scene: original, animations}) => {
      if (fallback) return;
      const model = original.clone(true);
      model.traverse(obj => { if (Number.isInteger(obj.userData.rootIndex)) obj.visible = false; });
      scene.add(model);
      mixer = new THREE.AnimationMixer(model);
      action = mixer.clipAction(animations[0]).setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      draw();
    }).catch(showFallback);
  } catch {
    showFallback();
  }

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    lastFrame = 0;
    fallback?.(time, playing && visible && inView && !document.hidden);
    refresh();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    lastFrame = 0;
    fallback?.(time, playing && visible && inView && !document.hidden);
    refresh();
  });
  draw();

  return {
    seekStage(index) {
      playing = false;
      time = STAGE_TIMES[index];
      draw();
      refresh();
    },
    replay() {
      time = 0;
      playing = true;
      lastFrame = 0;
      draw();
      refresh();
    },
    toggle() {
      if (!playing && time >= LIFECYCLE_SECONDS) time = 0;
      playing = !playing;
      lastFrame = 0;
      draw();
      refresh();
    },
    setVisible(value) {
      visible = value;
      lastFrame = 0;
      fallback?.(time, playing && visible && inView && !document.hidden);
      refresh();
    },
  };
}

function rootMaterial(material, growth) {
  const result = material.clone();
  result.color.multiplyScalar(1.2);
  result.emissive.set(0x603b17);
  result.emissiveIntensity = .20;
  result.onBeforeCompile = shader => {
    shader.uniforms.uRootGrowth = growth;
    shader.vertexShader = 'attribute float _root_travel; varying float vRootTravel;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvRootTravel = _root_travel;',
    );
    shader.fragmentShader = 'uniform float uRootGrowth; varying float vRootTravel;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <clipping_planes_fragment>',
      '#include <clipping_planes_fragment>\nif (vRootTravel > uRootGrowth) discard;',
    );
  };
  return result;
}

export function createRootEarth(host, buttons) {
  const gains = buttons.map(() => ({value: 0}));
  const rootNodes = [];
  const scene = createScene();
  const camera = orthographicCamera(4.64, -1.37, -1.12);
  const lamp = new THREE.DirectionalLight(0xffd39a, 1.75);
  lamp.position.set(-2, 0, 4);
  scene.add(lamp);
  let renderer, observer, fallback;
  let progress = 0;
  let ready = false;

  function draw() {
    gains.forEach((gain, index) => {
      gain.value = rootRevealAt(progress, index);
      if (rootNodes[index]) rootNodes[index].visible = gain.value > .001;
    });
    if (ready) renderer.render(scene, camera);
    fallback?.(gains.map(gain => gain.value));
  }

  function showFallback() {
    observer?.disconnect();
    renderer?.dispose();
    renderer?.domElement.remove();
    ready = false;
    fallback = mountRootFallback(host);
    host.dataset.sceneState = 'fallback';
    draw();
  }

  // Load the second renderer only as the visitor approaches the root section.
  const preload = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    preload.disconnect();
    try {
      renderer = createRenderer(host);
      observer = observeSize(renderer, host, draw);
      renderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        showFallback();
      }, {once: true});
      loadModel().then(({scene: original}) => {
        if (fallback) return;
        original.traverse(obj => {
          const {rootIndex, tip, rootCollar} = obj.userData;
          if (rootCollar) {
            const collar = obj.clone(true);
            collar.scale.setScalar(1);
            scene.add(collar);
          }
          if (!Number.isInteger(rootIndex)) return;
          const root = obj.clone(true);
          rootNodes[rootIndex] = root;
          root.traverse(part => {
            if (part.isMesh) part.material = rootMaterial(part.material, gains[rootIndex]);
          });
          scene.add(root);
          camera.updateMatrixWorld();
          const [x, y, z] = tip;
          const point = new THREE.Vector3(x, z, -y).project(camera);
          buttons[rootIndex].style.setProperty('--root-x', `${(point.x+1)*50}%`);
          buttons[rootIndex].style.setProperty('--root-y', `${(1-point.y)*50}%`);
        });
        ready = true;
        draw();
        host.dataset.sceneState = 'ready';
      }).catch(showFallback);
    } catch {
      showFallback();
    }
  }, {rootMargin: '320px'});
  preload.observe(host);

  return {
    setScrollRoots(value) {
      if (progress === value) return;
      progress = value;
      draw();
    },
  };
}
