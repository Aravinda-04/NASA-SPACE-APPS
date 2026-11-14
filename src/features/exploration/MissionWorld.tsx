import React, { Suspense, useEffect, useMemo } from 'react';
import { Billboard, Line, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { MissionWorldProps } from '../../types/expedition';
import { getFourStepGradientMap } from '../../utils/celShading';
import { VikingProceduralFallback } from '../../components/VikingHardwareRig';

// The decoder is shipped with the demo so neither model needs a third-party CDN.
const DECODER_PATH = '/vendor/draco/';
const CERES_GLOBE_IMAGE = new URL(
  '../../../Provided Resources/Dawn/images/pia20182_ceres_globe.jpg',
  import.meta.url,
).href;

function seeded(seed: number) {
  return () => {
    seed = Math.imul(1664525, seed) + 1013904223;
    return (seed >>> 0) / 4294967296;
  };
}

function Strut({ from, to, radius = 0.035, color = '#b9b6a8' }: {
  from: [number, number, number]; to: [number, number, number]; radius?: number; color?: string;
}) {
  const { middle, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const direction = b.clone().sub(a);
    return {
      middle: a.add(b).multiplyScalar(0.5),
      length: direction.length(),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
    };
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);
  return <mesh position={middle} quaternion={quaternion} castShadow>
    <cylinderGeometry args={[radius, radius, length, 6]} />
    <meshToonMaterial color={color} gradientMap={getFourStepGradientMap()} />
  </mesh>;
}

function Surface({ moon }: { moon: boolean }) {
  const details = useMemo(() => {
    const random = seeded(moon ? 67 : 2012);
    return Array.from({ length: 125 }, (_, i) => {
      const angle = random() * Math.PI * 2;
      const distance = 5 + random() * 68;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      return { x, z, scale: 0.1 + random() * (i % 9 === 0 ? 1.2 : 0.45), rotation: random() * 4 };
    }).filter(({ x, z }) => Math.hypot(x - 12, z + 9) > 3 && Math.hypot(x + 11, z + 10) > 3 && Math.hypot(x - 10, z + 7) > 2);
  }, [moon]);
  const hills = useMemo(() => {
    const random = seeded(moon ? 1203 : 8102);
    return Array.from({ length: 28 }, (_, i) => ({
      angle: (i / 28) * Math.PI * 2,
      distance: 75 + random() * 25,
      height: 7 + random() * 18,
      radius: 10 + random() * 15,
    }));
  }, [moon]);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
      <circleGeometry args={[180, 96]} />
      <meshToonMaterial color={moon ? '#aaa89d' : '#b8734f'} gradientMap={getFourStepGradientMap()} />
    </mesh>
    {details.map((rock, i) => <mesh key={i} position={[rock.x, rock.scale * 0.27, rock.z]} rotation={[0.25, rock.rotation, 0.1]} scale={[rock.scale, rock.scale * 0.7, rock.scale * 1.1]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={moon ? (i % 3 ? '#85857c' : '#c5c0ad') : (i % 3 ? '#89533c' : '#d49a6e')} gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    {hills.map((hill, i) => <mesh key={i} position={[Math.cos(hill.angle) * hill.distance, -3, Math.sin(hill.angle) * hill.distance]} scale={[hill.radius, hill.height, hill.radius]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshToonMaterial color={moon ? '#686c6c' : '#aa6649'} gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    {moon ? <mesh position={[-14, 0.005, -18]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[5.4, 6.3, 44]} /><meshToonMaterial color="#96958a" />
    </mesh> : null}
  </group>;
}

function StarField() {
  const geometry = useMemo(() => {
    const random = seeded(1972);
    const vertices: number[] = [];
    for (let i = 0; i < 850; i++) {
      const azimuth = random() * Math.PI * 2;
      const polar = Math.acos(2 * random() - 1);
      vertices.push(120 * Math.sin(polar) * Math.cos(azimuth), 120 * Math.cos(polar), 120 * Math.sin(polar) * Math.sin(azimuth));
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return result;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <points geometry={geometry}><pointsMaterial color="#e1dcca" size={0.12} sizeAttenuation transparent opacity={0.7} depthWrite={false} /></points>;
}

class ModelFallback extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function NormalizedModel({ path, span, grounded = true }: { path: string; span: number; grounded?: boolean }) {
  const { scene } = useGLTF(path, DECODER_PATH);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (!node.geometry?.attributes.position?.count) { node.visible = false; return; }
      const convert = (original: THREE.Material) => {
        const source = original as THREE.MeshStandardMaterial;
        return new THREE.MeshToonMaterial({
          color: source.color ? source.color.clone() : new THREE.Color('#d8d4c6'),
          map: source.map ?? null,
          gradientMap: getFourStepGradientMap(),
          transparent: source.transparent,
          opacity: source.opacity,
          side: source.side,
          alphaTest: source.alphaTest,
        });
      };
      node.material = Array.isArray(node.material) ? node.material.map(convert) : convert(node.material);
      node.castShadow = true;
      node.receiveShadow = true;
    });
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = span / Math.max(size.x, size.y, size.z, 0.001);
    const container = new THREE.Group();
    container.add(clone);
    clone.position.sub(center);
    if (grounded) clone.position.y += size.y / 2;
    container.scale.setScalar(scale);
    return container;
  }, [scene, span, grounded]);
  useEffect(() => () => {
    model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => material.dispose());
      }
    });
  }, [model]);
  return <primitive object={model} dispose={null} />;
}

function Surveyor() {
  const legs = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  return <group>
    <mesh position={[0, 1.05, 0]} castShadow><cylinderGeometry args={[0.54, 0.64, 0.4, 3]} /><meshToonMaterial color="#dfdbc8" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 0.68, 0]} castShadow><coneGeometry args={[0.25, 0.48, 10]} /><meshToonMaterial color="#4b5152" /></mesh>
    {legs.map((angle, i) => {
      const x = Math.cos(angle) * 1.65;
      const z = Math.sin(angle) * 1.65;
      return <group key={i}>
        <Strut from={[Math.cos(angle) * 0.4, 1.15, Math.sin(angle) * 0.4]} to={[x, 0.12, z]} radius={0.055} />
        <Strut from={[0, 0.75, 0]} to={[x, 0.12, z]} radius={0.027} />
        <mesh position={[x, 0.06, z]} receiveShadow><cylinderGeometry args={[0.32, 0.24, 0.1, 10]} /><meshToonMaterial color="#bcb8a2" gradientMap={getFourStepGradientMap()} /></mesh>
      </group>;
    })}
    <Strut from={[0, 1.1, 0]} to={[0.15, 2.8, -0.1]} radius={0.055} />
    <mesh position={[0.14, 2.55, -0.09]} rotation={[0.28, -0.35, 0]} castShadow><boxGeometry args={[1.05, 0.055, 0.62]} /><meshToonMaterial color="#273b4c" gradientMap={getFourStepGradientMap()} /></mesh>
    <Strut from={[-0.35, 0.9, 0.15]} to={[-1.4, 0.3, 0.9]} radius={0.045} />
    {/* The recovered scoop and camera are intentionally absent in the future scene. */}
    <mesh position={[-0.18, 1.7, 0.24]} castShadow><boxGeometry args={[0.2, 0.12, 0.16]} /><meshToonMaterial color="#7f827a" /></mesh>
    <mesh position={[0.3, 1.25, 0.15]} castShadow><boxGeometry args={[0.34, 0.32, 0.34]} /><meshToonMaterial color="#bca274" gradientMap={getFourStepGradientMap()} /></mesh>
  </group>;
}

