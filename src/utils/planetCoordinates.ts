export type AtlasMotionState = "idle" | "user-rotating" | "focusing" | "focused" | "resetting";

/** East-positive longitudes, north-positive latitudes, both in degrees. */
export function wrapLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

/** Matches Three.js SphereGeometry and a 0°-centred equirectangular texture.
 * u = (longitude + 180) / 360; v = (latitude + 90) / 180.
 * Y is north. A positive east longitude moves toward negative world Z.
 */
export function planetCoordinateToVector(latitude: number, longitude: number, radius = 1) {
  if (![latitude, longitude, radius].every(Number.isFinite) || Math.abs(latitude) > 90 || radius <= 0)
    throw new RangeError("A planetary coordinate requires valid degrees and a positive radius.");
  const lat = latitude * Math.PI / 180, lon = wrapLongitude(longitude) * Math.PI / 180;
  return [radius * Math.cos(lat) * Math.cos(lon), radius * Math.sin(lat), -radius * Math.cos(lat) * Math.sin(lon)] as [number, number, number];
}

export function shortestAngleDelta(from: number, to: number) {
  return ((to - from + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
}

export const easeAtlasFocus = (progress: number) => 1 - (1 - Math.max(0, Math.min(1, progress))) ** 3;
