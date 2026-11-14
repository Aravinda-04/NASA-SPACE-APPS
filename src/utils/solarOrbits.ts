export interface OrbitalElements {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  ascendingNode: number;
  argumentOfPeriapsis: number;
  trueAnomaly: number;
}

/** Heliocentric J2000 ecliptic → Three.js: (X,Y,Z) → (X,Z,-Y).
 * A rotation, with no radial compression: one world unit is exactly one AU.
 */
export function orbitPosition(elements: OrbitalElements, trueAnomaly = elements.trueAnomaly): [number, number, number] {
  const radians = Math.PI / 180;
  const anomaly = trueAnomaly * radians;
  const radius = elements.semiMajorAxis * (1 - elements.eccentricity ** 2) / (1 + elements.eccentricity * Math.cos(anomaly));
  const angle = anomaly + elements.argumentOfPeriapsis * radians;
  const node = elements.ascendingNode * radians;
  const inclination = elements.inclination * radians;
  const x = radius * (Math.cos(node) * Math.cos(angle) - Math.sin(node) * Math.sin(angle) * Math.cos(inclination));
  const y = radius * (Math.sin(node) * Math.cos(angle) + Math.cos(node) * Math.sin(angle) * Math.cos(inclination));
  const z = radius * Math.sin(angle) * Math.sin(inclination);
  return [x, z, -y];
}

/** An osculating ellipse at the reference epoch, not a propagated trajectory. */
export function sampleOrbit(elements: OrbitalElements, segments = 256): [number, number, number][] {
  return Array.from({ length: segments + 1 }, (_, i) => orbitPosition(elements, i * 360 / segments));
}

export function orbitExtent(elements: OrbitalElements) {
  return elements.semiMajorAxis * (1 + elements.eccentricity);
}

/** Fit a Sun-centred orbit sphere with margins for the chart's date/scale HUD. */
export function solarViewDistance(extent: number, aspect: number) {
  const halfVerticalFov = 20 * Math.PI / 180;
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * aspect);
  return extent / Math.sin(Math.min(halfVerticalFov, halfHorizontalFov)) * 1.28;
}
