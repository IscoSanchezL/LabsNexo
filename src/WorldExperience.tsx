import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, Float, PerformanceMonitor, RoundedBox } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { worldVisuals } from './worlds';

type Mode = 'selector' | 'home';
type WorldExperienceProps = { gradeId: number; mode: Mode; cinematic?: boolean };
type Pointer = { current: THREE.Vector2 };

const vertexShader = `
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform float uTheme;
  uniform vec2 uPointer;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);
  }
  float fbm(vec2 p){
    float v=0.0, a=0.5;
    for(int i=0;i<4;i++){ v+=noise(p)*a; p*=2.03; a*=0.48; }
    return v;
  }
  void main(){
    vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
    vec2 focus=vec2(0.36,0.02)+(uPointer-0.5)*0.12;
    float n=fbm(p*2.2+vec2(uTime*0.025,-uTime*0.018));
    float plume=exp(-length((p-focus)*vec2(0.8,1.25))*2.5);
    float veil=0.5+0.5*sin((p.x*3.6+p.y*2.4+n*2.2)*3.1+uTime*0.12);
    float halo=plume*(0.22+0.2*n+0.10*veil);
    float edge=exp(-length(p-vec2(-0.58,0.48))*2.4)*0.13;
    float gradeMix=clamp(0.48+0.32*sin(uTheme*1.71+n*2.0+uTime*0.03),0.0,1.0);
    vec3 color=mix(uColorA,uColorB,gradeMix);
    vec3 base=vec3(0.014,0.019,0.017);
    color=base+color*(halo*0.12+edge*0.16);
    float fine=hash(gl_FragCoord.xy+floor(uTime*3.0))*0.002;
    gl_FragColor=vec4(color+fine,1.0);
  }
`;

function worldColor(gradeId: number, secondary = false) {
  const hex = worldVisuals[gradeId]?.palette[secondary ? 1 : 0] ?? worldVisuals[3].palette[0];
  return new THREE.Color(hex);
}

function Atmosphere({ gradeId, pointer }: { gradeId: number; pointer: Pointer }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uTheme: { value: gradeId },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: worldColor(gradeId) },
    uColorB: { value: worldColor(gradeId, true) },
  }), [gradeId]);
  useFrame(({ clock, size }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.elapsedTime;
    material.current.uniforms.uAspect.value = size.width / Math.max(1, size.height);
    material.current.uniforms.uPointer.value.set(pointer.current.x + 0.5, pointer.current.y + 0.5);
  });
  return <mesh position={[0, 0, -5]} frustumCulled={false}>
    <planeGeometry args={[24, 16]} />
    <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} depthWrite={false} />
  </mesh>;
}

function FloatingLights({ gradeId, lowQuality }: { gradeId: number; lowQuality: boolean }) {
  const count = lowQuality ? 18 : 42;
  const points = useMemo(() => Array.from({ length: count }, (_, i) => ({
    position: [((i * 37) % 97) / 16 - 3, ((i * 53) % 83) / 19 - 2.1, -0.8 + (i % 5) * 0.28] as [number, number, number],
    radius: 0.018 + (i % 4) * 0.008,
    phase: i * 0.7,
  })), [count]);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = Math.sin(clock.elapsedTime * 0.11) * 0.035;
  });
  const [a, b] = worldVisuals[gradeId]?.palette ?? worldVisuals[3].palette;
  return <group ref={group}>
    {points.map((p, i) => <Float key={i} speed={0.25 + (i % 3) * 0.13} rotationIntensity={0.12} floatIntensity={0.18}>
      <mesh position={p.position} scale={p.radius}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={i % 5 === 0 ? b : a} toneMapped={false} />
      </mesh>
    </Float>)}
  </group>;
}

