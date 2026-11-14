import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, Focus, Minus, Plus, RotateCcw } from "lucide-react";
import type { ChronologicalArtifact } from "../../data/chronologicalArtifacts";
import { PLANET_TEXTURES, SOLAR_ATLAS_BODIES, SOLAR_REFERENCE_DATE } from "../../data/atlas";
import { orbitExtent, solarViewDistance } from "../../utils/solarOrbits";
import { easeAtlasFocus, planetCoordinateToVector, shortestAngleDelta, type AtlasMotionState } from "../../utils/planetCoordinates";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ArtifactAtlasPreview } from "./ArtifactAtlasPreview";

type AtlasAction = "focus" | "overview" | "inner-system" | "zoom-in" | "zoom-out" | "left" | "right" | "up" | "down";
interface Command { action: AtlasAction; serial: number }
interface AtlasProps {
  artifact: ChronologicalArtifact;
  artifacts: ChronologicalArtifact[];
  onSelect: (id: string) => void;
  suspended?: boolean;
  focusRequest?: number;
}

function supportsWebGL2() {
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

function AtlasUnavailable({ artifact }: { artifact: ChronologicalArtifact }) {
  return <div className="atlas-unavailable" role="status">
    <p>The 3D atlas is unavailable on this device.</p>
    <span>You can still select every record, read its location context and open the full dossier.</span>
    <ArtifactAtlasPreview artifact={artifact} />
  </div>;
}

class AtlasBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function usePlanetTextures(body: 'moon' | 'mars', onStatus: (status: string) => void) {
  const [textures, setTextures] = useState<{ color?: THREE.Texture; relief?: THREE.Texture }>({});
  useEffect(() => {
    let cancelled = false;
    const owned: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    const load = (url: string) => new Promise<THREE.Texture>((resolve, reject) => {
      const texture = loader.load(url, resolve, undefined, reject);
      owned.push(texture);
    });
    onStatus('Loading surface imagery…');
    const definition = PLANET_TEXTURES[body];
    Promise.all([load(definition.color), definition.relief ? load(definition.relief).catch(() => undefined) : undefined])
      .then(([color, relief]) => {
        if (cancelled) return;
        color.colorSpace = THREE.SRGBColorSpace;
        color.anisotropy = 4;
        setTextures({ color, relief });
        onStatus('NASA surface mosaic · illustrative lighting');
      }).catch(() => {
        if (!cancelled) onStatus('Surface imagery unavailable · interactive schematic sphere');
      });
    return () => { cancelled = true; owned.forEach(texture => texture.dispose()); };
  }, [body, onStatus]);
  return textures;
}

function Planet({ artifact, artifacts, onSelect, labels, onTextureStatus }: AtlasProps & { labels: boolean; onTextureStatus: (status: string) => void }) {
  const body = artifact.volumeId === 'surveyor' ? 'moon' : 'mars';
  const { color, relief } = usePlanetTextures(body, onTextureStatus);
  const markerRecords = artifacts.filter(record => record.coordinateData?.body === body)
    .sort((a, b) => Number(a.id === artifact.id) - Number(b.id === artifact.id));
  return <>
    <mesh>
      <sphereGeometry args={[1.35, 96, 64]} />
      <meshStandardMaterial key={color?.uuid ?? 'loading-surface'} color={color ? '#ffffff' : body === 'moon' ? '#a7aaa7' : '#b77650'} map={color ?? null} bumpMap={relief ?? null} bumpScale={.025} roughness={.95} />
    </mesh>
    <group visible={labels}>
      {[-60, 0, 60].map(latitude => <mesh key={latitude} position={[0, Math.sin(latitude * Math.PI / 180) * 1.354, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[Math.cos(latitude * Math.PI / 180) * 1.354, .0018, 4, 80]} />
        <meshBasicMaterial color="#d6ccb0" transparent opacity={.28} />
      </mesh>)}
      {[0, 45, 90, 135].map(longitude => <mesh key={longitude} rotation={[0, longitude * Math.PI / 180, 0]}>
        <torusGeometry args={[1.354, .0018, 4, 96]} />
        <meshBasicMaterial color="#d6ccb0" transparent opacity={.19} />
      </mesh>)}
    </group>
    {markerRecords.map(record => {
      const coordinate = record.coordinateData!;
      const position = planetCoordinateToVector(coordinate.latitude, coordinate.longitude, 1.38);
      const selected = record.id === artifact.id;
      const normal = new THREE.Vector3(...position).normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      return <group key={record.id} position={position}>
        <mesh onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); if (event.delta < 5) onSelect(record.id); }}>
          <sphereGeometry args={[selected ? .041 : .029, 16, 12]} />
          <meshBasicMaterial color={selected ? '#fff4cc' : '#d6b874'} />
        </mesh>
        {selected && <mesh quaternion={quaternion} renderOrder={3}>
          <ringGeometry args={[.065, .074, 40]} /><meshBasicMaterial color="#e9bc77" side={THREE.DoubleSide} depthWrite={false} />
        </mesh>}
        {selected && labels && <Html position={[normal.x * .08, normal.y * .08, normal.z * .08]} center occlude style={{ pointerEvents: 'none' }}>
          <span className="atlas-pin-label">{record.title}</span>
        </Html>}
      </group>;
    })}
  </>;
}

