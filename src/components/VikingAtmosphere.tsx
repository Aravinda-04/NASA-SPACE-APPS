import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Authentic 1976 Viking 1 Panoramic Martian Atmosphere
 *
 * Implements the distinctive pinkish-butterscotch sky documented by
 * Viking 1's mechanical facsimile cameras (PIA00381 / PIA00393).
 *
 * - Suspended micron-scale ferric oxide dust particles scatter red/amber light,
 *   producing a #D98A6C horizon blending into a #8C4A32 zenith.
 * - Distance fog: Exponential fogExp2 with density 0.0065 and color #C87554.
 * - Directional sunlight: intensity 2.4, color #FFF3E0, with 2048x2048 shadow maps.
 */

export function ButterscotchSkyDome({ radius = 180 }: { radius?: number }) {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(radius, 40, 24);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    const horizonColor = new THREE.Color('#D98A6C');
    const zenithColor = new THREE.Color('#8C4A32');
    const nadirColor = new THREE.Color('#622C1A');
    const tempColor = new THREE.Color();

    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const normalizedY = y / radius; // -1 to 1

      if (normalizedY >= 0) {
        // Horizon to Zenith
        const t = Math.min(1, Math.pow(normalizedY, 0.72));
        tempColor.lerpColors(horizonColor, zenithColor, t);
      } else {
        // Horizon to Nadir
        const t = Math.min(1, Math.abs(normalizedY) * 2.0);
        tempColor.lerpColors(horizonColor, nadirColor, t);
      }

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [radius]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        vertexColors
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export function VikingAtmosphere() {
  return (
    <>
      {/* 1. Background sky & Exponential distance fog */}
      <color attach="background" args={['#C87554']} />
      <fogExp2 attach="fog" args={['#C87554', 0.0065]} />

      {/* 2. Panoramic Sky Dome (iron-oxide dust scattering) */}
      <ButterscotchSkyDome radius={190} />

      {/* 3. Martian Ambient & Hemisphere Lighting */}
      <ambientLight intensity={0.55} color="#FFE6D0" />
      <hemisphereLight
        args={['#F5D3B3', '#5A2318', 0.95]}
      />

      {/* 4. Directional Sunlight with 2048x2048 crisp shadow casting */}
      <directionalLight
        position={[-18, 26, 14]}
        intensity={2.4}
        color="#FFF3E0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={0.5}
        shadow-camera-far={90}
        shadow-bias={-0.0004}
      />
    </>
  );
}