function CrystalWorld() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => { if (group.current) group.current.rotation.y += delta * 0.11; });
  return <group ref={group}>
    <Float speed={0.42} rotationIntensity={0.12} floatIntensity={0.2}>
      <mesh scale={[1.05, 1.2, 0.82]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshPhysicalMaterial color="#f3b879" metalness={0.1} roughness={0.15} transmission={0.72} thickness={0.9} ior={1.2} clearcoat={0.8} transparent opacity={0.86} />
      </mesh>
    </Float>
    <mesh rotation={[0.65, 0.2, -0.35]}>
      <torusGeometry args={[1.42, 0.018, 8, 120]} />
      <meshStandardMaterial color="#f27b63" emissive="#7a291a" emissiveIntensity={0.55} metalness={0.65} roughness={0.28} />
    </mesh>
    <mesh position={[-0.45, 0.86, 0.1]} rotation={[0.2, 0.1, -0.3]} scale={0.24}>
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial color="#ffd5a2" roughness={0.12} transmission={0.82} thickness={0.7} />
    </mesh>
  </group>;
}

function ForestWorld() {
  const stems = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ x: -1.2 + (i % 5) * 0.58, y: -0.45 + Math.floor(i / 5) * 0.9, h: 0.65 + (i % 4) * 0.2 })), []);
  return <group>
    {stems.map((stem, i) => <group key={i} position={[stem.x, stem.y, 0]}>
      <mesh position={[0, stem.h * 0.27, -0.05]} rotation={[0, 0, (i % 2 ? -1 : 1) * 0.18]}>
        <cylinderGeometry args={[0.018, 0.035, stem.h, 6]} />
        <meshStandardMaterial color="#7a9f70" roughness={0.8} />
      </mesh>
      <mesh position={[0.11, stem.h * 0.53, 0]} scale={[0.14, 0.32, 0.11]} rotation={[0, 0, 0.35]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={i % 3 ? '#8cbb79' : '#c3df83'} roughness={0.33} emissive="#35552a" emissiveIntensity={0.25} />
      </mesh>
    </group>)}
  </group>;
}

function AuroraWorld() {
  const material = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => { if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime; });
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColorA: { value: new THREE.Color('#a88ade') }, uColorB: { value: new THREE.Color('#69d5c5') } }), []);
  return <mesh rotation={[0.12, 0, -0.12]} scale={[1.35, 0.95, 0.82]}>
    <torusKnotGeometry args={[0.82, 0.15, 180, 18, 2, 3]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={`
      varying vec2 vUv; uniform float uTime; uniform vec3 uColorA; uniform vec3 uColorB;
      void main(){ float wave=0.5+0.5*sin(vUv.x*12.0+vUv.y*9.0+uTime*0.24); vec3 c=mix(uColorA,uColorB,wave); c=mix(vec3(0.055,0.068,0.071),c,0.22); gl_FragColor=vec4(c,0.74); }
    `} side={THREE.DoubleSide} transparent opacity={0.74} depthWrite={false} />
  </mesh>;
}

function CircuitWorld() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => { if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.04 + 0.18; });
  const tracks = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const y = -1.12 + i * 0.32;
    const x = (i % 2 ? 0.6 : -0.6);
    return [[-1.55, y, 0], [x, y, 0], [x, y + (i % 2 ? -0.16 : 0.16), 0], [1.55, y + (i % 2 ? -0.16 : 0.16), 0]] as [number, number, number][];
  }), []);
  return <group ref={group}>
    {tracks.map((track, i) => <group key={i}>
      <mesh position={[(track[0][0] + track[1][0]) / 2, track[0][1], 0]} rotation={[0, 0, track[0][1] === track[1][1] ? 0 : Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, Math.abs(track[1][0] - track[0][0]), 5]} />
        <meshStandardMaterial color="#86c6e6" emissive="#2582a5" emissiveIntensity={0.75} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[track[1][0], track[1][1], 0]}>
        <boxGeometry args={[0.12, 0.12, 0.08]} />
        <meshStandardMaterial color="#a8d8e6" emissive="#337fa4" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[track[3][0], track[3][1], 0]} scale={0.06}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color={i % 2 ? '#98e7cf' : '#8dc4e8'} toneMapped={false} />
      </mesh>
    </group>)}
  </group>;
}