type SolarBody = typeof SOLAR_ATLAS_BODIES[number];

function SolarMarker({ body, selected, onSelect }: { body: SolarBody; selected: boolean; onSelect: () => void }) {
  const marker = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const point = useMemo(() => new THREE.Vector3(...body.position), [body]);
  useFrame(({ camera, size }) => {
    // Symbols stay legible in pixels; their centres retain their true AU positions.
    const unitsPerPixel = 2 * camera.position.distanceTo(point) * Math.tan(20 * Math.PI / 180) / size.height;
    const orbitRadius = body.elements?.semiMajorAxis ?? .15;
    const pixels = Math.min(body.markerPixels, Math.max(body.id === 'sun' ? 4 : 2, orbitRadius / unitsPerPixel * .08));
    marker.current?.scale.setScalar(unitsPerPixel * pixels / body.markerPixels);
    halo.current?.quaternion.copy(camera.quaternion);
  });
  return <group ref={marker} position={body.position}>
    <mesh onClick={(event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); if (event.delta < 5) onSelect(); }}>
      <sphereGeometry args={[body.markerPixels, 24, 16]} />
      <meshBasicMaterial color={body.color} />
    </mesh>
    {selected && <mesh ref={halo}>
      <ringGeometry args={[body.markerPixels + 4, body.markerPixels + 5, 48]} />
      <meshBasicMaterial color="#ffe0a1" side={THREE.DoubleSide} depthTest={false} />
    </mesh>}
  </group>;
}

