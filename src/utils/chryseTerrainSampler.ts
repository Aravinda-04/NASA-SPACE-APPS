import * as THREE from 'three';

/**
 * Chryse Planitia Terrain Sampler & Topography Engine
 *
 * Deterministic CPU-side elevation, normal, and vertex color generation
 * matching Viking 1's July 20, 1976 landing site at Chryse Planitia (22.27° N, 47.95° W).
 */

export const ARENA_SIZE = 240; // 240m x 240m arena
export const ARENA_SEGMENTS = 140; // 140x140 grid resolution

// Footpad #2 historical landing coordinates (sank 16.5cm into fine drift soil)
export const FOOTPAD_2_POS = { x: -1.72, z: -0.98 };
export const FOOTPAD_2_SINK_DEPTH = 0.165; // 16.5 cm depression

// Landmark "Big Joe" boulder location (~8m NW of lander)
export const BIG_JOE_POS = { x: -6.5, z: -4.8 };

// Color constants for Chryse Rust-Ochre Toon Gradient
export const CHRYSE_COLORS = {
  deepBasalt: new THREE.Color('#5A2318'), // Lowland trenches & basalt pockets (height < -0.3m)
  rustOchre: new THREE.Color('#B84B29'),  // Mid-plain regolith (-0.3m <= height < 0.8m)
  butterscotch: new THREE.Color('#E28749'), // Sunlit dune crests (height >= 0.8m)
};

// Touchdown pad resting attitude: -2.5° tilt toward southwest (approx 210° azimuth)
const TILT_ANGLE_RAD = (-2.5 * Math.PI) / 180; // -0.043633 rad
const TILT_DIR_X = Math.cos((210 * Math.PI) / 180);
const TILT_DIR_Z = Math.sin((210 * Math.PI) / 180);

// Northeast-to-Southwest prevailing Martian wind vector
// Direction from NE (45°) blowing toward SW (225°)
const WIND_NX = -0.70710678; // -1 / sqrt(2)
const WIND_NZ = -0.70710678; // -1 / sqrt(2)
const CROSS_NX = -0.70710678;
const CROSS_NZ = 0.70710678;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Returns deterministic terrain elevation (y) at world coordinates (x, z).
 */
export function getChryseTerrainHeight(x: number, z: number): number {
  const radius = Math.hypot(x, z);

  // 1. Touchdown Pad zone (radius < 12m)
  // Viking 1's actual resting attitude: gentle -2.5° tilt
  const tiltSlope = Math.tan(TILT_ANGLE_RAD);
  const padTiltHeight = (x * TILT_DIR_X + z * TILT_DIR_Z) * tiltSlope;

  // Footpad #2 localized sink depression (16.5cm into drift soil)
  const dX2 = x - FOOTPAD_2_POS.x;
  const dZ2 = z - FOOTPAD_2_POS.z;
  const fp2DistSq = dX2 * dX2 + dZ2 * dZ2;
  const fp2Depression = -FOOTPAD_2_SINK_DEPTH * Math.exp(-fp2DistSq / (2 * 0.45 * 0.45));

  const padElevation = padTiltHeight + fp2Depression;

  if (radius < 8.0) {
    return padElevation;
  }

  // 2. Aeolian Drift Dunes (12m < radius < 85m)
  // Projected coordinate along prevailing NE-to-SW wind vector
  const u = x * WIND_NX + z * WIND_NZ;
  const v = x * CROSS_NX + z * CROSS_NZ;

  // Primary rolling dunes: wavelength ~19m, height ~0.65m with asymmetric slip faces
  const primaryWave = Math.sin((u / 19.0) * Math.PI * 2.0);
  const primaryHarmonic = Math.sin((u / 9.5) * Math.PI * 2.0) * 0.28;
  const crossModulation = Math.cos((v / 31.0) * Math.PI * 2.0) * 0.4 + 0.6;
  const primaryDunes = (primaryWave + primaryHarmonic) * 0.65 * crossModulation;

  // Secondary transverse sediment ripples: wavelength ~6.2m, height ~0.22m
  const rippleWave = Math.sin(((u * 0.85 + v * 0.52) / 6.2) * Math.PI * 2.0);
  const secondaryRipples = rippleWave * 0.22;

  // Subtle basalt gravel micro-texture
  const microNoise = Math.sin(x * 1.4 + z * 0.9) * Math.cos(x * 0.7 - z * 1.2) * 0.06;

  const duneElevation = padElevation * 0.4 + primaryDunes + secondaryRipples + microNoise;

  // Blend touchdown pad into dune field between radius 8m and 12m
  const padToDuneBlend = smoothstep(8.0, 12.0, radius);
  const plainElevation = (1 - padToDuneBlend) * padElevation + padToDuneBlend * duneElevation;

  if (radius < 85.0) {
    return plainElevation;
  }

  // 3. Outer Crater Rim Horizon (radius >= 85m) with 2.5x vertical relief exaggeration
  const rimProgress = smoothstep(85.0, 120.0, radius);
  const angle = Math.atan2(z, x);

  // Basin silhouette ridges
  const ridgeHarmonics =
    Math.sin(angle * 3.0) * 3.4 +
    Math.cos(angle * 7.0 + 1.2) * 2.2 +
    Math.sin(angle * 13.0 - 0.7) * 1.4;

  const baseRimRamp = Math.pow(Math.max(0, radius - 85.0) / 35.0, 1.8) * 9.5;
  const rimRelief = (baseRimRamp + ridgeHarmonics * rimProgress) * 2.5; // 2.5x vertical relief exaggeration

  return plainElevation + rimProgress * rimRelief;
}