function Gear({ radius, teeth, color, speed, phase = 0 }: { radius: number; teeth: number; color: string; speed: number; phase?: number }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (group.current) group.current.rotation.z += delta * speed; });
  return <group ref={group} rotation={[0, 0, phase]}>
    <mesh>
      <torusGeometry args={[radius * 0.73, radius * 0.23, 12, 48]} />
      <meshStandardMaterial color={color} metalness={0.83} roughness={0.25} />
    </mesh>
    {Array.from({ length: teeth }, (_, i) => <mesh key={i} position={[Math.cos(i / teeth * Math.PI * 2) * radius, Math.sin(i / teeth * Math.PI * 2) * radius, 0]} rotation={[0, 0, i / teeth * Math.PI * 2]}>
      <boxGeometry args={[radius * 0.28, radius * 0.2, 0.16]} />
      <meshStandardMaterial color={color} metalness={0.88} roughness={0.22} />
    </mesh>)}
    <mesh position={[0, 0, 0.1]}>
      <torusGeometry args={[radius * 0.23, 0.022, 8, 32]} />
      <meshStandardMaterial color="#f0cb8a" metalness={0.85} roughness={0.2} />
    </mesh>
  </group>;
}

function CopperWorld() {
  return <group>
    <Gear radius={0.86} teeth={12} color="#c77d52" speed={0.12} />
    <group position={[0.88, 0.7, -0.12]} scale={0.58}>
      <Gear radius={0.72} teeth={10} color="#d4ae68" speed={-0.19} phase={0.1} />
    </group>
    <group position={[-0.9, -0.72, 0.08]} scale={0.48}>
      <Gear radius={0.68} teeth={9} color="#b86e49" speed={-0.14} phase={0.2} />
    </group>
  </group>;
}

function NebulaWorld() {
  const cloud = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { if (cloud.current) cloud.current.rotation.y = clock.elapsedTime * 0.035; });
  return <group ref={cloud}>
    <mesh scale={[1.22, 0.84, 0.48]} rotation={[0.25, 0.15, -0.35]}>
      <sphereGeometry args={[1, 48, 32]} />
      <meshStandardMaterial color="#9d587a" emissive="#642e5d" emissiveIntensity={0.6} roughness={0.5} metalness={0.1} transparent opacity={0.74} />
    </mesh>
    <mesh rotation={[1.2, 0.35, 0.3]} scale={[1.1, 1.1, 0.7]}>
      <torusGeometry args={[1.32, 0.018, 8, 120]} />
      <meshStandardMaterial color="#e3c17b" emissive="#765225" emissiveIntensity={0.55} metalness={0.7} roughness={0.25} />
    </mesh>
    {[[-0.74, 0.56, 0.28, 0.16], [0.87, -0.33, 0.14, 0.11], [0.58, 0.82, -0.1, 0.075]].map((p, i) => <mesh key={i} position={[p[0], p[1], p[2]]} scale={p[3]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={i === 1 ? '#e8cb85' : '#e59ab8'} emissive={i === 1 ? '#9e7533' : '#743150'} emissiveIntensity={0.8} />
    </mesh>)}
  </group>;
}

