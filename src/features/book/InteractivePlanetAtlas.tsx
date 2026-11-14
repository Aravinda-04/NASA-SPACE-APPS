import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, Focus, Minus, Plus, RotateCcw } from "lucide-react";
import type { ChronologicalArtifact } from "../../data/chronologicalArtifacts";
import { PLANET_TEXTURES, SOLAR_ATLAS_BODIES } from "../../data/atlas";
import { easeAtlasFocus, planetCoordinateToVector, shortestAngleDelta, type AtlasMotionState } from "../../utils/planetCoordinates";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ArtifactAtlasPreview } from "./ArtifactAtlasPreview";

type AtlasAction = "focus" | "overview" | "zoom-in" | "zoom-out" | "left" | "right" | "up" | "down";
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

function SolarAtlas({ artifact, artifacts, onSelect, labels }: AtlasProps & { labels: boolean }) {
  const selected = SOLAR_ATLAS_BODIES.find(body => body.id === artifact.spaceFocus);
  const earth = SOLAR_ATLAS_BODIES.find(body => body.id === 'earth')!;
  const destination = selected?.position ?? [0, 0, 0];
  const connection = useMemo(() => [
    [...earth.position] as [number, number, number],
    [destination[0] * .4, .6, destination[2] * .4] as [number, number, number],
    [...destination] as [number, number, number],
  ], [destination]);
  return <>
    {[1.35, 2.08, 3.58, 5].map(radius => <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - .006, radius + .006, 128]} />
      <meshBasicMaterial color="#96a8b3" side={THREE.DoubleSide} transparent opacity={.28} />
    </mesh>)}
    <Line points={connection} color="#e1bc7b" lineWidth={1.5} dashed dashSize={.1} gapSize={.12} />
    {SOLAR_ATLAS_BODIES.map(body => <group key={body.id} position={[...body.position]}>
      <mesh onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const record = artifacts.find(item => item.spaceFocus === body.id);
        if (record && event.delta < 5) onSelect(record.id);
      }}>
        <sphereGeometry args={[body.size, 28, 20]} />
        {body.id === 'sun' ? <meshBasicMaterial color={body.color} /> : <meshStandardMaterial color={body.color} roughness={.85} />}
      </mesh>
      {selected?.id === body.id && <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[body.size + .13, body.size + .15, 48]} /><meshBasicMaterial color="#ffe0a1" side={THREE.DoubleSide} />
      </mesh>}
      {labels && <Html center position={[0, body.size + .25, 0]} style={{ pointerEvents: 'none' }}>
        <span className={`solar-body-label ${selected?.id === body.id ? 'is-selected' : ''}`}>{body.name}</span>
      </Html>}
    </group>)}
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
  const { camera, invalidate, gl } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const light = useRef<THREE.DirectionalLight>(null);
  const transition = useRef<Transition | null>(null);
  const lastRecord = useRef('');
  const lastFocusRequest = useRef(-1);
  const isSpace = artifact.volumeId === 'pioneer';
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
    if (action === 'overview' || action === 'focus') {
      toTarget.set(0, 0, 0);
      if (isSpace) {
        const body = SOLAR_ATLAS_BODIES.find(item => item.id === artifact.spaceFocus);
        if (action === 'focus' && body) toTarget.set(body.position[0], body.position[1], body.position[2]);
        to.setFromVector3(new THREE.Vector3(action === 'overview' ? 7 : 2.6, action === 'overview' ? 8 : 2.4, action === 'overview' ? 10 : 3.4));
      } else if (action === 'focus' && artifact.coordinateData) {
        const coordinate = artifact.coordinateData;
        to.setFromVector3(new THREE.Vector3(...planetCoordinateToVector(coordinate.latitude, coordinate.longitude, 4.7)));
      } else to.setFromVector3(new THREE.Vector3(0, .45, 5.7));
      finish = action === 'focus' ? 'focused' : 'idle';
    } else if (action === 'zoom-in' || action === 'zoom-out') {
      to.radius = THREE.MathUtils.clamp(from.radius * (action === 'zoom-in' ? .8 : 1.25), isSpace ? 1.2 : 2.1, isSpace ? 22 : 8);
    } else {
      if (action === 'left' || action === 'right') to.theta += (action === 'left' ? -1 : 1) * Math.PI / 8;
      else to.phi = THREE.MathUtils.clamp(to.phi + (action === 'up' ? -1 : 1) * Math.PI / 12, .04, Math.PI - .04);
    }
    to.theta = from.theta + shortestAngleDelta(from.theta, to.theta);
    to.phi = THREE.MathUtils.clamp(to.phi, .03, Math.PI - .03);
    transition.current = { fromTarget, toTarget, from, to, elapsed: reduced ? 1.1 : 0, finish };
    onMode(action === 'overview' ? 'resetting' : 'focusing');
    invalidate();
  }, [artifact.id, command.serial, focusRequest, reduced, camera, invalidate, isSpace, onMode]);

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
        orbit.autoRotate = movement.finish === 'idle' && command.action === 'overview' && !reduced;
      }
      invalidate();
    } else if (orbit.autoRotate && !reduced) invalidate();
  });
  return <>
    <ambientLight intensity={.6} />
    <directionalLight ref={light} position={[4, 3, 5]} intensity={2.1} />
    {isSpace ? <SolarAtlas artifact={artifact} artifacts={artifacts} onSelect={onSelect} labels={labels} />
      : <Planet artifact={artifact} artifacts={artifacts} onSelect={onSelect} labels={labels} onTextureStatus={onTextureStatus} />}
    <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={isSpace ? 1.2 : 2.1} maxDistance={isSpace ? 22 : 8}
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
    <div className="planet-atlas-viewport" tabIndex={0} role="region" aria-label={isSpace ? 'Interactive Solar System schematic' : `Interactive ${body} globe`}
      aria-describedby="atlas-gestures" onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !available) return;
        const action = ({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'zoom-in', '=': 'zoom-in', '-': 'zoom-out', Home: 'overview' } as Record<string, AtlasAction>)[event.key];
        if (action) { event.preventDefault(); act(action); }
      }}>
      <div className="atlas-viewport-labels"><span>{isSpace ? 'Solar System / mission context' : `${body} / surface atlas`}</span><span>{isSpace ? 'Schematic' : 'NASA mosaic'}</span></div>
      {available ? <AtlasBoundary fallback={<AtlasUnavailable artifact={artifact} />}>
        <Canvas frameloop={suspended || hidden ? 'never' : 'demand'} dpr={[1, 1.5]} camera={{ position: [0, 1, isSpace ? 12 : 5.25], fov: 40, near: .05, far: 100 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#111f25');
            gl.domElement.setAttribute('aria-hidden', 'true');
          }} fallback={<AtlasUnavailable artifact={artifact} />}>
          <AtlasScene artifact={artifact} artifacts={artifacts} onSelect={onSelect} command={command} labels={labels} reduced={reduced} onMode={setMotionMode} onTextureStatus={setImageryStatus} onUnavailable={unavailable} focusRequest={focusRequest} />
        </Canvas>
      </AtlasBoundary> : <AtlasUnavailable artifact={artifact} />}
      <div className="atlas-viewport-bottom"><span>{isSpace ? 'Illustrative placements · no live position' : coordinatesText}</span><span aria-live="polite">{available ? mode === 'focusing' ? 'Focusing…' : mode === 'focused' ? (isSpace || coordinate ? 'Location in view' : 'Overview in view') : mode === 'resetting' ? 'Returning to overview…' : 'Drag to explore' : 'Archive mode'}</span></div>
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
    <p id="atlas-gestures" className="atlas-gestures">{available ? 'Drag to rotate · scroll to zoom · arrow keys or buttons to explore.' : 'Choose another record from the timeline or the locations below.'}</p>
    <div className="atlas-location-buttons" role="group" aria-label="Select an atlas location">
      {artifacts.filter(record => record.coordinateData || record.spaceFocus).map(record => <button key={record.id} aria-pressed={record.id === artifact.id} onClick={() => onSelect(record.id)}>{record.title}</button>)}
    </div>
    <p className="atlas-provenance">{isSpace ? 'Historical journey schematic. Orbital rings, body sizes, angles and connecting paths are illustrative, not to scale and not ephemerides.' : textureStatus}{!isSpace && coordinate?.event ? ` · ${coordinate.event}` : ''}</p>
    {!isSpace && <a className="atlas-imagery-source" href={PLANET_TEXTURES[body].source} target="_blank" rel="noopener noreferrer">Surface map: {PLANET_TEXTURES[body].credit}</a>}
  </div>;
}
