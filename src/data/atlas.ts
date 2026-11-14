/** Display geometry only. Radii, sizes and angular placements are deliberately
 * compressed and are not ephemerides, astronomical units or measured trajectories.
 */
export const SOLAR_ATLAS_BODIES = [
  { id: "sun", name: "Sun", position: [0, 0, 0], size: .36, color: "#edb76b" },
  { id: "earth", name: "Earth", position: [1.05, 0, .85], size: .12, color: "#78b3c0" },
  { id: "mars", name: "Mars", position: [-1.8, 0, 1.05], size: .09, color: "#c77a52" },
  { id: "eros", name: "Eros", position: [-1.45, 0, -.85], size: .065, color: "#c6b8a3" },
  { id: "vesta", name: "Vesta", position: [2.35, 0, -2.1], size: .08, color: "#a7a79b" },
  { id: "ceres", name: "Ceres", position: [-2.7, 0, -2.35], size: .13, color: "#a2a79d" },
  { id: "jupiter", name: "Jupiter", position: [4.1, 0, 2.85], size: .36, color: "#ccaa86" },
  { id: "heliocentric", name: "Kepler · solar orbit", position: [.3, 0, -1.32], size: .07, color: "#ddcd8c" },
] as const;

export const PLANET_TEXTURES = {
  moon: { color: '/images/atlas/moon-color.jpg', relief: '/images/atlas/moon-relief.jpg', credit: 'NASA SVS / LRO · LROC & LOLA', source: 'https://svs.gsfc.nasa.gov/4720/' },
  mars: { color: '/images/atlas/mars-color.jpg', relief: undefined, credit: 'NASA / JPL-Caltech · Viking / USGS mosaic', source: 'https://science.nasa.gov/3d-resources/mars/' },
};
