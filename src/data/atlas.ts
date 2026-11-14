import { SOLAR_EPHEMERIS } from './solarEphemeris';
import { orbitPosition, sampleOrbit } from '../utils/solarOrbits';

export const SOLAR_REFERENCE_DATE = '30 Oct 2018 · 00:00 TDB';
export const SOLAR_ATLAS_BODIES = [
  { id: 'sun', name: 'Sun', kind: 'star', position: [0, 0, 0] as [number, number, number], markerPixels: 10, color: '#edb76b', elements: undefined, orbit: undefined },
  ...SOLAR_EPHEMERIS.map(body => ({ ...body, position: orbitPosition(body.elements), orbit: sampleOrbit(body.elements) })),
];

export const PLANET_TEXTURES = {
  moon: { color: '/images/atlas/moon-color.jpg', relief: '/images/atlas/moon-relief.jpg', credit: 'NASA SVS / LRO · LROC & LOLA', source: 'https://svs.gsfc.nasa.gov/4720/' },
  mars: { color: '/images/atlas/mars-color.jpg', relief: undefined, credit: 'NASA / JPL-Caltech · Viking / USGS mosaic', source: 'https://science.nasa.gov/3d-resources/mars/' },
};
