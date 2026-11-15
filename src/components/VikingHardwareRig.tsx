import React, { Component, Suspense, useEffect, useMemo } from 'react';
import { useGLTF, Outlines } from '@react-three/drei';
import * as THREE from 'three';
import { getChryseTerrainHeight, FOOTPAD_2_POS } from '../utils/chryseTerrainSampler';

// Local Draco decoder ensures zero CDN dependencies
const DECODER_PATH = '/vendor/draco/';

// Supported model paths (handles URL encoded or underscore versions)
const MODEL_PATHS = [
  '/models/Viking Lander.glb',
  '/models/viking_lander.glb',
  '/models/Viking%20Lander.glb',
];

interface VikingRigProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  highlightComponent?: string | null;
}

/**
 * Procedural Viking 1 Lander Assembly Fallback
 *
 * Detailed procedural reconstruction matching 1976 NASA Langley flight hardware:
 * - Hexagonal titanium/aluminum chassis body
 * - 3 inverted tripod landing legs with crushable honeycomb footpads (Footpad #2 lowered 16.5cm)
 * - 2 SNAP-19 Radioisotope Thermoelectric Generators (RTGs) with aerodynamic windscreens
 * - 2 mechanical facsimile camera turrets (Cameras 1 & 2)
 * - Steerable parabolic S-band high-gain dish antenna & UHF relay antenna
 * - Meteorology boom (MET mast with wind sensor and thermocouples)
 * - Extendable 3.05m surface sampler collector arm with backhoe/shroud scoop
 */