function RobotCompanion({ pointer }: { pointer: Pointer }) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (root.current) {
      root.current.position.y = -1.2 + Math.sin(t * 1.2) * 0.055;
      root.current.rotation.z = Math.sin(t * 0.42) * 0.025;
    }
    if (head.current) {
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, pointer.current.x * 0.18, 3, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -pointer.current.y * 0.12, 3, delta);
    }
    if (eyes.current) {
      const blink = Math.pow(Math.max(0, Math.cos(t * 1.42 + 0.8)), 90);
      eyes.current.scale.y = 1 - blink * 0.86;
    }
    if (leftArm.current) leftArm.current.rotation.z = -0.18 + Math.sin(t * 0.8) * 0.035;
    if (rightArm.current) rightArm.current.rotation.z = 0.18 - Math.sin(t * 0.8) * 0.035;
  });
  return <group ref={root} position={[1.02, -1.2, 1.05]} scale={0.74}>
    <group ref={head} position={[0, 0.58, 0]}>
      <RoundedBox args={[0.92, 0.76, 0.62]} radius={0.18} smoothness={5}>
        <meshPhysicalMaterial color="#d8d7cb" roughness={0.28} metalness={0.08} clearcoat={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.22, 10]} />
        <meshStandardMaterial color="#bebcaf" metalness={0.45} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.075, 16, 12]} />
        <meshBasicMaterial color="#ffcf83" toneMapped={false} />
      </mesh>
      <mesh ref={eyes} position={[0, 0.02, 0.315]}>
        <group>
          <mesh position={[-0.2, 0, 0]}><sphereGeometry args={[0.065, 16, 12]} /><meshBasicMaterial color="#f5d38b" toneMapped={false} /></mesh>
          <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.065, 16, 12]} /><meshBasicMaterial color="#f5d38b" toneMapped={false} /></mesh>
        </group>
      </mesh>
      <mesh position={[0, -0.16, 0.32]}>
        <torusGeometry args={[0.1, 0.012, 7, 20, Math.PI]} />
        <meshStandardMaterial color="#6f776c" roughness={0.4} />
      </mesh>
    </group>
    <RoundedBox args={[0.75, 0.58, 0.52]} radius={0.14} smoothness={4} position={[0, -0.17, 0]}>
      <meshPhysicalMaterial color="#aeb9ad" roughness={0.33} metalness={0.12} clearcoat={0.75} />
    </RoundedBox>
    <mesh position={[0, -0.17, 0.275]}>
      <circleGeometry args={[0.075, 24]} />
      <meshBasicMaterial color="#d9aa68" toneMapped={false} />
    </mesh>
    {[[-0.52, -0.15, 0.22], [0.52, -0.15, -0.22]].map((p, i) => <group key={i} ref={i ? rightArm : leftArm} position={[p[0], p[1], 0]} rotation={[0, 0, p[2]]}>
      <mesh position={[i ? 0.12 : -0.12, -0.06, 0]} rotation={[0, 0, i ? -0.34 : 0.34]}>
        <capsuleGeometry args={[0.075, 0.27, 6, 10]} />
        <meshPhysicalMaterial color="#c8c8bd" roughness={0.3} metalness={0.1} clearcoat={0.7} />
      </mesh>
      <mesh position={[i ? 0.26 : -0.26, -0.17, 0]}>
        <sphereGeometry args={[0.095, 16, 12]} />
        <meshStandardMaterial color="#d8a36e" metalness={0.35} roughness={0.3} />
      </mesh>
    </group>)}
    <mesh position={[-0.22, -0.6, 0.04]}><capsuleGeometry args={[0.08, 0.22, 4, 8]} /><meshStandardMaterial color="#b5b5a9" /></mesh>
    <mesh position={[0.22, -0.6, 0.04]}><capsuleGeometry args={[0.08, 0.22, 4, 8]} /><meshStandardMaterial color="#b5b5a9" /></mesh>
  </group>;
}