function DescentStage() {
  return <group position={[12, 0, -9]} rotation={[0, 0.3, 0]}>
    <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[1.3, 1.3, 1.35, 8]} /><meshToonMaterial color="#b79b5c" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 1.71, 0]}><cylinderGeometry args={[0.95, 1.13, 0.08, 8]} /><meshToonMaterial color="#777973" /></mesh>
    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => <group key={i}>
      <Strut from={[Math.cos(angle) * 1.1, 1.3, Math.sin(angle) * 1.1]} to={[Math.cos(angle) * 2.5, 0.12, Math.sin(angle) * 2.5]} radius={0.065} color="#ddd0a4" />
      <mesh position={[Math.cos(angle) * 2.5, 0.06, Math.sin(angle) * 2.5]}><cylinderGeometry args={[0.4, 0.4, 0.08, 12]} /><meshToonMaterial color="#9a9a8b" /></mesh>
    </group>)}
  </group>;
}

function CuriositySchematic() {
  return <group>
    <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[1.5, 0.5, 2]} /><meshToonMaterial color="#e0dbca" gradientMap={getFourStepGradientMap()} /></mesh>
    {[-1, 1].flatMap((side) => [-0.8, 0, 0.8].map((z, i) => <group key={`${side}-${i}`}>
      <mesh position={[side, 0.35, z]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.35, 0.35, 0.25, 16]} /><meshToonMaterial color="#454842" /></mesh>
      <Strut from={[side * 0.6, 0.9, 0]} to={[side, 0.35, z]} />
    </group>))}
    <Strut from={[-0.35, 1.25, -0.3]} to={[-0.35, 2.15, -0.3]} radius={0.08} />
    <mesh position={[-0.35, 2.15, -0.3]}><boxGeometry args={[0.55, 0.28, 0.25]} /><meshToonMaterial color="#d5d0bf" /></mesh>
    <mesh position={[-0.35, 2.16, -0.15]}><boxGeometry args={[0.45, 0.13, 0.02]} /><meshToonMaterial color="#283c42" /></mesh>
  </group>;
}

