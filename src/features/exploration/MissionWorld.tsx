import React, { Suspense, useEffect, useMemo } from 'react';
import { Billboard, Line, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { MissionWorldProps } from '../../types/expedition';
import { getFourStepGradientMap } from '../../utils/celShading';
import { VikingProceduralFallback } from '../../components/VikingHardwareRig';

// The decoder is shipped with the demo so neither model needs a third-party CDN.
const DECODER_PATH = '/vendor/draco/';
const SURVEYOR_RECOVERY_IMAGE = new URL(
  '../../../Provided Resources/Surveyor 3/images/as12-48-7134_conrad_surveyor3.jpg',
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

function SurveyorSiteSurface() {
  const rocks = useMemo(() => {
    const random = seeded(19670420);
    return Array.from({ length: 72 }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const distance = 4 + random() * 44;
      return {
        position: [Math.cos(angle) * distance, 0.08 + random() * 0.28, Math.sin(angle) * distance] as [number, number, number],
        scale: 0.12 + random() * (index % 13 === 0 ? 0.9 : 0.38),
        rotation: random() * Math.PI,
      };
    });
  }, []);
  const traverse = useMemo(() => Array.from({ length: 22 }, (_, index) => {
    const t = index / 21;
    return {
      x: 11.3 * (1 - t) + Math.sin(t * Math.PI * 3) * 0.32,
      z: -8.2 * (1 - t),
      side: index % 2 ? 0.18 : -0.18,
      rotation: -0.65 + Math.sin(t * 4) * 0.12,
    };
  }), []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
      <circleGeometry args={[130, 96]} />
      <meshToonMaterial color="#8f8f87" gradientMap={getFourStepGradientMap()} />
    </mesh>
    {/* Surveyor rests inside a shallow crater; concentric broken rims establish the site. */}
    <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[11.2, 14.4, 64]} />
      <meshToonMaterial color="#696b69" gradientMap={getFourStepGradientMap()} />
    </mesh>
    <mesh position={[0, -0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[11.2, 64]} />
      <meshToonMaterial color="#a4a29a" gradientMap={getFourStepGradientMap()} />
    </mesh>
    {rocks.map((rock, index) => <mesh key={index} position={rock.position} scale={[rock.scale * 1.25, rock.scale * 0.7, rock.scale]} rotation={[0.08, rock.rotation, 0.04]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={index % 4 ? '#777871' : '#b1aea3'} gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    {/* Apollo 12 EVA traverse: alternating boot impressions lead from Intrepid to Surveyor. */}
    {traverse.map((step, index) => <mesh key={`step-${index}`} position={[step.x + step.side, 0.016, step.z]} rotation={[-Math.PI / 2, 0, step.rotation]}>
      <planeGeometry args={[0.22, 0.48]} />
      <meshBasicMaterial color="#555854" transparent opacity={0.58} />
    </mesh>)}
    <Line points={[[11.5, 0.08, -8.5], [8, 0.12, -6], [4.2, 0.1, -3.1], [0, 0.12, 0]]} color="#d9d7ca" lineWidth={1} transparent opacity={0.26} dashed dashSize={0.18} gapSize={0.32} />
    {/* The sampler's disturbed-soil area remains, while the recovered scoop itself does not. */}
    <group position={[-1.7, 0.025, 1]} rotation={[-Math.PI / 2, 0, -0.2]}>
      <mesh><planeGeometry args={[1.55, 0.62]} /><meshBasicMaterial color="#5c5e59" transparent opacity={0.72} /></mesh>
      {[-0.42, 0, 0.42].map(offset => <mesh key={offset} position={[offset, 0, 0.006]}><planeGeometry args={[0.08, 0.58]} /><meshBasicMaterial color="#b4b1a5" transparent opacity={0.38} /></mesh>)}
    </group>
  </group>;
}

function LunarBackdrop({ variant }: { variant: 'apollo12' | 'recovery' }) {
  const rocks = useMemo(() => {
    const random = seeded(variant === 'apollo12' ? 19691119 : 19691120);
    return Array.from({ length: 46 }, (_, index) => ({
      position: [(random() - 0.5) * 70, 0.08 + random() * 0.28, -9 - random() * 42] as [number, number, number],
      scale: 0.12 + random() * (index % 12 === 0 ? 1.1 : 0.42),
      rotation: random() * Math.PI,
    }));
  }, [variant]);
  const earthPosition: [number, number, number] = variant === 'apollo12' ? [-24, 20, -68] : [24, 17, -64];
  return <group>
    {/* Layered irregular ridges replace the empty horizon while remaining
        explicitly illustrative rather than georeferenced lunar topography. */}
    {Array.from({ length: 17 }, (_, index) => {
      const x = -52 + index * 6.5;
      const height = 3.5 + ((index * 7) % 5) * 1.3;
      return <mesh key={`lunar-ridge-${index}`} position={[x, -2.7 + height * 0.36, -54 - Math.abs(index - 8) * 0.9]} scale={[6.8, height, 8]} rotation={[0.04, index * 0.17, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshToonMaterial color={index % 3 === 0 ? '#626764' : index % 2 ? '#747772' : '#85857e'} gradientMap={getFourStepGradientMap()} />
      </mesh>;
    })}
    {rocks.map((rock, index) => <mesh key={`lunar-rock-${index}`} position={rock.position} scale={[rock.scale * 1.35, rock.scale * 0.62, rock.scale]} rotation={[0.08, rock.rotation, 0.04]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={index % 5 === 0 ? '#b0ada4' : '#696c68'} gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    {variant === 'apollo12' ? <>
      <mesh position={[-15, 0.01, -19]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3.8, 4.5, 44]} /><meshToonMaterial color="#686b68" gradientMap={getFourStepGradientMap()} /></mesh>
      <mesh position={[18, 0.012, -26]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[5.2, 6.2, 50]} /><meshToonMaterial color="#777974" gradientMap={getFourStepGradientMap()} /></mesh>
    </> : <>
      <mesh position={[-17, 0.01, -22]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[5.5, 6.6, 48]} /><meshToonMaterial color="#656965" gradientMap={getFourStepGradientMap()} /></mesh>
      <mesh position={[14, 0.012, -18]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3.1, 3.8, 40]} /><meshToonMaterial color="#7b7d77" gradientMap={getFourStepGradientMap()} /></mesh>
    </>}
    {/* A restrained Earth reference gives the black sky depth and orientation. */}
    <group position={earthPosition}>
      <mesh><sphereGeometry args={[2.35, 32, 24]} /><meshStandardMaterial color="#6f9eae" roughness={0.9} /></mesh>
      <mesh scale={1.08}><sphereGeometry args={[2.35, 32, 24]} /><meshBasicMaterial color="#b9e4ed" transparent opacity={0.12} side={THREE.BackSide} /></mesh>
      <mesh position={[-0.45, 0.35, 2.17]} rotation={[0, 0, 0.5]}><circleGeometry args={[0.55, 18]} /><meshBasicMaterial color="#e7e4d2" transparent opacity={0.7} /></mesh>
    </group>
  </group>;
}

function Apollo12Site() {
  const steps = useMemo(() => Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    return { x: -0.8 - t * 8.7 + Math.sin(t * 10) * 0.25, z: -0.5 - t * 6, side: index % 2 ? 0.2 : -0.2 };
  }), []);
  return <group>
    <LunarBackdrop variant="apollo12" />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow><circleGeometry args={[130, 96]} /><meshToonMaterial color="#96968e" gradientMap={getFourStepGradientMap()} /></mesh>
    {/* Intrepid's engine-scoured landing area anchors the scene. */}
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.6, 48]} /><meshToonMaterial color="#6d706c" gradientMap={getFourStepGradientMap()} /></mesh>
    {Array.from({ length: 18 }, (_, index) => { const a = index / 18 * Math.PI * 2; return <Line key={`ray-${index}`} points={[[Math.cos(a) * 1.2, 0.01, Math.sin(a) * 1.2], [Math.cos(a) * (4 + index % 3), 0.012, Math.sin(a) * (4 + index % 3)]]} color="#c4c1b6" lineWidth={1} transparent opacity={0.24} />; })}
    {/* Flag and simplified ALSEP cluster with an explicit cable route. */}
    <group position={[4.2, 0, 2.4]}><Strut from={[0, 0, 0]} to={[0, 2.3, 0]} radius={0.035} color="#d5d2c5" /><mesh position={[0.62, 1.82, 0]}><planeGeometry args={[1.2, 0.72]} /><meshToonMaterial color="#a7b5bd" side={THREE.DoubleSide} gradientMap={getFourStepGradientMap()} /></mesh></group>
    <group position={[7.5, 0, -4]}>
      <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[1.1, 0.8, 0.82]} /><meshToonMaterial color="#b09b67" gradientMap={getFourStepGradientMap()} /></mesh>
      <mesh position={[1.7, 0.18, 0.7]}><cylinderGeometry args={[0.32, 0.32, 0.36, 16]} /><meshToonMaterial color="#c4c2b7" gradientMap={getFourStepGradientMap()} /></mesh>
      <mesh position={[-1.5, 0.12, -0.5]}><boxGeometry args={[1.1, 0.24, 0.7]} /><meshToonMaterial color="#777d79" gradientMap={getFourStepGradientMap()} /></mesh>
    </group>
    <Line points={[[1.8, 0.06, -0.8], [4, 0.08, -2], [7.5, 0.1, -4]]} color="#d6c896" lineWidth={2} transparent opacity={0.48} />
    {steps.map((step, index) => <mesh key={`apollo-step-${index}`} position={[step.x + step.side, 0.018, step.z]} rotation={[-Math.PI / 2, 0, -0.62]}><planeGeometry args={[0.22, 0.46]} /><meshBasicMaterial color="#555854" transparent opacity={0.62} /></mesh>)}
    <Line points={[[-0.8, 0.08, -0.5], [-4, 0.1, -2.8], [-7, 0.1, -5], [-10, 0.1, -7]]} color="#d8d6c8" lineWidth={1} transparent opacity={0.3} dashed dashSize={0.2} gapSize={0.3} />
  </group>;
}

function ApolloAstronaut() {
  return <group>
    <mesh position={[0, 1.18, 0]} castShadow><boxGeometry args={[0.68, 0.82, 0.42]} /><meshToonMaterial color="#e8e5d9" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 1.78, 0]} castShadow><sphereGeometry args={[0.34, 24, 18]} /><meshToonMaterial color="#eeeade" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 1.78, 0.285]}><sphereGeometry args={[0.255, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshStandardMaterial color="#6e6250" metalness={0.45} roughness={0.32} /></mesh>
    <mesh position={[0, 1.24, -0.34]}><boxGeometry args={[0.58, 0.75, 0.32]} /><meshToonMaterial color="#d4d1c6" gradientMap={getFourStepGradientMap()} /></mesh>
    <Strut from={[-0.28, 1.45, 0]} to={[-0.72, 1.16, 0.32]} radius={0.105} color="#e2dfd4" />
    <Strut from={[0.28, 1.45, 0]} to={[0.68, 1.16, 0.32]} radius={0.105} color="#e2dfd4" />
    <mesh position={[-0.75, 1.13, 0.34]}><sphereGeometry args={[0.13, 14, 10]} /><meshToonMaterial color="#c5c3bb" /></mesh>
    <mesh position={[0.71, 1.13, 0.34]}><sphereGeometry args={[0.13, 14, 10]} /><meshToonMaterial color="#c5c3bb" /></mesh>
    <Strut from={[-0.2, 0.82, 0]} to={[-0.3, 0.25, 0.08]} radius={0.13} color="#dddacf" />
    <Strut from={[0.2, 0.82, 0]} to={[0.32, 0.25, -0.02]} radius={0.13} color="#dddacf" />
    {[-0.31, 0.33].map((x, index) => <mesh key={x} position={[x, 0.1, index ? 0.08 : 0.17]}><boxGeometry args={[0.32, 0.17, 0.52]} /><meshToonMaterial color="#b9b8b0" gradientMap={getFourStepGradientMap()} /></mesh>)}
  </group>;
}

function SurveyorCameraUnit() {
  return <group rotation={[0.08, 0.2, -0.12]}>
    <mesh castShadow><cylinderGeometry args={[0.18, 0.22, 0.58, 18]} /><meshToonMaterial color="#d2cec0" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.24, 0.18, 0.16, 18]} /><meshToonMaterial color="#a8aaa5" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, -0.34, 0]}><boxGeometry args={[0.42, 0.16, 0.36]} /><meshToonMaterial color="#6f7472" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 0.08, 0.2]}><circleGeometry args={[0.09, 16]} /><meshBasicMaterial color="#25323a" /></mesh>
  </group>;
}