function WorldScene({ gradeId, mode, lowQuality, pointer, cinematic }: { gradeId: number; mode: Mode; lowQuality: boolean; pointer: Pointer; cinematic: boolean }) {
  const content = useRef<THREE.Group>(null);
  const [a, b] = worldVisuals[gradeId]?.palette ?? worldVisuals[3].palette;
  useFrame(({ clock }, delta) => {
    if (!content.current) return;
    const x = mode === 'home' ? 2.15 : 2.35;
    content.current.position.x = THREE.MathUtils.damp(content.current.position.x, x - pointer.current.x * 0.12, 2.4, delta);
    content.current.position.y = THREE.MathUtils.damp(content.current.position.y, 0.05 + pointer.current.y * 0.08, 2.4, delta);
    content.current.rotation.y = THREE.MathUtils.damp(content.current.rotation.y, pointer.current.x * 0.08, 2.4, delta);
    content.current.rotation.x = THREE.MathUtils.damp(content.current.rotation.x, pointer.current.y * 0.06, 2.4, delta);
    if (cinematic && clock.elapsedTime < 2.5) content.current.scale.setScalar(THREE.MathUtils.damp(content.current.scale.x, 1.1, 0.6, delta));
    else content.current.scale.setScalar(THREE.MathUtils.damp(content.current.scale.x, 1, 1.2, delta));
  });
  return <>
    <color attach="background" args={['#111410']} />
    <fog attach="fog" args={[worldVisuals[gradeId]?.atmosphere ?? '#15121d', 8, 19]} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[-3, 4, 5]} intensity={2.1} color="#f3e7d2" />
    <pointLight position={[3.5, 2.5, 2]} intensity={5.4} color={a} distance={9} />
    <pointLight position={[0, -2, 2]} intensity={2.5} color={b} distance={7} />
    <Atmosphere gradeId={gradeId} pointer={pointer} />
    <FloatingLights gradeId={gradeId} lowQuality={lowQuality} />
    <group ref={content} position={[mode === 'home' ? 2.15 : 2.35, 0.05, 0]} scale={1}>
      {gradeId === 1 && <CrystalWorld />}
      {gradeId === 2 && <ForestWorld />}
      {gradeId === 3 && <AuroraWorld />}
      {gradeId === 4 && <CircuitWorld />}
      {gradeId === 5 && <CopperWorld />}
      {gradeId === 6 && <NebulaWorld />}
    </group>
    {mode === 'home' && <RobotCompanion pointer={pointer} />}
    {!lowQuality && <EffectComposer multisampling={0}>
      <Bloom intensity={0.18} luminanceThreshold={0.82} luminanceSmoothing={0.28} mipmapBlur />
      <Vignette eskil={false} offset={0.22} darkness={0.44} />
    </EffectComposer>}
  </>;
}

export default function WorldExperience({ gradeId, mode, cinematic = false }: WorldExperienceProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(typeof document === 'undefined' || !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [lowQuality, setLowQuality] = useState(false);
  const pointer = useRef(new THREE.Vector2());
  const visual = worldVisuals[gradeId] ?? worldVisuals[3];

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2', { powerPreference: 'low-power' }) || canvas.getContext('webgl');
      setWebgl(Boolean(context));
      const lose = context?.getExtension('WEBGL_lose_context');
      lose?.loseContext();
    } catch { setWebgl(false); }
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motion.matches);
    const onMotion = () => setReducedMotion(motion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    const onPointer = (event: PointerEvent) => pointer.current.set((event.clientX / innerWidth - 0.5) * 2, (0.5 - event.clientY / innerHeight) * 2);
    motion.addEventListener?.('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      motion.removeEventListener?.('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  const fallback = webgl === false;
  return <div className={`world-experience world-grade-${gradeId} world-${mode}`} data-grade={gradeId} aria-hidden="true" style={{ '--world-a': visual.palette[0], '--world-b': visual.palette[1], '--world-bg': visual.atmosphere, position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' } as React.CSSProperties}>
    {fallback ? <div className="world-css-fallback"><span className="fallback-orbit fallback-orbit-one"/><span className="fallback-orbit fallback-orbit-two"/><span className="fallback-core"/></div> : webgl === true && <Canvas dpr={lowQuality ? 1 : [1, 1.5]} frameloop={visible && !reducedMotion ? 'always' : 'demand'} camera={{ position: [0, 0, 8.8], fov: 42 }} gl={{ antialias: false, alpha: true, powerPreference: 'low-power', stencil: false, depth: true }} onCreated={({ gl }) => gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowQuality ? 1 : 1.5))}>
      {!reducedMotion && <PerformanceMonitor onDecline={() => setLowQuality(true)} onIncline={() => setLowQuality(false)} onFallback={() => setLowQuality(true)} flipflops={3} bounds={(refreshrate) => [28, Math.min(60, refreshrate)]} />}
      <AdaptiveDpr pixelated />
      <WorldScene gradeId={gradeId} mode={mode} lowQuality={lowQuality} pointer={pointer} cinematic={cinematic && !reducedMotion} />
    </Canvas>}
  </div>;
}