function SolarLabels({ selectedId }: { selectedId?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const bodies = useMemo(() => [...SOLAR_ATLAS_BODIES].sort((a, b) =>
    Number(b.id === selectedId) - Number(a.id === selectedId) || Number(b.id === 'sun') - Number(a.id === 'sun') ||
    Number(b.kind === 'planet') - Number(a.kind === 'planet')), [selectedId]);
  const projected = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const occupied: { x: number; y: number; width: number; height: number }[] = [];
    bodies.forEach((body, index) => {
      const label = container.current?.children[index] as HTMLElement | undefined;
      if (!label) return;
      projected.set(...body.position).project(camera);
      const x = (projected.x + 1) * size.width / 2;
      const y = (1 - projected.y) * size.height / 2;
      const width = label.offsetWidth, height = label.offsetHeight;
      let placement: { x: number; y: number; width: number; height: number } | undefined;
      const unitsPerPixel = 2 * camera.position.length() * Math.tan(20 * Math.PI / 180) / size.height;
      const crowdedInnerBody = body.id !== selectedId && body.id !== 'sun' && body.elements && body.elements.semiMajorAxis / unitsPerPixel < 22;
      if (!crowdedInnerBody && projected.z > -1 && projected.z < 1 && x > 0 && x < size.width && y > 38 && y < size.height - 40) {
        const gap = body.markerPixels + 7;
        for (const [dx, dy] of [[gap, -height / 2], [-width / 2, -gap - height], [-width - gap, -height / 2], [-width / 2, gap]]) {
          const candidate = { x: x + dx, y: y + dy, width, height };
          if (candidate.x < 5 || candidate.x + width > size.width - 5 || candidate.y < 38 || candidate.y + height > size.height - 40) continue;
          if (occupied.some(box => candidate.x < box.x + box.width + 4 && candidate.x + width + 4 > box.x && candidate.y < box.y + box.height + 3 && candidate.y + height + 3 > box.y)) continue;
          placement = candidate; break;
        }
      }
      label.style.visibility = placement ? 'visible' : 'hidden';
      if (placement) {
        occupied.push(placement);
        label.style.transform = `translate(${placement.x}px, ${placement.y}px)`;
      }
    });
  });
  return <Html fullscreen zIndexRange={[1, 0]} style={{ pointerEvents: 'none' }}>
    <div ref={container} className="solar-label-layer" aria-hidden="true">
      {bodies.map(body => <span key={body.id} data-solar-label={body.id} className={`solar-body-label ${selectedId === body.id ? 'is-selected' : ''}`}>{body.name}</span>)}
    </div>
  </Html>;
}

function SolarAtlas({ artifact, artifacts, onSelect, labels }: AtlasProps & { labels: boolean }) {
  return <>
    {SOLAR_ATLAS_BODIES.map(body => {
      const selected = body.id === artifact.spaceFocus;
      const showOrbit = body.kind === 'planet' || selected || artifact.spaceFocus === 'ceres' && body.id === 'vesta';
      return <group key={body.id}>
        {body.orbit && showOrbit && <Line points={body.orbit} color={selected ? '#e1bc7b' : '#96a8b3'} transparent opacity={selected ? .8 : .28} lineWidth={selected ? 1.2 : .7} />}
        <SolarMarker body={body} selected={selected} onSelect={() => {
          const record = artifacts.find(item => item.spaceFocus === body.id);
          if (record) onSelect(record.id);
        }} />
      </group>;
    })}
    {labels && <SolarLabels selectedId={artifact.spaceFocus} />}
  </>;
}

interface Transition {
  fromTarget: THREE.Vector3; toTarget: THREE.Vector3;
  from: THREE.Spherical; to: THREE.Spherical;
  elapsed: number; finish: AtlasMotionState;
}