function ReturnedCameraSite() {
  const recoveryImage = useTexture(SURVEYOR_RECOVERY_IMAGE);
  useEffect(() => {
    recoveryImage.colorSpace = THREE.SRGBColorSpace;
    recoveryImage.anisotropy = 8;
    recoveryImage.needsUpdate = true;
  }, [recoveryImage]);
  return <group>
    <LunarBackdrop variant="recovery" />
    {/* Apollo 12 frame AS12-48-7134 is mounted as a physical archive panel so
        camera movement reveals its depth and angle like every other scene object. */}
    <group position={[-7.2, 3.4, -4.2]} rotation={[0, 0.34, 0]}>
      <mesh position={[0, 0, -0.11]} castShadow>
        <boxGeometry args={[5.45, 5.45, 0.2]} />
        <meshStandardMaterial color="#303638" roughness={0.82} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[5.12, 5.12]} />
        <meshBasicMaterial map={recoveryImage} toneMapped={false} />
      </mesh>
      <Strut from={[-1.65, -2.72, -0.08]} to={[-1.65, -3.33, -0.08]} radius={0.065} color="#697071" />
      <Strut from={[1.65, -2.72, -0.08]} to={[1.65, -3.33, -0.08]} radius={0.065} color="#697071" />
      <mesh position={[-1.65, -3.4, -0.08]}><cylinderGeometry args={[0.3, 0.38, 0.12, 16]} /><meshStandardMaterial color="#555b5b" roughness={0.9} /></mesh>
      <mesh position={[1.65, -3.4, -0.08]}><cylinderGeometry args={[0.3, 0.38, 0.12, 16]} /><meshStandardMaterial color="#555b5b" roughness={0.9} /></mesh>
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, 0]} receiveShadow><circleGeometry args={[110, 96]} /><meshToonMaterial color="#8c8e88" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[-1.8, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.4, 48]} /><meshToonMaterial color="#a3a299" gradientMap={getFourStepGradientMap()} /></mesh>
    {/* Tool carrier and return-container archive. */}
    <group position={[3.5, 0, -1.8]}><mesh position={[0, 0.28, 0]} castShadow><boxGeometry args={[1.15, 0.55, 0.72]} /><meshToonMaterial color="#c9c5b7" gradientMap={getFourStepGradientMap()} /></mesh><mesh position={[0, 0.62, 0]}><torusGeometry args={[0.28, 0.035, 8, 20, Math.PI]} /><meshToonMaterial color="#777d79" /></mesh></group>
    {/* Earth-laboratory archive is deliberately abstract and visually separated. */}
    <group position={[7.2, 0, -3.8]}><mesh position={[0, 0.42, 0]}><cylinderGeometry args={[0.72, 0.82, 0.82, 24]} /><meshStandardMaterial color="#617c7b" emissive="#315957" emissiveIntensity={0.45} roughness={0.6} /></mesh><mesh position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.36, 0.48, 28]} /><meshBasicMaterial color="#c5efea" transparent opacity={0.72} /></mesh></group>
    <Line points={[[3.5, 0.5, -1.8], [5.2, 0.7, -2.7], [7.2, 0.9, -3.8]]} color="#b6d0cc" lineWidth={1} transparent opacity={0.42} dashed dashSize={0.2} gapSize={0.22} />
  </group>;
}