function MarsArtifacts() {
  return <group>
    {/* An isolated schematic heat-shield exhibit links to the actual landing map. */}
    <group position={[-11, 0.13, -10]} rotation={[0.12, 0.3, 0.08]}>
      <mesh castShadow receiveShadow><cylinderGeometry args={[1.7, 1.5, 0.19, 24]} /><meshToonMaterial color="#5d4639" gradientMap={getFourStepGradientMap()} /></mesh>
      <mesh position={[0, 0.11, 0]}><cylinderGeometry args={[1.25, 1.6, 0.13, 24]} /><meshToonMaterial color="#a77953" gradientMap={getFourStepGradientMap()} /></mesh>
    </group>
    <group position={[10, 0, -7]}>
      <mesh position={[0, 0.13, 0]} scale={[1.6, 0.18, 1.05]} rotation={[0, 0.3, 0]} receiveShadow><dodecahedronGeometry args={[1.2, 0]} /><meshToonMaterial color="#b8a087" gradientMap={getFourStepGradientMap()} /></mesh>
      <mesh position={[0.18, 0.35, 0.05]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.06, 12]} /><meshBasicMaterial color="#3c3028" /></mesh>
    </group>
    {/* Parallel geometric trail is an illustrative HUD overlay, not recorded wheel tracks. */}
    {[-0.65, 0.65].map((x) => <Line key={x} points={[[x, 0.018, 3], [x + 0.6, 0.018, 5], [x + 2, 0.018, 7], [x + 4.4, 0.018, 9]]} color="#e5bb80" lineWidth={1} transparent opacity={0.4} dashed dashSize={0.18} gapSize={0.2} />)}
  </group>;
}