function AtlasScene({ artifact, artifacts, onSelect, command, labels, reduced, onMode, onTextureStatus, onUnavailable, focusRequest = 0 }: AtlasProps & {
  command: Command; labels: boolean; reduced: boolean;
  onMode: (state: AtlasMotionState) => void; onTextureStatus: (status: string) => void;
  onUnavailable: () => void;
}) {
  const { camera, invalidate, gl, size } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const light = useRef<THREE.DirectionalLight>(null);
  const transition = useRef<Transition | null>(null);
  const lastRecord = useRef('');
  const lastFocusRequest = useRef(-1);
  const isSpace = artifact.volumeId === 'pioneer';
  const solarAspect = isSpace ? size.width / size.height : 1;
  const scratch = useMemo(() => ({ spherical: new THREE.Spherical(), target: new THREE.Vector3(), offset: new THREE.Vector3(), lightOffset: new THREE.Vector3(2, 2, 1) }), []);
  const publishCamera = () => {
    gl.domElement.dataset.cameraPosition = camera.position.toArray().map(value => value.toFixed(5)).join(',');
    gl.domElement.dataset.cameraTarget = controls.current?.target.toArray().map(value => value.toFixed(5)).join(',');
  };
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = () => onUnavailable();
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onUnavailable]);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const changed = lastRecord.current !== artifact.id || lastFocusRequest.current !== focusRequest;
    lastRecord.current = artifact.id;
    lastFocusRequest.current = focusRequest;
    const action = changed ? 'focus' : command.action;
    orbit.autoRotate = false;
    orbit.enableDamping = false;
    orbit.update();
    const fromTarget = orbit.target.clone();
    const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(fromTarget));
    const to = from.clone();
    const toTarget = fromTarget.clone();
    let finish: AtlasMotionState = 'idle';
    if (action === 'overview' || action === 'focus' || action === 'inner-system') {
      toTarget.set(0, 0, 0);
      if (isSpace) {
        const body = SOLAR_ATLAS_BODIES.find(item => item.id === artifact.spaceFocus);
        const extent = action === 'overview' ? Math.max(...SOLAR_ATLAS_BODIES.map(item => item.elements ? orbitExtent(item.elements) : 0))
          : action === 'inner-system' ? 1.8 : body?.elements ? orbitExtent(body.elements) : 1.8;
        to.setFromVector3(new THREE.Vector3(0, 1, .28).normalize().multiplyScalar(solarViewDistance(extent, solarAspect)));
      } else if (action === 'focus' && artifact.coordinateData) {
        const coordinate = artifact.coordinateData;
        to.setFromVector3(new THREE.Vector3(...planetCoordinateToVector(coordinate.latitude, coordinate.longitude, 4.7)));
      } else to.setFromVector3(new THREE.Vector3(0, .45, 5.7));
      finish = action === 'focus' ? 'focused' : 'idle';
    } else if (action === 'zoom-in' || action === 'zoom-out') {
      to.radius = THREE.MathUtils.clamp(from.radius * (action === 'zoom-in' ? .8 : 1.25), isSpace ? .6 : 2.1, isSpace ? 350 : 8);
    } else {
      if (action === 'left' || action === 'right') to.theta += (action === 'left' ? -1 : 1) * Math.PI / 8;
      else to.phi = THREE.MathUtils.clamp(to.phi + (action === 'up' ? -1 : 1) * Math.PI / 12, .04, Math.PI - .04);
    }
    to.theta = from.theta + shortestAngleDelta(from.theta, to.theta);
    to.phi = THREE.MathUtils.clamp(to.phi, .03, Math.PI - .03);
    transition.current = { fromTarget, toTarget, from, to, elapsed: reduced ? 1.1 : 0, finish };
    onMode(action === 'overview' ? 'resetting' : 'focusing');
    invalidate();
  }, [artifact.id, command.serial, focusRequest, reduced, camera, invalidate, isSpace, solarAspect, onMode]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    if (!orbit) return;
    light.current?.position.copy(camera.position).add(scratch.lightOffset);
    const movement = transition.current;
    if (movement) {
      movement.elapsed = Math.min(1.1, movement.elapsed + Math.min(delta, .05));
      const progress = easeAtlasFocus(movement.elapsed / 1.1);
      scratch.target.lerpVectors(movement.fromTarget, movement.toTarget, progress);
      scratch.spherical.set(
        THREE.MathUtils.lerp(movement.from.radius, movement.to.radius, progress),
        THREE.MathUtils.lerp(movement.from.phi, movement.to.phi, progress),
        THREE.MathUtils.lerp(movement.from.theta, movement.to.theta, progress),
      );
      scratch.offset.setFromSpherical(scratch.spherical);
      orbit.target.copy(scratch.target);
      camera.position.copy(scratch.target).add(scratch.offset);
      orbit.update();
      if (movement.elapsed >= 1.1) {
        transition.current = null;
        orbit.enableDamping = true;
        onMode(movement.finish);
        gl.domElement.dataset.focusedRecord = artifact.id;
        publishCamera();
        orbit.autoRotate = !isSpace && movement.finish === 'idle' && command.action === 'overview' && !reduced;
      }
      invalidate();
    } else if (orbit.autoRotate && !reduced) invalidate();
  });
  return <>
    <ambientLight intensity={.6} />
    <directionalLight ref={light} position={[4, 3, 5]} intensity={2.1} />
    {isSpace ? <SolarAtlas artifact={artifact} artifacts={artifacts} onSelect={onSelect} labels={labels} />
      : <Planet artifact={artifact} artifacts={artifacts} onSelect={onSelect} labels={labels} onTextureStatus={onTextureStatus} />}
    <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={isSpace ? .6 : 2.1} maxDistance={isSpace ? 350 : 8}
      enableDamping dampingFactor={.09} rotateSpeed={.55} zoomSpeed={.65} autoRotateSpeed={.3}
      onStart={() => {
        transition.current = null;
        if (controls.current) { controls.current.autoRotate = false; controls.current.enableDamping = true; }
        onMode('user-rotating');
      }}
      onEnd={() => { onMode('idle'); publishCamera(); }} />
  </>;
}

