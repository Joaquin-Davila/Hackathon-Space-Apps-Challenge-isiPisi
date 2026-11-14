// frontend/src/components/lunar/LunarGlobe.jsx
// Luna 3D con three.js. Textura y relieve procedurales (sin assets externos).
// Para usar una textura real de LOLA: reemplaza buildMoonTextures() por un TextureLoader.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ---------- textura procedural ---------- */
let cache = null;

function hash3(ix, iy, iz) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const sm = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
function noise3(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = sm(x - ix), fy = sm(y - iy), fz = sm(z - iz);
  return lerp(
    lerp(lerp(hash3(ix, iy, iz), hash3(ix + 1, iy, iz), fx), lerp(hash3(ix, iy + 1, iz), hash3(ix + 1, iy + 1, iz), fx), fy),
    lerp(lerp(hash3(ix, iy, iz + 1), hash3(ix + 1, iy, iz + 1), fx), lerp(hash3(ix, iy + 1, iz + 1), hash3(ix + 1, iy + 1, iz + 1), fx), fy),
    fz
  );
}
function fbm(x, y, z, oct) {
  let v = 0, a = 0.5;
  for (let i = 0; i < oct; i++) { v += a * noise3(x, y, z); x *= 2.03; y *= 2.03; z *= 2.03; a *= 0.5; }
  return v;
}

function buildMoonTextures(W = 1024, H = 512) {
  if (cache) return cache;
  let seed = 7;
  const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;

  const craters = [];
  for (let i = 0; i < 150; i++) {
    const z = rand() * 2 - 1, t = rand() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    const r = 0.018 + Math.pow(rand(), 3) * 0.17;
    craters.push({ x: s * Math.cos(t), y: z, z: s * Math.sin(t), r, cut: Math.cos(r * 1.5) });
  }

  const color = document.createElement('canvas');
  const bump = document.createElement('canvas');
  color.width = bump.width = W;
  color.height = bump.height = H;
  const cImg = color.getContext('2d').createImageData(W, H);
  const bImg = bump.getContext('2d').createImageData(W, H);

  for (let j = 0; j < H; j++) {
    const theta = ((j + 0.5) / H) * Math.PI;
    const sinT = Math.sin(theta), cosT = Math.cos(theta);
    for (let i = 0; i < W; i++) {
      const phi = ((i + 0.5) / W) * Math.PI * 2;
      // misma parametrización que THREE.SphereGeometry
      const x = -Math.cos(phi) * sinT, y = cosT, z = Math.sin(phi) * sinT;

      let ch = 0;
      for (const c of craters) {
        const dot = x * c.x + y * c.y + z * c.z;
        if (dot < c.cut) continue;
        const d = Math.acos(Math.min(1, dot)) / c.r;
        if (d < 1) ch -= (1 - d * d) * 0.55;
        ch += 0.28 * Math.exp(-(((d - 1.02) / 0.14) ** 2));
      }

      const terrain = fbm(x * 3.2, y * 3.2, z * 3.2, 5);
      const maria = fbm(x * 1.4 + 11, y * 1.4 + 11, z * 1.4 + 11, 3);
      const mask = Math.min(1, Math.max(0, (maria - 0.5) / 0.12));
      let b = 0.6 + (terrain - 0.35) * 0.55 + ch * 0.45 - mask * 0.24;
      b = Math.min(1, Math.max(0.08, b));

      const k = (j * W + i) * 4;
      cImg.data[k] = b * 255;
      cImg.data[k + 1] = b * 250;
      cImg.data[k + 2] = b * 242;
      cImg.data[k + 3] = 255;
      const h = Math.min(1, Math.max(0, 0.5 + ch * 0.5 + (terrain - 0.4) * 0.3)) * 255;
      bImg.data[k] = bImg.data[k + 1] = bImg.data[k + 2] = h;
      bImg.data[k + 3] = 255;
    }
  }
  color.getContext('2d').putImageData(cImg, 0, 0);
  bump.getContext('2d').putImageData(bImg, 0, 0);
  cache = { color, bump };
  return cache;
}

/* ---------- variantes de luz ---------- */
const LOOKS = {
  hero: { key: new THREE.Color(0xff9a4d), intensity: 3.4, glow: 1, ambient: 0.55 },
  dim:  { key: new THREE.Color(0xc9d3e6), intensity: 1.5, glow: 0, ambient: 0.45 },
  far:  { key: new THREE.Color(0x9fb0cc), intensity: 0.55, glow: 0, ambient: 0.35 },
};

export default function LunarGlobe({ lat = -89.5, lon = 0, variant = 'dim' }) {
  const mount = useRef(null);
  const live = useRef({ variant, lat, lon });
  live.current = { variant, lat, lon };

  useEffect(() => {
    const el = mount.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.z = 4.85;

    const { color, bump } = buildMoonTextures();
    const map = new THREE.CanvasTexture(color);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    const bumpMap = new THREE.CanvasTexture(bump);

    const pivot = new THREE.Group();   // giro lento sobre el eje de la cámara
    const orient = new THREE.Group();  // orienta el sitio hacia la cámara
    pivot.add(orient);
    scene.add(pivot);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 64),
      new THREE.MeshStandardMaterial({ map, bumpMap, bumpScale: 2, roughness: 1, metalness: 0 })
    );
    orient.add(moon);

    const glowMat = new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(0xff8a3d) }, k: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vV;
        void main(){ vN = normalize(normalMatrix*normal);
          vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz);
          gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vV; uniform vec3 c; uniform float k;
        void main(){ float i = clamp(dot(-vN, vV), 0.0, 1.0);
          float f = clamp(pow(i*2.2, 1.5), 0.0, 1.0);
          f *= 0.3 + 0.7*clamp(-vN.x*1.2 + 0.2, 0.0, 1.0);
          gl_FragColor = vec4(c, f*0.85*k); }`,
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.12, 64, 48), glowMat));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(-3, 1.2, 2.4);
    const fill = new THREE.DirectionalLight(0x5b7bb5, 0.35);
    fill.position.set(3, -1, 1);
    const ambient = new THREE.AmbientLight(0x1b2540, 0.5);
    scene.add(keyLight, fill, ambient);

    const target = new THREE.Quaternion();
    const from = new THREE.Vector3(), to = new THREE.Vector3(0, 0, 1);
    const look = { intensity: LOOKS[variant].intensity, ambient: LOOKS[variant].ambient, glow: LOOKS[variant].glow };
    keyLight.color.copy(LOOKS[variant].key);
    let snapped = false;

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = live.current;
      const L = LOOKS[s.variant];

      // orientación hacia el sitio (el polo sur queda de frente)
      const la = THREE.MathUtils.degToRad(s.lat), lo = THREE.MathUtils.degToRad(s.lon);
      from.set(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo));
      target.setFromUnitVectors(from, to);
      if (!snapped) { orient.quaternion.copy(target); snapped = true; }
      else orient.quaternion.slerp(target, 0.06);

      // transición de luz entre variantes
      keyLight.color.lerp(L.key, 0.08);
      look.intensity += (L.intensity - look.intensity) * 0.08;
      look.ambient += (L.ambient - look.ambient) * 0.08;
      look.glow += (L.glow - look.glow) * 0.08;
      keyLight.intensity = look.intensity;
      ambient.intensity = look.ambient;
      glowMat.uniforms.k.value = look.glow;

      if (!reduce) pivot.rotation.z += 0.0012;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      moon.geometry.dispose(); moon.material.dispose();
      map.dispose(); bumpMap.dispose(); glowMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={mount} className="globe-canvas" aria-hidden="true" />;
}