function ChryseArtifacts() {
  return <group>
    {/* Landmark "Big Joe" boulder at [-6.5, 0.45, -4.8] (flat-shaded low-poly vesicular basalt rock) */}
    <group position={[-6.5, 0.45, -4.8]} rotation={[0.15, 0.65, -0.1]}>
      <mesh scale={[1.85, 0.95, 1.45]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshToonMaterial color="#3E2723" gradientMap={getFourStepGradientMap()} />
      </mesh>
    </group>
    {/* Sandy Flats Soil Trench excavated by surface sampler */}
    <group position={[1.75, 0.012, 0.12]} rotation={[-Math.PI / 2, 0, 0.15]}>
      <mesh receiveShadow>
        <planeGeometry args={[0.9, 0.28]} />
        <meshToonMaterial color="#582318" gradientMap={getFourStepGradientMap()} />
      </mesh>
    </group>
    {/* Illustrative guide dashed line leading to trench */}
    <Line points={[[1.0, 0.018, 0.12], [1.75, 0.018, 0.12]]} color="#e5bb80" lineWidth={1} transparent opacity={0.4} dashed dashSize={0.15} gapSize={0.15} />
    {/* Illustrative facsimile camera panoramic sightline fanning toward Big Joe */}
    <Line points={[[-0.77, 1.05, 0.77], [-3.5, 0.75, -2.0], [-6.5, 0.45, -4.8]]} color="#00f0ff" lineWidth={1} transparent opacity={0.35} dashed dashSize={0.2} gapSize={0.25} />
  </group>;
}

export function IngenuityProceduralFallback() {
  const legs = [
    [-0.32, 0.05, -0.32],
    [0.32, 0.05, -0.32],
    [-0.32, 0.05, 0.32],
    [0.32, 0.05, 0.32],
  ] as const;
  return (
    <group>
      {/* Fuselage core cube */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.18, 0.22]} />
        <meshToonMaterial color="#c59b48" gradientMap={getFourStepGradientMap()} />
      </mesh>
      {/* Sensor pod / downward NAVCAM */}
      <mesh position={[0.06, 0.12, 0]} castShadow>
        <boxGeometry args={[0.07, 0.06, 0.07]} />
        <meshToonMaterial color="#2d3338" />
      </mesh>
      {/* 4 Carbon-composite landing legs & footpads */}
      {legs.map(([x, y, z], i) => (
        <group key={i}>
          <Strut from={[x * 0.3, 0.22, z * 0.3]} to={[x, y, z]} radius={0.016} color="#1b1e22" />
          <mesh position={[x, y * 0.5, z]} receiveShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.015, 8]} />
            <meshToonMaterial color="#33383d" />
          </mesh>
        </group>
      ))}
      {/* Coaxial rotor mast */}
      <Strut from={[0, 0.28, 0]} to={[0, 0.67, 0]} radius={0.02} color="#a6b0b5" />
      {/* Lower counter-rotating rotor pair */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.2, 0.012, 0.06]} />
        <meshToonMaterial color="#1b1e22" gradientMap={getFourStepGradientMap()} />
      </mesh>
      {/* Upper counter-rotating rotor pair */}
      <mesh position={[0, 0.54, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[1.2, 0.012, 0.06]} />
        <meshToonMaterial color="#1b1e22" gradientMap={getFourStepGradientMap()} />
      </mesh>
      {/* Solar panel array on top */}
      <mesh position={[0, 0.68, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.015, 0.32]} />
        <meshToonMaterial color="#1b2533" gradientMap={getFourStepGradientMap()} />
      </mesh>
    </group>
  );
}

function JezeroArtifacts() {
  return (
    <group>
      {/* Wright Brothers Field (Airfield 1) circular takeoff marker at [2.2, 0.012, 1.8] */}
      <group position={[2.2, 0.012, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh receiveShadow>
          <ringGeometry args={[0.7, 0.78, 36]} />
          <meshToonMaterial color="#e5bb80" transparent opacity={0.7} />
        </mesh>
        <mesh receiveShadow>
          <circleGeometry args={[0.15, 18]} />
          <meshToonMaterial color="#e5bb80" transparent opacity={0.6} />
        </mesh>
      </group>
      {/* Autonomous visual odometry flight corridor / HUD overlay dashed track */}
      <Line
        points={[
          [0, 0.018, 0],
          [1.2, 0.018, -1.0],
          [2.8, 0.018, -2.4],
          [4.5, 0.018, -3.8],
        ]}
        color="#e5bb80"
        lineWidth={1}
        transparent
        opacity={0.4}
        dashed
        dashSize={0.2}
        gapSize={0.2}
      />
      {/* Neretva Vallis sand ripple dune at Flight 72 final landing site */}
      <group position={[-5.5, 0.18, -4.8]} rotation={[0.08, 0.45, -0.05]}>
        <mesh scale={[2.8, 0.45, 1.6]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshToonMaterial color="#a86848" gradientMap={getFourStepGradientMap()} />
        </mesh>
      </group>
    </group>
  );
}

export function NearShoemakerProceduralFallback() {
  return (
    <group>
      {/* Central rectangular bus with gold thermal insulation */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.4, 1.7]} />
        <meshToonMaterial color="#c89f4b" gradientMap={getFourStepGradientMap()} />
      </mesh>
      {/* 1.5m parabolic high-gain dish on top (+Y) */}
      <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.75, 0.15, 0.25, 24, 1, true]} />
        <meshToonMaterial color="#dfdccb" side={THREE.DoubleSide} gradientMap={getFourStepGradientMap()} />
      </mesh>
      <Strut from={[0, 0.7, 0]} to={[0, 1.35, 0]} radius={0.025} color="#9fa3a6" />
      {/* 4 Gallium-arsenide solar array panels (5.6m wingspan) */}
      <mesh position={[-2.4, 0.1, 0]} castShadow>
        <boxGeometry args={[2.0, 0.02, 1.1]} />
        <meshToonMaterial color="#1a324b" gradientMap={getFourStepGradientMap()} />
      </mesh>
      <mesh position={[2.4, 0.1, 0]} castShadow>
        <boxGeometry args={[2.0, 0.02, 1.1]} />
        <meshToonMaterial color="#1a324b" gradientMap={getFourStepGradientMap()} />
      </mesh>
      <mesh position={[0, 0.1, -2.4]} castShadow>
        <boxGeometry args={[1.1, 0.02, 2.0]} />
        <meshToonMaterial color="#1a324b" gradientMap={getFourStepGradientMap()} />
      </mesh>
      <mesh position={[0, 0.1, 2.4]} castShadow>
        <boxGeometry args={[1.1, 0.02, 2.0]} />
        <meshToonMaterial color="#1a324b" gradientMap={getFourStepGradientMap()} />
      </mesh>
      {/* Forward science instrument deck and sensors */}
      <mesh position={[0.7, -0.6, 0.7]} castShadow>
        <boxGeometry args={[0.45, 0.35, 0.45]} />
        <meshToonMaterial color="#4a4f55" />
      </mesh>
    </group>
  );
}