function CameraLaboratory() {
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow><planeGeometry args={[52, 52]} /><meshStandardMaterial color="#293536" roughness={0.8} metalness={0.12} /></mesh>
    <mesh position={[0, 6, -14]}><planeGeometry args={[30, 12]} /><meshStandardMaterial color="#344345" roughness={0.9} /></mesh>
    {[-10, -5, 0, 5, 10].map(x => <Line key={`wall-${x}`} points={[[x, 0, -13.95], [x, 12, -13.95]]} color="#60807f" lineWidth={1} transparent opacity={0.22} />)}
    {[1, 3, 5, 7, 9, 11].map(y => <Line key={`wall-y-${y}`} points={[[-15, y, -13.95], [15, y, -13.95]]} color="#60807f" lineWidth={1} transparent opacity={0.18} />)}
    {/* Returned camera on a central inspection turntable. */}
    <mesh position={[0, 0.38, 0]} castShadow><cylinderGeometry args={[1.15, 1.3, 0.72, 40]} /><meshStandardMaterial color="#536567" metalness={0.42} roughness={0.38} /></mesh>
    <group position={[0, 1.05, 0]} scale={1.25}><SurveyorCameraUnit /></group>
    <mesh position={[0, 1.05, -0.1]}><cylinderGeometry args={[1.7, 1.7, 2.2, 36, 1, true]} /><meshBasicMaterial color="#8de2da" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    {/* Optical bench and explanatory light path. */}
    <group position={[-3.8, 0, 0]}><mesh position={[0, 0.58, 0]}><boxGeometry args={[2.4, 0.22, 1.2]} /><meshStandardMaterial color="#5c6969" metalness={0.35} roughness={0.5} /></mesh><mesh position={[0, 1.18, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.42, 0.42, 0.28, 28]} /><meshStandardMaterial color="#182629" metalness={0.5} roughness={0.25} /></mesh><mesh position={[0.15, 1.18, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.31, 28]} /><meshBasicMaterial color="#9feaf0" transparent opacity={0.65} /></mesh></group>
    <Line points={[[-3.55, 1.18, 0], [-1.4, 1.18, 0], [-0.5, 1.1, 0]]} color="#9feaf0" lineWidth={2} transparent opacity={0.52} />
    {/* Electrical station with deliberately abstract waveform. */}
    <group position={[0, 0, -3.8]}><mesh position={[0, 0.7, 0]}><boxGeometry args={[2.2, 1.4, 0.55]} /><meshStandardMaterial color="#435455" roughness={0.55} /></mesh><mesh position={[0, 0.82, 0.29]}><planeGeometry args={[1.65, 0.72]} /><meshBasicMaterial color="#122527" /></mesh><Line points={[[ -0.72, 0.82, 0.31], [-0.35, 1.02, 0.31], [0, 0.62, 0.31], [0.35, 0.98, 0.31], [0.72, 0.76, 0.31]]} color="#80e0b5" lineWidth={2} /></group>
    {/* Mechanical station: scanning axis and bearing cutaway. */}
    <group position={[3.8, 0, 0]}><mesh position={[0, 0.55, 0]}><boxGeometry args={[2.3, 0.25, 1.3]} /><meshStandardMaterial color="#5b6464" metalness={0.36} roughness={0.48} /></mesh><mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.64, 0.16, 12, 30]} /><meshStandardMaterial color="#bd9f62" metalness={0.55} roughness={0.35} /></mesh><mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.18, 0.18, 0.45, 18]} /><meshStandardMaterial color="#7b8583" metalness={0.65} roughness={0.3} /></mesh></group>
    {/* Materials station with magnified dust grains under a lens. */}
    <group position={[0, 0, 3.8]}><mesh position={[0, 0.5, 0]}><boxGeometry args={[2.2, 0.24, 1.4]} /><meshStandardMaterial color="#596665" roughness={0.62} /></mesh><mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.72, 0.72, 0.16, 28]} /><meshStandardMaterial color="#aac8c5" transparent opacity={0.45} metalness={0.25} roughness={0.2} /></mesh>{[[-0.28, 0.15], [0.18, 0.26], [0.32, -0.18], [-0.12, -0.26]].map(([x,z], index) => <mesh key={index} position={[x, 1.18, z]}><dodecahedronGeometry args={[0.09 + index * 0.02, 0]} /><meshStandardMaterial color="#b3aa98" roughness={1} /></mesh>)}</group>
    <pointLight position={[0, 7, 2]} color="#d8fffa" intensity={1.8} distance={24} decay={2} />
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