export function VikingProceduralFallback({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const landingLegs = [
    { angle: Math.PI / 6, isFootpad2: false, name: 'Leg 1 (East)' },
    { angle: (5 * Math.PI) / 6, isFootpad2: true, name: 'Leg 2 (Southwest · sunken)' },
    { angle: (3 * Math.PI) / 2, isFootpad2: false, name: 'Leg 3 (North)' },
  ];

  return (
    <group position={position}>
      {/* 1. Hexagonal Main Equipment Chassis Body */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.32, 1.48, 0.55, 6]} />
        <meshStandardMaterial color="#E0DCD3" roughness={0.42} metalness={0.25} />
        <Outlines thickness={0.014} color="#090D16" />
      </mesh>

      {/* Top Deck Thermal Shield / Equipment Plate */}
      <mesh position={[0, 1.13, 0]} receiveShadow>
        <cylinderGeometry args={[1.28, 1.32, 0.04, 6]} />
        <meshStandardMaterial color="#C8C2B4" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* 2. Three Inverted Tripod Landing Legs & Footpads */}
      {landingLegs.map((leg, i) => {
        const footRadius = 2.25;
        const footX = Math.cos(leg.angle) * footRadius;
        const footZ = Math.sin(leg.angle) * footRadius;
        const footY = leg.isFootpad2 ? -0.165 : 0.04; // Footpad #2 sank 16.5 cm into Chryse drift soil

        const legMidX = footX * 0.5;
        const legMidZ = footZ * 0.5;

        return (
          <group key={i}>
            {/* Primary Main Strut */}
            <mesh position={[legMidX, 0.45 + footY * 0.5, legMidZ]} castShadow>
              <cylinderGeometry args={[0.045, 0.055, 1.25, 8]} />
              <meshStandardMaterial color="#9E9B91" metalness={0.65} roughness={0.3} />
              <Outlines thickness={0.012} color="#090D16" />
            </mesh>

            {/* Inverted V-Brace Struts */}
            <mesh position={[footX * 0.72, 0.52, footZ * 0.72]} rotation={[0, -leg.angle, 0.45]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.95, 6]} />
              <meshStandardMaterial color="#8A877E" metalness={0.7} roughness={0.35} />
            </mesh>

            {/* Circular Honeycomb Footpad */}
            <mesh position={[footX, footY + 0.04, footZ]} receiveShadow castShadow>
              <cylinderGeometry args={[0.26, 0.28, 0.07, 16]} />
              <meshStandardMaterial color={leg.isFootpad2 ? '#7A5445' : '#BBB6AA'} roughness={0.6} />
              <Outlines thickness={0.014} color="#090D16" />
            </mesh>
          </group>
        );
      })}

      {/* 3. Twin SNAP-19 Radioisotope Thermoelectric Generators (RTGs) */}
      {/* RTG #1 (Northwest deck) */}
      <group position={[-0.85, 1.28, -0.45]} rotation={[0, 0.35, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.24, 0.38, 8]} />
          <meshStandardMaterial color="#4A4E51" metalness={0.8} roughness={0.25} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        {/* Radiator Cooling Fins */}
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((finAngle, idx) => (
          <mesh key={idx} rotation={[0, finAngle, 0]} castShadow>
            <boxGeometry args={[0.56, 0.34, 0.018]} />
            <meshStandardMaterial color="#2E3234" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* RTG #2 (Southwest deck) */}
      <group position={[-0.85, 1.28, 0.45]} rotation={[0, -0.35, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.24, 0.38, 8]} />
          <meshStandardMaterial color="#4A4E51" metalness={0.8} roughness={0.25} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((finAngle, idx) => (
          <mesh key={idx} rotation={[0, finAngle, 0]} castShadow>
            <boxGeometry args={[0.56, 0.34, 0.018]} />
            <meshStandardMaterial color="#2E3234" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 4. Twin Mechanical Facsimile Cameras (Camera 1 & 2) */}
      {/* Camera 1 (East Top Deck) */}
      <group position={[0.42, 1.42, 0.65]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.075, 0.085, 0.52, 16]} />
          <meshStandardMaterial color="#353A3D" metalness={0.75} roughness={0.3} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        {/* Scanning Window Slit */}
        <mesh position={[0, 0.12, 0.08]}>
          <boxGeometry args={[0.04, 0.14, 0.02]} />
          <meshBasicMaterial color="#00F0FF" />
        </mesh>
      </group>

      {/* Camera 2 (West Top Deck) */}
      <group position={[0.42, 1.42, -0.65]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.075, 0.085, 0.52, 16]} />
          <meshStandardMaterial color="#353A3D" metalness={0.75} roughness={0.3} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        <mesh position={[0, 0.12, 0.08]}>
          <boxGeometry args={[0.04, 0.14, 0.02]} />
          <meshBasicMaterial color="#00F0FF" />
        </mesh>
      </group>

      {/* 5. Parabolic S-Band High-Gain Dish Antenna */}
      <group position={[-0.45, 1.65, 0]} rotation={[0.42, 0.2, -0.15]}>
        {/* Parabolic Dish Surface */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.48, 0.08, 0.16, 24, 1, true]} />
          <meshStandardMaterial color="#E8E5DD" metalness={0.4} roughness={0.35} side={THREE.DoubleSide} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        {/* Subreflector Feed Horn */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <coneGeometry args={[0.05, 0.12, 8]} />
          <meshStandardMaterial color="#948F82" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 6. Meteorology Boom (MET Mast) */}
      <group position={[0.62, 1.15, 0.32]}>
        {/* Extendable Vertical Mast */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.022, 1.44, 8]} />
          <meshStandardMaterial color="#BBB6A8" metalness={0.6} roughness={0.3} />
          <Outlines thickness={0.012} color="#090D16" />
        </mesh>
        {/* Sensor Cross Head (Wind Sensors & Thermocouples) */}
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[0.18, 0.06, 0.14]} />
          <meshStandardMaterial color="#4A4E51" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 7. Surface Sampler Collector Arm & Shroud (Extendable toward 1.8, 0.2, 2.2) */}
      <group position={[0.75, 1.05, 0.72]}>
        {/* Articulated Boom Housing */}
        <mesh position={[0, 0, 0]} rotation={[0, 0.45, 0]}>
          <boxGeometry args={[0.32, 0.22, 0.28]} />
          <meshStandardMaterial color="#5E6367" metalness={0.5} roughness={0.4} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        {/* Extendable Collector Arm pointing to Soil Trench */}
        <mesh position={[0.65, -0.42, 0.85]} rotation={[-0.45, 0.65, -0.32]} castShadow>
          <cylinderGeometry args={[0.032, 0.038, 1.65, 8]} />
          <meshStandardMaterial color="#E8E5DD" metalness={0.45} roughness={0.35} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        {/* Collector Shroud & Backhoe Scoop */}
        <mesh position={[1.15, -0.78, 1.45]} rotation={[-0.2, 0.85, 0]} castShadow>
          <boxGeometry args={[0.18, 0.12, 0.22]} />
          <meshStandardMaterial color="#783424" roughness={0.7} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
      </group>

      {/* 8. Biology Package & GCMS 500°C Pyrolysis Oven */}
      <group position={[-0.8, 1.15, -0.4]}>
        {/* TRW Miniaturized Biology Instrument Housing */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.38, 0.26, 0.34]} />
          <meshStandardMaterial color="#6E7377" metalness={0.5} roughness={0.35} />
          <Outlines thickness={0.014} color="#090D16" />
        </mesh>
        {/* Soil Receiving Funnel / Hopper on top deck */}
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.04, 0.1, 16]} />
          <meshStandardMaterial color="#A39D93" metalness={0.6} roughness={0.3} />
          <Outlines thickness={0.012} color="#090D16" />
        </mesh>
        {/* GCMS 500°C Pyrolysis Thermal Port */}
        <mesh position={[0.12, 0.14, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.03, 0.055, 16]} />
          <meshBasicMaterial color="#FF7A30" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * GLTF Model Loader for NASA Viking Lander
 * Traverses meshes, preserves textures, and attaches Outlines.
 */
