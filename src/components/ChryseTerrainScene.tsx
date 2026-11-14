import React, { useMemo, useRef } from 'react';
import { Billboard, Outlines, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  buildChryseTerrainGeometry,
  generateBasaltRockTransforms,
  getChryseTerrainHeight,
  BIG_JOE_POS,
  FOOTPAD_2_POS,
} from '../utils/chryseTerrainSampler';
import { VikingAtmosphere } from './VikingAtmosphere';
import { VikingHardwareRig } from './VikingHardwareRig';
import { VIKING_DISCOVERIES, type VikingDiscoveryNode } from '../data/vikingForensicData';

interface ChryseSceneProps {
  selectedNodeId: string | null;
  scrubberProgress: number; // 0.0 (Future) to 1.0 (1976 Replay)
  onSelectNode: (id: string) => void;
  discoveredIds: string[];
}

/**
 * Landmark "Big Joe" Basalt Boulder
 * Located ~8m NW of the lander at (-6.5, y, -4.8).
 * Distinct 2m x 1m flat-shaded vesicular basalt boulder with dark outline.
 */
function BigJoeBoulder() {
  const y = getChryseTerrainHeight(BIG_JOE_POS.x, BIG_JOE_POS.z);

  return (
    <group position={[BIG_JOE_POS.x, y + 0.45, BIG_JOE_POS.z]} rotation={[0.15, 0.65, -0.1]}>
      {/* 2m x 1m flat-shaded vesicular basalt boulder */}
      <mesh castShadow receiveShadow scale={[1.85, 0.95, 1.45]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#3E2723"
          roughness={0.92}
          metalness={0.08}
          flatShading
        />
        <Outlines thickness={0.018} color="#090D16" />
      </mesh>
      {/* Attached identification plaque for exploration */}
      <Billboard position={[0, 1.1, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.28]} />
          <meshBasicMaterial color="#10252B" transparent opacity={0.85} />
        </mesh>
      </Billboard>
    </group>
  );
}

/**
 * 32 Instanced Low-Poly Angular Basalt Rocks
 * Scattered outside the 3.5m clearance corridor around the lander and trenches.
 */
function InstancedBasaltField() {
  const rockTransforms = useMemo(() => generateBasaltRockTransforms(32), []);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);

  const geometry = useMemo(() => new THREE.DodecahedronGeometry(1, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#42281D',
        roughness: 0.94,
        metalness: 0.06,
        flatShading: true,
      }),
    []
  );

  React.useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();

    rockTransforms.forEach((rock, i) => {
      dummy.position.set(...rock.position);
      dummy.rotation.set(...rock.rotation);
      dummy.scale.set(...rock.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rockTransforms]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, rockTransforms.length]}
      castShadow
      receiveShadow
    />
  );
}

/**
 * Holographic Time-Scrubber Ghost Visualizations
 * Renders cyan wireframes (#00F0FF) corresponding to 1976 forensic replays.
 */
function HolographicReplayGhosts({
  activeNodeId,
  progress,
}: {
  activeNodeId: string | null;
  progress: number; // 0.0 to 1.0
}) {
  const cyanMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#00F0FF',
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      }),
    []
  );

  const cyanLineColor = '#00F0FF';
  const redAlertColor = '#EF4444';

  return (
    <group>
      {/* 1. Sampler Boom & Trench Ghost (1_SAMPLER_BOOM_TRENCH) */}
      {(activeNodeId === '1_SAMPLER_BOOM_TRENCH' || activeNodeId === null) && (
        <group position={[0.75, 1.05, 0.72]}>
          {/* Cyan Wireframe Collector Boom extending up to 3.05m */}
          {progress > 0.05 && (
            <mesh
              position={[
                0.65 * (progress * 1.6),
                -0.42 * (progress * 1.2),
                0.85 * (progress * 1.6),
              ]}
              rotation={[-0.45, 0.65, -0.32]}
              material={cyanMaterial}
            >
              <cylinderGeometry
                args={[0.038, 0.042, 1.2 + progress * 1.85, 8]}
              />
            </mesh>
          )}

          {/* Sol 5: Pin Drop Arc toward Footpad #3 */}
          {progress > 0.35 && progress < 0.75 && (
            <group position={[0.5, -0.6 * ((progress - 0.35) / 0.4), 0.7]}>
              <mesh>
                <cylinderGeometry args={[0.01, 0.01, 0.12, 6]} />
                <meshBasicMaterial color="#00F0FF" />
              </mesh>
            </group>
          )}

          {/* Sol 8: 15cm Trench in Rust Soil */}
          {progress > 0.6 && (
            <group position={[1.8, getChryseTerrainHeight(1.8, 2.2) - 0.08, 2.2]}>
              <mesh rotation={[-Math.PI / 2, 0, 0.45]}>
                <planeGeometry args={[0.85, 0.22]} />
                <meshBasicMaterial
                  color="#3A170F"
                  transparent
                  opacity={progress}
                />
              </mesh>
              <Line
                points={[
                  [-0.4, 0.02, 0],
                  [0.4, 0.02, 0],
                ]}
                color="#00F0FF"
                lineWidth={2}
              />
            </group>
          )}
        </group>
      )}

      {/* 2. Facsimile Camera Vertical Scan-Plane (2_FACSIMILE_CAMERAS) */}
      {(activeNodeId === '2_FACSIMILE_CAMERAS' || activeNodeId === null) && progress > 0.05 && (
        <group position={[0.42, 1.45, 0.65]}>
          {/* Sweeping Vertical Fan Plane */}
          <mesh
            rotation={[
              0,
              -Math.PI * 0.85 + progress * Math.PI * 1.6, // Sweeps 300 degrees
              0,
            ]}
          >
            <cylinderGeometry
              args={[12.0 * progress, 0.1, 8.0, 16, 1, true, -0.05, 0.1]}
            />
            <meshBasicMaterial
              color="#00F0FF"
              side={THREE.DoubleSide}
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* 3. Biology Package & GCMS Carousel Cutaway (3_BIOLOGY_GCMS_OVEN) */}
      {(activeNodeId === '3_BIOLOGY_GCMS_OVEN' || activeNodeId === null) && progress > 0.05 && (
        <group position={[-0.8, 1.1, -0.4]}>
          {/* Holographic 3-Chamber Carousel */}
          <mesh material={cyanMaterial} rotation={[0, progress * Math.PI * 4, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.42, 12]} />
          </mesh>
          {/* Glowing 500°C Pyrolysis Indicator */}
          {progress > 0.5 && (
            <mesh position={[0, -0.1, 0.15]}>
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshBasicMaterial color="#FF6F00" transparent opacity={0.9} />
            </mesh>
          )}
        </group>
      )}

      {/* 4. S-Band Comms Beam vs 1982 Misalignment (4_RTG_SBAND_COMMS) */}
      {(activeNodeId === '4_RTG_SBAND_COMMS' || activeNodeId === null) && progress > 0.05 && (
        <group position={[-0.45, 1.75, 0]}>
          {/* 1976-1982 Earth-Locked Beam (#00F0FF) */}
          <Line
            points={[
              [0, 0, 0],
              [-8 * Math.cos(0.5), 16 * Math.sin(0.7), -8 * Math.sin(0.5)],
            ]}
            color={cyanLineColor}
            lineWidth={3}
            transparent
            opacity={Math.max(0, 1.0 - progress * 1.5)}
          />

          {/* Nov 1982 Command 004 Misaligned Lost Vector (#EF4444) */}
          {progress > 0.45 && (
            <Line
              points={[
                [0, 0, 0],
                [12 * Math.cos(1.2), 6 * Math.sin(0.4), 12 * Math.sin(1.2)],
              ]}
              color={redAlertColor}
              lineWidth={3}
              dashed
              dashSize={0.4}
              gapSize={0.2}
            />
          )}
        </group>
      )}
    </group>
  );
}