export function InteractivePlanetAtlas({ artifact, artifacts, onSelect, suspended = false, focusRequest = 0 }: AtlasProps) {
  const reduced = useReducedMotion();
  const [available, setAvailable] = useState(supportsWebGL2);
  const [labels, setLabels] = useState(true);
  const [mode, setMode] = useState<AtlasMotionState>('idle');
  const [textureStatus, setTextureStatus] = useState('NASA surface mosaic');
  const [hidden, setHidden] = useState(document.hidden);
  const [command, setCommand] = useState<Command>({ action: 'focus', serial: 0 });
  const setMotionMode = useCallback((state: AtlasMotionState) => setMode(state), []);
  const setImageryStatus = useCallback((status: string) => setTextureStatus(status), []);
  const unavailable = useCallback(() => setAvailable(false), []);
  const act = (action: AtlasAction) => setCommand(previous => ({ action, serial: previous.serial + 1 }));
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  const isSpace = artifact.volumeId === 'pioneer';
  const body = artifact.volumeId === 'surveyor' ? 'moon' : 'mars';
  const coordinate = artifact.coordinateData;
  const coordinatesText = coordinate ? `${coordinate.precision === 'region' ? 'Approx. ' : ''}${Math.abs(coordinate.latitude)}°${coordinate.latitude < 0 ? 'S' : 'N'} / ${Math.abs(coordinate.longitude)}°${coordinate.longitude < 0 ? 'W' : 'E'}` : 'No verified surface pin';
  return <div className="interactive-planet-atlas" data-motion-state={mode} data-selected-record={artifact.id} data-paused={suspended || hidden}>
    {isSpace && <p className="solar-reference-date">Reference snapshot · {SOLAR_REFERENCE_DATE}</p>}
    <div className="planet-atlas-viewport" tabIndex={0} role="region" aria-label={isSpace ? 'Interactive Solar System reference atlas' : `Interactive ${body} globe`}
      aria-describedby="atlas-gestures" onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !available) return;
        const action = ({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'zoom-in', '=': 'zoom-in', '-': 'zoom-out', Home: 'overview' } as Record<string, AtlasAction>)[event.key];
        if (action) { event.preventDefault(); act(action); }
      }}>
      <div className="atlas-viewport-labels"><span>{isSpace ? 'Solar System / mission context' : `${body} / surface atlas`}</span><span>{isSpace ? 'NASA/JPL' : 'NASA mosaic'}</span></div>
      {available ? <AtlasBoundary fallback={<AtlasUnavailable artifact={artifact} />}>
        <Canvas frameloop={suspended || hidden ? 'never' : 'demand'} dpr={[1, 1.5]} camera={{ position: [0, 1, isSpace ? 22 : 5.25], fov: 40, near: .01, far: isSpace ? 600 : 100 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#111f25');
            gl.domElement.setAttribute('aria-hidden', 'true');
          }} fallback={<AtlasUnavailable artifact={artifact} />}>
          <AtlasScene artifact={artifact} artifacts={artifacts} onSelect={onSelect} command={command} labels={labels} reduced={reduced} onMode={setMotionMode} onTextureStatus={setImageryStatus} onUnavailable={unavailable} focusRequest={focusRequest} />
        </Canvas>
      </AtlasBoundary> : <AtlasUnavailable artifact={artifact} />}
      <div className="atlas-viewport-bottom"><span>{isSpace ? 'Linear AU · symbols enlarged' : coordinatesText}</span><span aria-live="polite">{available ? mode === 'focusing' ? 'Focusing…' : mode === 'focused' ? (isSpace ? 'Orbit in view' : coordinate ? 'Location in view' : 'Overview in view') : mode === 'resetting' ? 'Returning to overview…' : 'Drag to explore' : 'Archive mode'}</span></div>
    </div>
    {available && <div className="planet-atlas-controls" role="group" aria-label="Atlas controls">
      <button onClick={() => act('left')} aria-label="Rotate atlas left"><ArrowLeft size={15} /></button>
      <button onClick={() => act('right')} aria-label="Rotate atlas right"><ArrowRight size={15} /></button>
      <button onClick={() => act('up')} aria-label="Rotate atlas up"><ArrowUp size={15} /></button>
      <button onClick={() => act('down')} aria-label="Rotate atlas down"><ArrowDown size={15} /></button>
      <button onClick={() => act('zoom-in')} aria-label="Zoom atlas in"><Plus size={16} /></button>
      <button onClick={() => act('zoom-out')} aria-label="Zoom atlas out"><Minus size={16} /></button>
      <button onClick={() => act('overview')} aria-label="Reset atlas to overview"><RotateCcw size={15} /></button>
      <button onClick={() => act('focus')} className="atlas-focus-control"><Focus size={15} />{isSpace || coordinate ? 'Focus mission' : 'Overview'}</button>
      <button onClick={() => setLabels(value => !value)} aria-label="Toggle atlas labels" aria-pressed={labels}><Eye size={15} /></button>
    </div>}
    {available && isSpace && <div className="solar-view-controls" role="group" aria-label="Solar System views">
      <button onClick={() => act('inner-system')}>Inner system</button>
      <button onClick={() => act('overview')}>All 8 planets</button>
    </div>}
    {isSpace && <p className="solar-scale-note">Inner planets cluster at full scale. Use Inner system for a closer view.</p>}
    <p id="atlas-gestures" className="atlas-gestures">{available ? 'Drag to rotate · scroll to zoom · arrow keys or buttons to explore.' : 'Choose another record from the timeline or the locations below.'}</p>
    <div className="atlas-location-buttons" role="group" aria-label="Select an atlas location">
      {artifacts.filter(record => record.coordinateData || record.spaceFocus).map(record => <button key={record.id} aria-pressed={record.id === artifact.id} onClick={() => onSelect(record.id)}>{record.title}</button>)}
    </div>
    <p className="atlas-provenance">{isSpace ? 'NASA/JPL Horizons · heliocentric J2000 ecliptic frame. Distances use a uniform AU scale; body symbols are enlarged, not physical sizes. Curves are osculating orbit guides at the reference date, not mission trajectories or live positions.' : textureStatus}{!isSpace && coordinate?.event ? ` · ${coordinate.event}` : ''}</p>
    {isSpace && <>
      <a className="atlas-imagery-source" href="https://ssd.jpl.nasa.gov/horizons/manual.html" target="_blank" rel="noopener noreferrer">Position and orbit source: NASA/JPL Horizons</a>
      <details className="solar-distance-key">
        <summary>Eight planets · distances from the Sun</summary>
        <dl>{SOLAR_ATLAS_BODIES.filter(item => item.kind === 'planet').map(item => <div key={item.id}>
          <dt><span style={{ backgroundColor: item.color }} />{item.name}</dt><dd>{Math.hypot(...item.position).toFixed(3)} AU</dd>
        </div>)}</dl>
        <p>At the reference date. 1 AU = 149,597,870.7 km. Small-body and spacecraft symbols mark Eros, Vesta, Ceres and Kepler; these are not planets.</p>
      </details>
    </>}
    {!isSpace && <a className="atlas-imagery-source" href={PLANET_TEXTURES[body].source} target="_blank" rel="noopener noreferrer">Surface map: {PLANET_TEXTURES[body].credit}</a>}
  </div>;
}