function PosedAstronautModel({ span }: { span: number }) {
  const { scene } = useGLTF('/models/Astronaut.glb', DECODER_PATH);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh) || !node.geometry?.attributes.position) return;
      node.geometry = node.geometry.clone();
      const positions = node.geometry.attributes.position as THREE.BufferAttribute;
      const point = new THREE.Vector3();
      const pivot = new THREE.Vector3();
      const elbow = new THREE.Vector3();
      const yAxis = new THREE.Vector3(0, 1, 0);
      const zAxis = new THREE.Vector3(0, 0, 1);
      const shoulderRotation = new THREE.Quaternion();
      const elbowRotation = new THREE.Quaternion();
      for (let index = 0; index < positions.count; index++) {
        point.fromBufferAttribute(positions, index);
        const side = Math.sign(point.x);
        const distanceFromCenter = Math.abs(point.x);
        // The GLB is a single unrigged T-pose mesh. Its local Z axis is height;
        // isolate only the arm band so the torso, backpack and legs remain intact.
        if (side !== 0 && distanceFromCenter > 10 && point.z > 5 && point.z < 25) {
          pivot.set(side * 10.5, 0, 15.5);
          shoulderRotation.setFromAxisAngle(yAxis, side * 0.58);
          point.sub(pivot).applyQuaternion(shoulderRotation).add(pivot);
          if (distanceFromCenter > 22) {
            elbow.set(side * 22, 0, 15.5).sub(pivot).applyQuaternion(shoulderRotation).add(pivot);
            const bentAxis = zAxis.clone().applyQuaternion(shoulderRotation).normalize();
            elbowRotation.setFromAxisAngle(bentAxis, -side * 1.08);
            point.sub(elbow).applyQuaternion(elbowRotation).add(elbow);
          }
          positions.setXYZ(index, point.x, point.y, point.z);
        }
      }
      positions.needsUpdate = true;
      node.geometry.computeVertexNormals();
      node.castShadow = true;
      node.receiveShadow = true;
      const convert = (original: THREE.Material) => {
        const source = original as THREE.MeshStandardMaterial;
        return new THREE.MeshToonMaterial({ color: source.color?.clone() ?? new THREE.Color('#e5e2d7'), map: source.map ?? null, gradientMap: getFourStepGradientMap(), side: source.side });
      };
      node.material = Array.isArray(node.material) ? node.material.map(convert) : convert(node.material);
    });
    clone.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = span / Math.max(size.x, size.y, size.z, 0.001);
    const container = new THREE.Group();
    container.add(clone);
    clone.position.sub(center);
    clone.position.y += size.y / 2;
    container.scale.setScalar(scale);
    return container;
  }, [scene, span]);
  useEffect(() => () => {
    model.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      node.geometry.dispose();
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach(material => material.dispose());
    });
  }, [model]);
  return <primitive object={model} dispose={null} />;
}