function ErosAsteroid() {
  const geometry = useMemo(() => {
    const radius = 9.5;
    const geom = new THREE.IcosahedronGeometry(radius, 2);
    const pos = geom.attributes.position;

    function pnoise(x: number, y: number, z: number) {
      return (
        Math.sin(x * 0.45 + y * 0.25) * Math.cos(y * 0.35 + z * 0.45) +
        Math.sin(z * 0.55 + x * 0.35) * 0.5
      );
    }

    for (let i = 0; i < pos.count; i++) {
      const x0 = pos.getX(i);
      const y0 = pos.getY(i);
      const z0 = pos.getZ(i);
      const len = Math.hypot(x0, y0, z0) || 1;
      const dx = x0 / len;
      const dy = y0 / len;
      const dz = z0 / len;

      // Elongate along X (Eros 3.1 : 1.0 : 1.0 aspect ratio)
      let lx = dx * radius * 2.2;
      let ly = dy * radius * 0.85;
      let lz = dz * radius * 0.95;

      // Waist / saddle indentation at center (creates iconic peanut shape of Eros)
      const waist = 1.0 - 0.32 * Math.exp(-(lx * lx) / (radius * radius * 0.7));
      ly *= waist;
      lz *= waist;

      // Subtle arc curvature along body
      ly += Math.sin((lx / (radius * 2.2)) * Math.PI) * (radius * 0.18);

      // Chiseled rocky facet displacement
      const n = pnoise(lx * 0.25, ly * 0.25, lz * 0.25) * 1.6;
      lx += dx * n;
      ly += dy * n;
      lz += dz * n;

      // Impact crater depression (Shoemaker crater)
      const cDist = Math.hypot(lx - radius * 0.8, ly - radius * 0.2, lz - radius * 0.5);
      if (cDist < radius * 0.5) {
        const depth = Math.cos((cDist / (radius * 0.5)) * (Math.PI / 2)) * 2.2;
        lx -= dx * depth;
        ly -= dy * depth;
        lz -= dz * depth;
      }

      pos.setXYZ(i, lx, ly, lz);
    }

    geom.computeVertexNormals();
    return geom;
  }, []);

  return (
    <group position={[14, -22, -32]} rotation={[0.4, 0.6, -0.3]}>
      {/* Faceted celestial asteroid 433 Eros */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshToonMaterial
          color="#6e675b"
          gradientMap={getFourStepGradientMap()}
        />
      </mesh>
      {/* Flat regolith "dust pond" inside the crater */}
      <mesh position={[7.5, 2.2, 3.8]} rotation={[-0.4, 0.8, 0.2]}>
        <circleGeometry args={[2.0, 16]} />
        <meshToonMaterial color="#4d473d" />
      </mesh>
      {/* Small micro-meteorite rocks drifting in orbital proximity */}
      {[-8, -3, 6, 12].map((x, i) => (
        <mesh
          key={i}
          position={[x * 1.5, 8 + (i % 3) * 3, -4 + i * 2]}
          rotation={[0.3 * i, 0.7 * i, 0.1]}
          scale={0.45 + (i % 2) * 0.35}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshToonMaterial color="#554e44" gradientMap={getFourStepGradientMap()} />
        </mesh>
      ))}
      {/* Illustrative gold orbital approach arc */}
      <Line
        points={[
          [-28, 12, 10],
          [-14, 16, 5],
          [0, 18, 14],
          [16, 15, 8],
          [28, 8, -2],
        ]}
        color="#c9a04a"
        lineWidth={1}
        transparent
        opacity={0.3}
        dashed
        dashSize={0.4}
        gapSize={0.3}
      />
    </group>
  );
}

function CeresContext() {
  const texture = useTexture(CERES_GLOBE_IMAGE);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  return <group>
    {/* NASA enhanced-color globe composite. Its black field blends into the scene;
        a shaded sphere behind it keeps a dimensional silhouette from side views. */}
    <mesh position={[7, -4, -10.45]}>
      <sphereGeometry args={[5.45, 64, 48]} />
      <meshStandardMaterial color="#393b38" roughness={1} metalness={0} />
    </mesh>
    <mesh position={[7, -4, -4.9]}>
      <planeGeometry args={[17.78, 10]} />
      <shaderMaterial
        uniforms={{ ceresMap: { value: texture } }}
        transparent
        depthWrite={false}
        toneMapped={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D ceresMap;
          varying vec2 vUv;
          void main() {
            vec4 texel = texture2D(ceresMap, vUv);
            float brightness = max(texel.r, max(texel.g, texel.b));
            float keyedAlpha = smoothstep(0.025, 0.085, brightness);
            if (keyedAlpha < 0.02) discard;
            gl_FragColor = vec4(texel.rgb, keyedAlpha);
            #include <colorspace_fragment>
          }
        `}
      />
    </mesh>
    {/* A restrained highlight sits over Occator's visible bright deposit. The
        mission discovery marker is placed at this same world-space point. */}
    <mesh position={[4.85, -4.3, -4.75]}>
      <ringGeometry args={[0.24, 0.36, 28]} />
      <meshBasicMaterial color="#dff8ff" transparent opacity={0.72} depthTest={false} />
    </mesh>
    <Line points={[[-10, 7, -2], [-3, 10, -6], [4, 8, -9], [10, 3, -8], [15, -4, -4]]} color="#8fb8c9" lineWidth={1} transparent opacity={0.28} dashed dashSize={0.4} gapSize={0.3} />
  </group>;
}

function DawnProceduralFallback() {
  return <group>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.7, 1.4]} />
      <meshToonMaterial color="#b9a66e" gradientMap={getFourStepGradientMap()} />
    </mesh>
    {[-3.4, 3.4].map((x) => <mesh key={x} position={[x, 0, 0]} castShadow>
      <boxGeometry args={[4.8, 0.06, 1.35]} />
      <meshToonMaterial color="#243e61" gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.7, 0.16, 0.22, 24, 1, true]} />
      <meshToonMaterial color="#d6d5ca" side={THREE.DoubleSide} gradientMap={getFourStepGradientMap()} />
    </mesh>
    <mesh position={[0, -1, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.22, 0.32, 0.5, 20]} />
      <meshToonMaterial color="#626b72" gradientMap={getFourStepGradientMap()} />
    </mesh>
    <mesh position={[0, -1.35, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.32, 1.5, 18, 1, true]} />
      <meshBasicMaterial color="#7bd9ed" transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  </group>;
}

function KeplerProceduralFallback() {
  return <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1.15, 0.8, 2.8, 24]} />
      <meshToonMaterial color="#c8b784" gradientMap={getFourStepGradientMap()} />
    </mesh>
    <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.2, 1.2, 0.12, 32]} />
      <meshToonMaterial color="#343b43" gradientMap={getFourStepGradientMap()} />
    </mesh>
    <mesh position={[0, -1.35, 0]}>
      <boxGeometry args={[1.55, 0.65, 1.45]} />
      <meshToonMaterial color="#a38b56" gradientMap={getFourStepGradientMap()} />
    </mesh>
    {[-2.8, 2.8].map((x) => <mesh key={x} position={[x, -1.25, 0]}>
      <boxGeometry args={[4.2, 0.05, 1.25]} />
      <meshToonMaterial color="#263d61" gradientMap={getFourStepGradientMap()} />
    </mesh>)}
  </group>;
}

function KeplerObservationField() {
  const geometry = useMemo(() => {
    const random = seeded(2009);
    const vertices: number[] = [];
    const colors: number[] = [];
    for (let i = 0; i < 260; i++) {
      const depth = -15 - random() * 22;
      const spread = 5 + Math.abs(depth + 15) * 0.18;
      vertices.push((random() - 0.5) * spread * 2, (random() - 0.5) * spread * 1.35 + 2, depth);
      const warmth = random();
      colors.push(0.72 + warmth * 0.28, 0.78 + warmth * 0.2, 0.9 + (1 - warmth) * 0.1);
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return result;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const orbit = useMemo(() => Array.from({ length: 49 }, (_, index) => {
    const angle = index / 48 * Math.PI * 2;
    return [Math.cos(angle) * 1.05, 1.8 + Math.sin(angle) * 0.42, -9.5] as [number, number, number];
  }), []);
  return <group>
    <points geometry={geometry}>
      <pointsMaterial vertexColors size={0.1} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
    {[
      [-7, -2, -25], [7, -2, -25], [-7, 7, -25], [7, 7, -25],
    ].map((target, index) => <Line key={index} points={[[0, 1.4, -0.8], target as [number, number, number]]} color="#648fbb" lineWidth={1} transparent opacity={0.18} dashed dashSize={0.35} gapSize={0.4} />)}
    <mesh position={[0, 1.8, -9.5]}>
      <sphereGeometry args={[0.48, 24, 18]} />
      <meshBasicMaterial color="#fff0b0" />
    </mesh>
    <Line points={orbit} color="#9bc7e8" lineWidth={1} transparent opacity={0.7} />
    <mesh position={[1.05, 1.8, -9.5]}>
      <sphereGeometry args={[0.13, 16, 12]} />
      <meshToonMaterial color="#5f83a3" gradientMap={getFourStepGradientMap()} />
    </mesh>
    <Line points={[[0, -3.1, 1.6], [2.6, -3.1, 1.6], [4.2, -3.1, 1.6]]} color="#f7d27c" lineWidth={2} transparent opacity={0.55} />
    <Line points={[[0, -3.45, 1.1], [2.6, -3.45, 1.1], [4.2, -3.45, 1.1]]} color="#f7d27c" lineWidth={2} transparent opacity={0.38} />
  </group>;
}

function PioneerSchematic() {
  return <group>
    <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.35, 0.35, 0.38, 40, 1, true]} /><meshToonMaterial color="#dfdccb" side={THREE.DoubleSide} gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 0.2, -0.4]}><cylinderGeometry args={[0.45, 0.45, 0.7, 6]} /><meshToonMaterial color="#b28b4f" gradientMap={getFourStepGradientMap()} /></mesh>
    <Strut from={[0, 0.4, 0]} to={[-4, 0, 0]} color="#bdc2b8" />
    <Strut from={[0, 0.4, 0]} to={[3, 1.7, -1]} color="#bdc2b8" />
    <Strut from={[0, 0.4, 0]} to={[0, 4, -1.1]} color="#bdc2b8" />
    {[-3.5, -4].map((x) => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.17, 0.17, 0.55, 12]} /><meshToonMaterial color="#545851" /></mesh>)}
    <mesh position={[0, -0.4, 0.65]}><boxGeometry args={[0.4, 0.26, 0.02]} /><meshToonMaterial color="#c9ab6d" /></mesh>
  </group>;
}

function DiscoveryMarker({ position, selected, discovered, accent, onClick }: {
  position: [number, number, number]; selected: boolean; discovered: boolean; accent: string; onClick: () => void;
}) {
  const color = selected ? '#fff3d4' : discovered ? '#86bfb4' : accent;
  return <group position={[position[0], position[1] + 0.65, position[2]]} onClick={(event) => { event.stopPropagation(); onClick(); }}>
    <Billboard>
      <mesh><ringGeometry args={[selected ? 0.17 : 0.11, selected ? 0.2 : 0.14, 28]} /><meshBasicMaterial color={color} depthTest={false} transparent opacity={0.95} /></mesh>
      <mesh><circleGeometry args={[0.055, 16]} /><meshBasicMaterial color={color} depthTest={false} /></mesh>
      <mesh visible={false}><circleGeometry args={[0.45, 16]} /><meshBasicMaterial /></mesh>
    </Billboard>
    <mesh position={[0, -0.25, 0]}><cylinderGeometry args={[0.008, 0.008, 0.3, 5]} /><meshBasicMaterial color={color} transparent opacity={0.55} /></mesh>
  </group>;
}

export function MissionWorld({ mission, selectedId, discoveredIds, onSelect }: MissionWorldProps) {
  const isNear = mission.id === 'near';
  const isDawn = mission.id === 'dawn';
  const isKepler = mission.id === 'kepler';
  const space = mission.id === 'pioneer' || isNear || isDawn || isKepler;
  const moon = mission.id === 'surveyor';
  return <>
    <color attach="background" args={[space ? '#090f1b' : moon ? '#111820' : '#c69273']} />
    {!space ? <fog attach="fog" args={[moon ? '#283138' : '#c69273', 42, 150]} /> : null}
    <ambientLight intensity={space ? 1.1 : 0.7} color={space ? '#b7c8df' : '#fff0d6'} />
    <hemisphereLight args={[moon ? '#cdd8de' : '#f5d9b0', moon ? '#4f5557' : '#69402d', 1.15]} />
    <directionalLight position={[-12, 16, 8]} intensity={space ? 2.5 : 3} color="#fff4dd" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-bias={-0.001} />
    {space || moon ? <StarField /> : null}
    {!space ? <Surface moon={moon} /> : null}
    {moon ? <><Surveyor /><DescentStage /></> : null}
    {mission.id === 'curiosity' ? <>
      <ModelFallback fallback={<CuriositySchematic />}><Suspense fallback={<CuriositySchematic />}><NormalizedModel path="/models/curiosity.glb" span={3.3} /></Suspense></ModelFallback>
      <MarsArtifacts />
    </> : null}
    {mission.id === 'viking' ? <>
      <ModelFallback fallback={<VikingProceduralFallback />}><Suspense fallback={<VikingProceduralFallback />}><NormalizedModel path="/models/Viking Lander.glb" span={3.6} /></Suspense></ModelFallback>
      <ChryseArtifacts />
    </> : null}
    {mission.id === 'ingenuity' ? <>
      <ModelFallback fallback={<IngenuityProceduralFallback />}><Suspense fallback={<IngenuityProceduralFallback />}><NormalizedModel path="/models/ingenuity.glb" span={1.4} /></Suspense></ModelFallback>
      <JezeroArtifacts />
    </> : null}
    {mission.id === 'pioneer' ? <ModelFallback fallback={<PioneerSchematic />}><Suspense fallback={<PioneerSchematic />}><NormalizedModel path="/models/pioneer.glb" span={8} grounded={false} /></Suspense></ModelFallback> : null}
    {isNear ? (
      <>
        <ModelFallback fallback={<NearShoemakerProceduralFallback />}><Suspense fallback={<NearShoemakerProceduralFallback />}><NormalizedModel path="/models/NEAR Shoemaker.glb" span={5.5} grounded={false} /></Suspense></ModelFallback>
        <ErosAsteroid />
      </>
    ) : null}
    {isDawn ? <>
      <ModelFallback fallback={<DawnProceduralFallback />}><Suspense fallback={<DawnProceduralFallback />}><NormalizedModel path="/models/Dawn.glb" span={8} grounded={false} /></Suspense></ModelFallback>
      <CeresContext />
    </> : null}
    {isKepler ? <>
      <ModelFallback fallback={<KeplerProceduralFallback />}><Suspense fallback={<KeplerProceduralFallback />}><NormalizedModel path="/models/Kepler (A).glb" span={7} grounded={false} /></Suspense></ModelFallback>
      <KeplerObservationField />
    </> : null}
    {mission.discoveries.map((discovery) => <DiscoveryMarker key={discovery.id} position={discovery.position} selected={selectedId === discovery.id} discovered={discoveredIds.includes(discovery.id)} accent={mission.accent} onClick={() => onSelect(discovery.id)} />)}
  </>;
}