/**
 * Returns deterministic surface normal Vector3 at world coordinates (x, z) via central differences.
 */
export function getChryseTerrainNormal(x: number, z: number): THREE.Vector3 {
  const eps = 0.08;
  const hL = getChryseTerrainHeight(x - eps, z);
  const hR = getChryseTerrainHeight(x + eps, z);
  const hD = getChryseTerrainHeight(x, z - eps);
  const hU = getChryseTerrainHeight(x, z + eps);

  const normal = new THREE.Vector3(-(hR - hL), 2 * eps, -(hU - hD));
  return normal.normalize();
}

/**
 * Returns the Chryse Rust-Ochre Toon color corresponding to a given surface elevation.
 */
export function getChryseTerrainColor(height: number): THREE.Color {
  const result = new THREE.Color();
  if (height < -0.3) {
    // Lowland trenches & basalt pockets (height < -0.3m)
    const t = Math.max(0, Math.min(1, (height + 1.0) / 0.7));
    result.lerpColors(CHRYSE_COLORS.deepBasalt, CHRYSE_COLORS.rustOchre, t * 0.4);
  } else if (height < 0.8) {
    // Mid-plain regolith (-0.3m <= height < 0.8m)
    const t = (height - (-0.3)) / (0.8 - (-0.3));
    result.lerpColors(CHRYSE_COLORS.deepBasalt, CHRYSE_COLORS.rustOchre, t);
  } else {
    // Sunlit dune crests (height >= 0.8m)
    const t = Math.min(1, (height - 0.8) / 1.6);
    result.lerpColors(CHRYSE_COLORS.rustOchre, CHRYSE_COLORS.butterscotch, t);
  }
  return result;
}

/**
 * Builds a deterministic PlaneGeometry with heights and vertex colors populated.
 */
export function buildChryseTerrainGeometry(
  size = ARENA_SIZE,
  segments = ARENA_SEGMENTS
): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);

  const tempColor = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const y = getChryseTerrainHeight(x, z);

    positions.setY(i, y);

    const c = getChryseTerrainColor(y);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generates 32 deterministic basalt rock transform matrices
 * keeping a 3.5m clearance corridor around the lander (0,0) and soil trenches (1.8, 2.2).
 */
export function generateBasaltRockTransforms(count = 32): Array<{
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}> {
  // Deterministic LCG pseudo-random generator
  let seed = 19760720; // Sol 1 landing date
  const random = () => {
    seed = Math.imul(1664525, seed) + 1013904223;
    return (seed >>> 0) / 4294967296;
  };

  const rocks: Array<{
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
  }> = [];

  let attempts = 0;
  while (rocks.length < count && attempts < 800) {
    attempts++;
    const angle = random() * Math.PI * 2;
    const dist = 3.6 + random() * 48.0; // Starts outside 3.5m walking corridor
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;

    // Corridor checks: clear 3.5m around lander deck
    if (Math.hypot(x, z) < 3.5) continue;

    // Clear 2.2m around sampler trench at (1.8, 2.2)
    if (Math.hypot(x - 1.8, z - 2.2) < 2.2) continue;

    // Clear 3.0m around "Big Joe" at (-6.5, -4.8)
    if (Math.hypot(x - BIG_JOE_POS.x, z - BIG_JOE_POS.z) < 3.0) continue;

    const y = getChryseTerrainHeight(x, z);
    const baseScale = 0.25 + random() * 0.75;
    const aspectY = 0.5 + random() * 0.45;
    const aspectZ = 0.8 + random() * 0.4;

    const rockColor = random() > 0.4 ? '#3E2723' : '#4E342E';

    rocks.push({
      position: [x, y + (baseScale * aspectY * 0.45), z],
      rotation: [random() * 0.4, random() * Math.PI * 2, random() * 0.4],
      scale: [baseScale, baseScale * aspectY, baseScale * aspectZ],
      color: rockColor,
    });
  }

  return rocks;
}