function Surveyor() {
  const legs = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
  return <group>
    <mesh position={[0, 1.02, 0]} castShadow receiveShadow><cylinderGeometry args={[0.68, 0.72, 0.22, 3]} /><meshToonMaterial color="#c6c3b6" gradientMap={getFourStepGradientMap()} /></mesh>
    <mesh position={[0, 0.7, 0]} castShadow><cylinderGeometry args={[0.3, 0.42, 0.55, 10]} /><meshToonMaterial color="#3d4141" gradientMap={getFourStepGradientMap()} /></mesh>
    {legs.map((angle, index) => <mesh key={`bay-${index}`} position={[Math.cos(angle) * 0.55, 1.18, Math.sin(angle) * 0.55]} rotation={[0, -angle, 0]} castShadow><boxGeometry args={[0.62, 0.48, 0.44]} /><meshToonMaterial color={index === 1 ? '#9b8254' : '#d1cec0'} gradientMap={getFourStepGradientMap()} /></mesh>)}
    {legs.map((angle, i) => {
      const x = Math.cos(angle) * 1.82;
      const z = Math.sin(angle) * 1.82;
      return <group key={i}>
        <Strut from={[Math.cos(angle - 0.28) * 0.48, 1.18, Math.sin(angle - 0.28) * 0.48]} to={[x, 0.14, z]} radius={0.048} color="#d6d2c3" />
        <Strut from={[Math.cos(angle + 0.28) * 0.48, 1.18, Math.sin(angle + 0.28) * 0.48]} to={[x, 0.14, z]} radius={0.048} color="#b6b5ac" />
        <Strut from={[0, 0.76, 0]} to={[x, 0.14, z]} radius={0.025} color="#858985" />
        <mesh position={[x, 0.07, z]} receiveShadow><cylinderGeometry args={[0.36, 0.28, 0.12, 14]} /><meshToonMaterial color="#aaa99f" gradientMap={getFourStepGradientMap()} /></mesh>
      </group>;
    })}
    <Strut from={[0, 1.12, 0]} to={[-0.08, 3.05, -0.05]} radius={0.045} color="#d7d3c5" />
    <mesh position={[-0.08, 2.86, -0.02]} rotation={[0.16, 0.12, -0.12]} castShadow><boxGeometry args={[1.72, 0.07, 0.84]} /><meshToonMaterial color="#263944" gradientMap={getFourStepGradientMap()} /></mesh>
    {[-0.62, -0.2, 0.22, 0.64].map(x => <mesh key={`cell-${x}`} position={[x - 0.08, 2.89, 0.05]} rotation={[Math.PI / 2 + 0.16, 0, 0.12]}><planeGeometry args={[0.025, 0.72]} /><meshBasicMaterial color="#8faeb6" transparent opacity={0.7} /></mesh>)}
    <Strut from={[0.42, 1.2, 0.05]} to={[1.05, 1.72, 0.08]} radius={0.035} color="#c5c2b6" />
    <mesh position={[1.08, 1.76, 0.08]} rotation={[0, 0, -0.92]} castShadow><cylinderGeometry args={[0.58, 0.12, 0.18, 28, 1, true]} /><meshToonMaterial color="#d7d5ca" side={THREE.DoubleSide} gradientMap={getFourStepGradientMap()} /></mesh>
    <Strut from={[1.08, 1.76, 0.08]} to={[1.38, 1.98, 0.08]} radius={0.018} color="#6e7472" />
    <group position={[0.18, 1.92, 0.28]}><mesh><torusGeometry args={[0.18, 0.025, 8, 20]} /><meshToonMaterial color="#8e9692" gradientMap={getFourStepGradientMap()} /></mesh><Strut from={[0, -0.18, 0]} to={[0, -0.5, 0]} radius={0.025} color="#929691" /></group>
    <Strut from={[-0.48, 1.0, 0.18]} to={[-1.2, 0.42, 0.72]} radius={0.035} color="#8e928e" />
  </group>;
}

