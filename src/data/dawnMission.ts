import type { ExpeditionMission } from '../types/expedition';

/** Dawn's spacecraft and destinations are presented as a schematic orbital encounter. */
export const DAWN_MISSION: ExpeditionMission = {
  id: 'dawn',
  chapter: 3,
  destination: 'Vesta and Ceres · Asteroid belt',
  name: 'Dawn',
  title: 'Two Worlds, One Spacecraft',
  subtitle: 'Ion propulsion carried one explorer into orbit around two ancient worlds.',
  question: 'What can two very different small worlds reveal about the early solar system?',
  introduction:
    'Launched in 2007, Dawn orbited the giant asteroid Vesta and then departed for the dwarf planet Ceres. Efficient ion propulsion made this unprecedented two-destination orbital mission possible.',
  arrival:
    'Your fictional expedition meets Dawn in a schematic Ceres orbit. Inspect the systems that moved it between worlds and the instruments that revealed two contrasting planetary histories.',
  legacy:
    'Dawn showed that neighboring building blocks could evolve very differently: Vesta became a dry, differentiated rocky world, while Ceres retained abundant water-related minerals, salts and evidence of geologically recent brines.',
  dateLabel: 'Launch: 27 Sep 2007 · mission end: 1 Nov 2018',
  statusLabel: 'Historical: spacecraft remains in stable orbit around Ceres',
  accent: '#8fb8c9',
  coordinatesLabel: 'Vesta, then Ceres · schematic orbital encounter',
  sceneNote:
    'Fictional astronaut encounter and schematic Ceres orbit. Spacecraft pose, destination scale, lighting and orbital path are illustrative. No live position, telemetry or visit is claimed.',
  discoveries: [
    {
      id: 'ion-propulsion',
      title: 'A gentle push for years',
      component: 'Xenon ion propulsion system',
      position: [0, -1.1, -1.2],
      cameraPosition: [0, -2.2, -3.5],
      summary: 'Small but sustained thrust let Dawn reshape its orbit and travel from Vesta to Ceres.',
      story:
        'Dawn used three ion engines, operating one at a time, to accelerate electrically charged xenon. The thrust was gentle, but it could continue for long periods with far less propellant than a comparable chemical system.',
      science:
        'The accumulated velocity change made it possible to enter orbit around Vesta, leave that orbit and later enter orbit around Ceres—the first mission to orbit two extraterrestrial destinations.',
      engineering:
        'Solar-generated electricity ionized xenon and accelerated the ions through charged grids. The resulting exhaust produced efficient continuous thrust rather than a short, powerful burn.',
      status:
        'Historical propulsion record. The blue plume in this reconstruction is an explanatory marker, not evidence that an engine is operating now.',
      evidence: 'Historical record',
      sourceIds: ['dawn-overview', 'dawn-spacecraft'],
    },
    {
      id: 'solar-arrays',
      title: 'Power across the asteroid belt',
      component: 'Two large solar-array wings',
      position: [-4.2, 0, 0],
      cameraPosition: [-6.5, 1.2, 2.2],
      summary: 'Wide solar arrays powered the spacecraft and its electric propulsion far from Earth.',
      story:
        'Dawn’s two solar wings stretched nearly 20 metres from tip to tip. They supplied power for instruments, communications and the ion propulsion system as sunlight weakened with distance from the Sun.',
      science:
        'Reliable solar-electric power enabled long-duration mapping at both destinations and the sustained thrust needed to move between them.',
      engineering:
        'The arrays produced less electricity at Ceres than near Earth, so mission plans balanced propulsion, spacecraft operations and scientific observations within the available power.',
      status:
        'Historical engineering description. This reconstruction normalizes the spacecraft model for inspection and does not preserve an exact physical scale.',
      evidence: 'Historical record',
      sourceIds: ['dawn-spacecraft'],
    },
    {
      id: 'science-instruments',
      title: 'Different measurements, one history',
      component: 'Framing cameras, VIR spectrometer and GRaND detector',
      position: [1.1, 0.2, 0.8],
      cameraPosition: [3.1, 1.4, 2.8],
      summary: 'Images, spectra, elemental measurements and radio tracking revealed complementary evidence.',
      story:
        'Dawn mapped shape and geology with framing cameras, studied minerals with its visible and infrared spectrometer, and measured elemental composition with a gamma-ray and neutron detector.',
      science:
        'Combining these observations helped researchers compare Vesta’s rocky differentiated structure with Ceres’s volatile-rich surface and interior.',
      engineering:
        'No single sensor supplied the whole conclusion. Camera context, mineral signatures, elemental abundance and gravity measurements constrained different parts of each world’s history.',
      status:
        'Historical instrument record. The archive presents published results rather than a live measurement or simulated scientific dataset.',
      evidence: 'Historical record',
      sourceIds: ['dawn-spacecraft', 'dawn-science'],
    },
    {
      id: 'ceres-salts',
      title: 'Bright evidence of brines',
      component: 'Occator Crater bright deposits archive',
      position: [4.85, -4.95, -4.65],
      cameraPosition: [4.85, -3.5, 2],
      summary: 'Bright carbonate salts connected Ceres’s surface to water-rich material below.',
      story:
        'Dawn observed exceptionally bright deposits in Occator Crater. Measurements identified salts, including sodium carbonate, associated with material that reached the surface from brines.',
      science:
        'The deposits indicate that Ceres was not simply an inert rock. Water-related chemistry and geologically recent activity changed how researchers understood the dwarf planet.',
      engineering:
        'Repeated imaging at different resolutions and spectral measurements allowed the team to compare landforms, color and mineral evidence without landing on Ceres.',
      status:
        'Historical scientific interpretation. The nearby dwarf planet is a stylized context model, not a georeferenced reconstruction of Occator Crater.',
      evidence: 'Historical record',
      sourceIds: ['ceres-brines', 'dawn-science'],
    },
  ],
  task: {
    question: 'Why was Dawn’s visit to both Vesta and Ceres scientifically valuable?',
    options: [
      'It allowed the same mission to compare two early worlds with very different geological histories.',
      'It proved that Vesta and Ceres have identical interiors and surfaces.',
      'It collected living organisms from both worlds and returned them to Earth.',
    ],
    correctIndex: 0,
    explanation:
      'Using one spacecraft and a complementary instrument suite made a direct comparison possible. Dawn found a dry, differentiated Vesta and a volatile-rich Ceres; it did not return samples or detect living organisms.',
  },
  sources: [
    {
      id: 'dawn-overview',
      title: 'Dawn mission overview',
      url: 'https://science.nasa.gov/mission/dawn/',
      credit: 'NASA Science',
    },
    {
      id: 'dawn-spacecraft',
      title: 'Dawn spacecraft and instruments',
      url: 'https://science.nasa.gov/mission/dawn/technology/spacecraft/',
      credit: 'NASA Science',
    },
    {
      id: 'dawn-science',
      title: 'Dawn science and discoveries',
      url: 'https://science.nasa.gov/mission/dawn/science/',
      credit: 'NASA Science',
    },
    {
      id: 'ceres-brines',
      title: 'Dawn data reveal recent brine activity on Ceres',
      url: 'https://www.nasa.gov/centers-and-facilities/jpl/mystery-solved-bright-areas-on-ceres-come-from-salty-water-below/',
      credit: 'NASA / JPL-Caltech',
    },
  ],
};