function VikingGLTFModel({
  modelPath,
  position = [0, 0, 0],
  scale = 1.0,
}: {
  modelPath: string;
  position?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(modelPath, DECODER_PATH);

  const preparedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = true;
      node.receiveShadow = true;

      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((mat) => {
          mat.roughness = Math.max(mat.roughness ?? 0.4, 0.35);
          mat.metalness = Math.min(mat.metalness ?? 0.2, 0.8);
          mat.needsUpdate = true;
        });
      }
    });

    // Auto-center and normalize scale
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const targetSpan = 3.6; // Realistic Viking 1 span across footpads (~3.6m)
    const normalizedScale = (targetSpan / maxDim) * scale;

    const container = new THREE.Group();
    container.add(clone);
    clone.position.sub(center);
    // Align bottom of footpads to y=0
    clone.position.y += size.y * 0.48;
    container.scale.setScalar(normalizedScale);

    return container;
  }, [scene, scale]);

  return (
    <group position={position}>
      <primitive object={preparedScene} dispose={null} />
    </group>
  );
}

/**
 * Error boundary component for safe GLTF model loading
 */
class ModelErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('Viking GLB loading fallback engaged:', error.message);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/**
 * Primary Viking Hardware Rig Component
 *
 * Automatically positions the lander at (0, getChryseTerrainHeight(0,0), 0)
 * with graceful fallback to the procedural assembly.
 */
export function VikingHardwareRig({
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
}: VikingRigProps) {
  // Terrain-aligned baseline position at landing center (0, 0)
  const defaultPos: [number, number, number] = useMemo(() => {
    if (position) return position;
    const groundY = getChryseTerrainHeight(0, 0);
    return [0, groundY, 0];
  }, [position]);

  return (
    <group position={defaultPos} rotation={rotation}>
      <ModelErrorBoundary fallback={<VikingProceduralFallback position={[0, 0, 0]} />}>
        <Suspense fallback={<VikingProceduralFallback position={[0, 0, 0]} />}>
          <VikingGLTFModel
            modelPath={MODEL_PATHS[0]}
            position={[0, 0, 0]}
            scale={scale}
          />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}