function DescentStage() {
  return <group>
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

function YellowknifeBaySurface() {
  const slabs = useMemo(() => {
    const random = seeded(1822013);
    return Array.from({ length: 58 }, (_, index) => {
      const angle = random() * Math.PI * 2;
      const distance = 2.4 + random() * 28;
      return {
        position: [Math.cos(angle) * distance, 0.03 + random() * 0.08, Math.sin(angle) * distance] as [number, number, number],
        scale: [0.8 + random() * 2.2, 0.08 + random() * 0.12, 0.7 + random() * 1.7] as [number, number, number],
        rotation: random() * Math.PI,
        pale: index % 7 === 0,
      };
    });
  }, []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
      <circleGeometry args={[110, 96]} />
      <meshToonMaterial color="#7b5747" gradientMap={getFourStepGradientMap()} />
    </mesh>
    {/* A shallow, enclosed sedimentary basin creates a composition distinct from the open Curiosity plain. */}
    {Array.from({ length: 18 }, (_, index) => {
      const angle = index / 18 * Math.PI * 2;
      const distance = 32 + (index % 3) * 3;
      return <mesh key={`rim-${index}`} position={[Math.cos(angle) * distance, 2.5, Math.sin(angle) * distance]} scale={[7, 4 + index % 4, 6]} rotation={[0, -angle, 0]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshToonMaterial color={index % 2 ? '#664638' : '#8a6049'} gradientMap={getFourStepGradientMap()} />
      </mesh>;
    })}
    {slabs.map((slab, index) => <mesh key={index} position={slab.position} scale={slab.scale} rotation={[0.02, slab.rotation, 0]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={slab.pale ? '#a88e75' : '#745545'} gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    {/* John Klein full drill and preparatory mini-hole with contrasting interior powder. */}
    <group position={[0, 0.13, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><circleGeometry args={[0.17, 24]} /><meshStandardMaterial color="#292c2c" roughness={1} /></mesh>
      <mesh position={[0, 0, 0.006]}><ringGeometry args={[0.18, 0.42, 32]} /><meshStandardMaterial color="#9d9a88" roughness={1} /></mesh>
      <mesh position={[0.62, 0.22, 0.008]}><circleGeometry args={[0.09, 20]} /><meshStandardMaterial color="#3c3b37" roughness={1} /></mesh>
    </group>
    {/* Enlarged calcium-rich vein network for legible field inspection. */}
    {[[-7, -4, -3, -2], [2, -7, 5, -4], [3, -3, 7, -6], [-2, 1, 3, -1]].map((vein, index) =>
      <Line key={`vein-${index}`} points={[[vein[0], 0.18, vein[1]], [vein[2], 0.2, vein[3]]]} color="#d7cbb0" lineWidth={2} transparent opacity={0.72} />)}
    <Line points={[[0, 0.28, -1.8], [3.2, 0.45, -0.5], [6.2, 0.55, 0.8], [8.5, 0.7, 1.5]]} color="#e0b071" lineWidth={1} transparent opacity={0.45} dashed dashSize={0.22} gapSize={0.2} />
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

function UtopiaArtifacts() {
  const rocks = useMemo(() => {
    const random = seeded(19760903);
    return Array.from({ length: 34 }, (_, index) => ({
      position: [(random() - 0.5) * 27, 0.16 + random() * 0.25, -3 - random() * 18] as [number, number, number],
      scale: 0.18 + random() * (index % 8 === 0 ? 0.75 : 0.38),
      rotation: random() * Math.PI,
    }));
  }, []);
  return <group>
    {rocks.map((rock, index) => <mesh key={index} position={rock.position} scale={[rock.scale * 1.35, rock.scale * 0.65, rock.scale]} rotation={[0.1, rock.rotation, 0.08]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={index % 4 === 0 ? '#745846' : '#604b3f'} gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    {/* Seasonal frost archive: a restrained, irregular pale patch rather than snow cover. */}
    <group position={[7.2, 0.022, -4.5]} rotation={[-Math.PI / 2, 0, -0.18]}>
      <mesh scale={[2.3, 1.1, 1]}><circleGeometry args={[1, 32]} /><meshStandardMaterial color="#d8d5c9" roughness={1} transparent opacity={0.68} /></mesh>
      <mesh position={[-1.4, 0.25, 0.003]} scale={[0.9, 0.45, 1]}><circleGeometry args={[1, 24]} /><meshStandardMaterial color="#c8cbc2" roughness={1} transparent opacity={0.42} /></mesh>
    </group>
    {/* Illustrative comparison traces connect the weather station with the frost record. */}
    <Line points={[[-0.7, 1.7, -0.2], [1.8, 1.15, -1.5], [4.2, 0.55, -3], [7.2, 0.2, -4.5]]} color="#b8d6dc" lineWidth={1} transparent opacity={0.34} dashed dashSize={0.2} gapSize={0.24} />
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

function JezeroAirfield() {
  const navigationRocks = useMemo(() => {
    const random = seeded(20210419);
    return Array.from({ length: 48 }, (_, index) => ({
      position: [(random() - 0.5) * 30, 0.08 + random() * 0.16, -2 - random() * 24] as [number, number, number],
      scale: 0.12 + random() * (index % 11 === 0 ? 0.65 : 0.28),
      rotation: random() * Math.PI,
    }));
  }, []);
  const ripples = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const z = -2.7 - index * 0.35;
    return [[-8.2 + index * 0.08, 0.07, z], [-5.5, 0.16 + (index % 3) * 0.02, z - 0.22], [-2.8 - index * 0.04, 0.07, z]] as [number, number, number][];
  }), []);
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
      <circleGeometry args={[115, 96]} />
      <meshToonMaterial color="#9b5d3d" gradientMap={getFourStepGradientMap()} />
    </mesh>
    {/* Jezero's distant delta makes this an airfield landscape, not the generic Mars plain. */}
    {Array.from({ length: 15 }, (_, index) => {
      const x = -38 + index * 5.5;
      const height = 4 + (index % 5) * 1.5;
      return <mesh key={`delta-${index}`} position={[x, height * 0.42, -42 - Math.abs(index - 7) * 0.8]} scale={[4.5, height, 5]} rotation={[0.03, index * 0.12, 0]}>
        <dodecahedronGeometry args={[1, 1]} />
        <meshToonMaterial color={index % 2 ? '#704430' : '#81513a'} gradientMap={getFourStepGradientMap()} />
      </mesh>;
    })}
    {navigationRocks.map((rock, index) => <mesh key={index} position={rock.position} scale={[rock.scale * 1.3, rock.scale * 0.7, rock.scale]} rotation={[0.08, rock.rotation, 0]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshToonMaterial color={index % 4 ? '#684536' : '#8f6750'} gradientMap={getFourStepGradientMap()} />
    </mesh>)}
    {/* Wright Brothers Field reads as a surveyed airfield rather than a lone ring. */}
    <group position={[2.2, 0.012, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><ringGeometry args={[0.78, 0.86, 48]} /><meshBasicMaterial color="#f0c77f" transparent opacity={0.8} /></mesh>
      <mesh><ringGeometry args={[1.22, 1.25, 48]} /><meshBasicMaterial color="#f0c77f" transparent opacity={0.3} /></mesh>
      <mesh><circleGeometry args={[0.12, 18]} /><meshBasicMaterial color="#fff0bd" transparent opacity={0.86} /></mesh>
    </group>
    {/* An elevated first-flight arc and a longer autonomous traverse make flight visible in 3D. */}
    <Line points={[[2.2, 0.08, 1.8], [2.2, 1.6, 1.8], [2.2, 3.08, 1.8], [2.2, 1.6, 1.8], [2.2, 0.08, 1.8]]} color="#ffd58a" lineWidth={2} transparent opacity={0.72} dashed dashSize={0.16} gapSize={0.14} />
    <Line points={[[0, 0.18, 0], [1.2, 1.5, -0.9], [2.8, 2.4, -2.4], [4.5, 1.8, -3.8], [5.8, 0.18, -5.4]]} color="#8bd6e7" lineWidth={2} transparent opacity={0.62} dashed dashSize={0.22} gapSize={0.18} />
    {/* NAVCAM feature locks projected onto visually distinct terrain points. */}
    {[[1.2, -1], [2.8, -2.4], [4.5, -3.8]].map(([x, z], index) => <group key={`lock-${index}`} position={[x, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><ringGeometry args={[0.22, 0.27, 20]} /><meshBasicMaterial color="#8bd6e7" transparent opacity={0.62} /></mesh>
      <mesh><planeGeometry args={[0.5, 0.025]} /><meshBasicMaterial color="#8bd6e7" transparent opacity={0.42} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><planeGeometry args={[0.5, 0.025]} /><meshBasicMaterial color="#8bd6e7" transparent opacity={0.42} /></mesh>
    </group>)}
    {/* Flight 72: low-texture sand ripples plus the separated blade fragment. */}
    {ripples.map((points, index) => <Line key={`ripple-${index}`} points={points} color="#c88255" lineWidth={2} transparent opacity={0.5} />)}
    <group position={[-5.5, 0.24, -4.8]} rotation={[0.08, 0.45, -0.05]}>
      <mesh scale={[2.6, 0.32, 1.55]} castShadow receiveShadow><dodecahedronGeometry args={[1, 1]} /><meshToonMaterial color="#aa6947" gradientMap={getFourStepGradientMap()} /></mesh>
      <mesh position={[-1.5, 0.42, 0.6]} rotation={[0.08, 0.6, 0.12]}><boxGeometry args={[1.35, 0.025, 0.1]} /><meshStandardMaterial color="#262a2d" roughness={0.65} /></mesh>
    </group>
  </group>;
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
  const geometry = useMemo(() => {
    const radius = 3.62;
    const result = new THREE.IcosahedronGeometry(radius, 5);
    const positions = result.attributes.position;
    const colors: number[] = [];
    const craterDirections = [
      new THREE.Vector3(-0.2, 0.14, 0.97), new THREE.Vector3(0.42, 0.36, 0.83),
      new THREE.Vector3(0.61, -0.28, 0.74), new THREE.Vector3(-0.55, -0.42, 0.72),
      new THREE.Vector3(-0.72, 0.5, 0.48), new THREE.Vector3(0.18, 0.78, 0.6),
      new THREE.Vector3(0.76, 0.16, 0.63), new THREE.Vector3(-0.12, -0.76, 0.64),
      new THREE.Vector3(0.3, -0.72, -0.62), new THREE.Vector3(-0.66, 0.12, -0.74),
    ].map(direction => direction.normalize());
    const direction = new THREE.Vector3();
    const color = new THREE.Color();
    for (let index = 0; index < positions.count; index++) {
      direction.fromBufferAttribute(positions, index).normalize();
      let relief = 0.035 * Math.sin(direction.x * 31 + direction.y * 17)
        + 0.025 * Math.sin(direction.y * 47 - direction.z * 23)
        + 0.018 * Math.cos(direction.z * 67 + direction.x * 29);
      craterDirections.forEach((crater, craterIndex) => {
        const angularDistance = Math.acos(THREE.MathUtils.clamp(direction.dot(crater), -1, 1));
        const size = 0.075 + (craterIndex % 4) * 0.018;
        if (angularDistance < size) {
          const normalized = angularDistance / size;
          relief -= Math.cos(normalized * Math.PI * 0.5) * (0.09 + size * 0.45);
          if (normalized > 0.72) relief += Math.sin((normalized - 0.72) / 0.28 * Math.PI) * 0.035;
        }
      });
      const displacedRadius = radius + relief;
      positions.setXYZ(index, direction.x * displacedRadius, direction.y * displacedRadius, direction.z * displacedRadius);
      const shade = THREE.MathUtils.clamp(0.46 + relief * 1.5 + direction.y * 0.035, 0.31, 0.58);
      color.setRGB(shade * 0.83, shade * 0.85, shade * 0.8);
      colors.push(color.r, color.g, color.b);
    }
    result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    result.computeVertexNormals();
    return result;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group>
    <mesh geometry={geometry} position={[5.98, -2.69, -9.12]} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.94} metalness={0} flatShading />
    </mesh>
    {/* A compact emissive Occator facula is embedded just above the procedural
        surface. The discovery marker shares this exact location. */}
    <group position={[5.26, -2.19, -5.57]} rotation={[0.14, -0.2, 0]}>
      <mesh><circleGeometry args={[0.105, 24]} /><meshStandardMaterial color="#eaffff" emissive="#a9efff" emissiveIntensity={3.4} roughness={0.5} /></mesh>
      <mesh position={[0, 0, -0.004]}><ringGeometry args={[0.11, 0.19, 28]} /><meshBasicMaterial color="#b9ecf4" transparent opacity={0.35} depthWrite={false} /></mesh>
      <pointLight color="#b8efff" intensity={1.2} distance={1.7} decay={2} position={[0, 0, 0.12]} />
    </group>
    <Line points={[[ -9, 5.8, -3], [-4, 8.4, -6], [2, 8.8, -9], [8.5, 5.2, -9], [11.5, -0.8, -6]]} color="#8fb8c9" lineWidth={1} transparent opacity={0.34} dashed dashSize={0.4} gapSize={0.3} />
    <Line points={[[11.5, -0.8, -6], [10.2, -5.2, -4.5], [5.8, -7.2, -4.2], [1.4, -5.8, -4.8]]} color="#8fb8c9" lineWidth={1} transparent opacity={0.16} dashed dashSize={0.35} gapSize={0.34} />
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
  const isJohnKlein = mission.id === 'john-klein';
  const isIngenuity = mission.id === 'ingenuity';
  const isApollo12 = mission.id === 'apollo12';
  const isReturnedCamera = mission.id === 'returned-camera';
  const isCameraLab = mission.id === 'camera-lab';
  const space = mission.id === 'pioneer' || isNear || isDawn || isKepler;
  const moon = mission.id === 'surveyor' || isApollo12 || isReturnedCamera;
  return <>
    <color attach="background" args={[space ? '#090f1b' : moon ? '#111820' : isCameraLab ? '#1d282a' : isJohnKlein ? '#9d684d' : isIngenuity ? '#b9744d' : '#c69273']} />
    {!space ? <fog attach="fog" args={[moon ? '#283138' : isCameraLab ? '#1d282a' : isJohnKlein ? '#8d5e49' : isIngenuity ? '#a96749' : '#c69273', isCameraLab ? 22 : isJohnKlein || isIngenuity ? 30 : 42, isCameraLab ? 70 : isJohnKlein || isIngenuity ? 105 : 150]} /> : null}
    <ambientLight intensity={space ? 1.1 : 0.7} color={space ? '#b7c8df' : '#fff0d6'} />
    <hemisphereLight args={[moon ? '#cdd8de' : '#f5d9b0', moon ? '#4f5557' : '#69402d', 1.15]} />
    <directionalLight position={[-12, 16, 8]} intensity={space ? 2.5 : 3} color="#fff4dd" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} shadow-bias={-0.001} />
    {space || moon ? <StarField /> : null}
    {!space && !moon && !isJohnKlein && !isIngenuity && !isCameraLab ? <Surface moon={false} /> : null}
    {mission.id === 'surveyor' ? <SurveyorSiteSurface /> : null}
    {isApollo12 ? <Apollo12Site /> : null}
    {isReturnedCamera ? <ReturnedCameraSite /> : null}
    {isCameraLab ? <CameraLaboratory /> : null}
    {isJohnKlein ? <YellowknifeBaySurface /> : null}
    {isIngenuity ? <JezeroAirfield /> : null}
    {mission.id === 'surveyor' ? <>
      <Surveyor />
      <group position={[12, 0, -9]} rotation={[0, 0.42, 0]}>
        <ModelFallback fallback={<DescentStage />}>
          <Suspense fallback={<DescentStage />}>
            <NormalizedModel path="/models/Apollo Lunar Module.glb" span={5.4} />
          </Suspense>
        </ModelFallback>
      </group>
    </> : null}
    {isApollo12 ? <>
      <group rotation={[0, 0.32, 0]}>
        <ModelFallback fallback={<DescentStage />}><Suspense fallback={<DescentStage />}><NormalizedModel path="/models/Apollo Lunar Module.glb" span={6.4} /></Suspense></ModelFallback>
      </group>
      <group position={[-10, 0, -7]} rotation={[0, 1.2, 0]} scale={0.72}><Surveyor /></group>
    </> : null}
    {isReturnedCamera ? <>
      <group position={[-1.9, 0, 0]} rotation={[0, 0.55, 0]} scale={0.82}><Surveyor /></group>
      <group position={[1.75, 0, 0.05]} rotation={[0, -0.55, 0]}>
        <ModelFallback fallback={<ApolloAstronaut />}><Suspense fallback={<ApolloAstronaut />}><PosedAstronautModel span={2.05} /></Suspense></ModelFallback>
      </group>
      <group position={[1.75, 1.12, 0.78]} scale={0.42}><SurveyorCameraUnit /></group>
    </> : null}
    {mission.id === 'curiosity' ? <>
      <ModelFallback fallback={<CuriositySchematic />}><Suspense fallback={<CuriositySchematic />}><NormalizedModel path="/models/curiosity.glb" span={3.3} /></Suspense></ModelFallback>
      <MarsArtifacts />
    </> : null}
    {isJohnKlein ? <group position={[8.5, 0, 1.5]} rotation={[0, -1.1, 0]}>
      <ModelFallback fallback={<CuriositySchematic />}><Suspense fallback={<CuriositySchematic />}><NormalizedModel path="/models/curiosity.glb" span={3.3} /></Suspense></ModelFallback>
    </group> : null}
    {mission.id === 'viking' ? <>
      <ModelFallback fallback={<VikingProceduralFallback />}><Suspense fallback={<VikingProceduralFallback />}><NormalizedModel path="/models/Viking Lander.glb" span={3.6} /></Suspense></ModelFallback>
      <ChryseArtifacts />
    </> : null}
    {mission.id === 'viking2' ? <>
      <group rotation={[0, 0.25, -0.11]}>
        <ModelFallback fallback={<VikingProceduralFallback />}><Suspense fallback={<VikingProceduralFallback />}><NormalizedModel path="/models/Viking Lander.glb" span={3.6} /></Suspense></ModelFallback>
      </group>
      <UtopiaArtifacts />
    </> : null}
    {isIngenuity ? <>
      <group position={[0, 0.12, 0]} rotation={[0, -0.35, 0]}>
        <ModelFallback fallback={<IngenuityProceduralFallback />}><Suspense fallback={<IngenuityProceduralFallback />}><NormalizedModel path="/models/ingenuity.glb" span={2.1} /></Suspense></ModelFallback>
      </group>
    </> : null}
    {mission.id === 'pioneer' ? <ModelFallback fallback={<PioneerSchematic />}><Suspense fallback={<PioneerSchematic />}><NormalizedModel path="/models/pioneer.glb" span={8} grounded={false} /></Suspense></ModelFallback> : null}
    {isNear ? (
      <>
        <ModelFallback fallback={<NearShoemakerProceduralFallback />}><Suspense fallback={<NearShoemakerProceduralFallback />}><NormalizedModel path="/models/NEAR Shoemaker.glb" span={5.5} grounded={false} /></Suspense></ModelFallback>
        <ErosAsteroid />
      </>
    ) : null}
    {isDawn ? <>
      <group position={[-0.8, 0.65, 0]} rotation={[0.08, -0.14, -0.035]}>
        <ModelFallback fallback={<DawnProceduralFallback />}><Suspense fallback={<DawnProceduralFallback />}><NormalizedModel path="/models/Dawn.glb" span={6.6} grounded={false} /></Suspense></ModelFallback>
      </group>
      <CeresContext />
    </> : null}
    {isKepler ? <>
      <ModelFallback fallback={<KeplerProceduralFallback />}><Suspense fallback={<KeplerProceduralFallback />}><NormalizedModel path="/models/Kepler (A).glb" span={7} grounded={false} /></Suspense></ModelFallback>
      <KeplerObservationField />
    </> : null}
    {mission.discoveries.map((discovery) => <DiscoveryMarker key={discovery.id} position={discovery.position} selected={selectedId === discovery.id} discovered={discoveredIds.includes(discovery.id)} accent={mission.accent} onClick={() => onSelect(discovery.id)} />)}
  </>;
}