/**
 * 3D Holographic Waypoint Marker with Epistemic Badges
 */
function ForensicMarker({
  node,
  selected,
  discovered,
  onClick,
}: {
  node: VikingDiscoveryNode;
  selected: boolean;
  discovered: boolean;
  onClick: () => void;
}) {
  const y = getChryseTerrainHeight(node.coordinates[0], node.coordinates[2]);
  const markerPos: [number, number, number] = [
    node.coordinates[0],
    Math.max(node.coordinates[1], y + 0.35),
    node.coordinates[2],
  ];

  const ringColor = selected ? '#FFF3D4' : discovered ? '#00F0FF' : '#B84B29';

  return (
    <group
      position={markerPos}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Billboard>
        {/* Outer Pulsing Ring */}
        <mesh>
          <ringGeometry args={[selected ? 0.22 : 0.14, selected ? 0.26 : 0.17, 32]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.95}
            depthTest={false}
          />
        </mesh>
        {/* Core Dot */}
        <mesh>
          <circleGeometry args={[selected ? 0.08 : 0.05, 16]} />
          <meshBasicMaterial color={ringColor} depthTest={false} />
        </mesh>
        {/* Large invisible hit area for touch/click ergonomics */}
        <mesh visible={false}>
          <circleGeometry args={[0.55, 12]} />
          <meshBasicMaterial />
        </mesh>
      </Billboard>

      {/* Ground Projection Anchor Pin */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.35, 6]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

/**
 * Master Chryse Planitia Terrain & 3D Simulation Scene
 */
export function ChryseTerrainScene({
  selectedNodeId,
  scrubberProgress,
  onSelectNode,
  discoveredIds,
}: ChryseSceneProps) {
  // Build deterministic 240m x 240m Chryse DEM terrain geometry with vertex colors
  const terrainGeometry = useMemo(() => buildChryseTerrainGeometry(), []);

  return (
    <>
      {/* 1. Atmospheric Sky & Directional Solar Shadows */}
      <VikingAtmosphere />

      {/* 2. Chryse Planitia DEM Terrain (240m x 240m) */}
      <mesh geometry={terrainGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.88}
          metalness={0.06}
          flatShading
        />
      </mesh>

      {/* 3. Landmark "Big Joe" Basalt Boulder at (-6.5, y, -4.8) */}
      <BigJoeBoulder />

      {/* 4. 32 Instanced Low-Poly Basalt Rocks */}
      <InstancedBasaltField />

      {/* 5. Viking 1 Hardware Rig (with automatic procedural fallback) */}
      <VikingHardwareRig />

      {/* 6. Holographic Time-Scrubber Ghost Overlays */}
      <HolographicReplayGhosts
        activeNodeId={selectedNodeId}
        progress={scrubberProgress}
      />

      {/* 7. The 4 Essential Forensic Waypoint Nodes */}
      {VIKING_DISCOVERIES.map((node) => (
        <ForensicMarker
          key={node.id}
          node={node}
          selected={selectedNodeId === node.id}
          discovered={discoveredIds.includes(node.id)}
          onClick={() => onSelectNode(node.id)}
        />
      ))}
    </>
  );
}
