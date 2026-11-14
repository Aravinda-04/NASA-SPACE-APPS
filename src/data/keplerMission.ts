import type { ExpeditionMission } from '../types/expedition';

/** Kepler is presented as an observatory inspection, not a journey to an exoplanet. */
export const KEPLER_MISSION: ExpeditionMission = {
  id: 'kepler',
  chapter: 3,
  destination: 'Earth-trailing solar orbit · star field',
  name: 'Kepler / K2 Space Telescope',
  title: 'The Shadows of Other Worlds',
  subtitle: 'A telescope measured tiny changes in starlight and revealed a galaxy rich in planets.',
  question: 'How can a planet too distant to photograph reveal its size and orbit?',
  introduction:
    'Launched in 2009, Kepler continuously measured the brightness of a dense field of stars. Repeating dips in a star’s light could reveal a planet crossing in front of it, while further observations and analysis tested other explanations.',
  arrival:
    'Your fictional expedition meets the retired observatory in its heliocentric orbit. Inspect the telescope, detector, pointing systems and the observation geometry behind the transit method.',
  legacy:
    'Kepler and its K2 extension established that planets are common, revealed thousands of worlds and left a public archive that scientists continue to investigate after the spacecraft’s retirement.',
  dateLabel: 'Launch: 7 Mar 2009 UTC · retired: 30 Oct 2018',
  statusLabel: 'Historical: retired in a safe heliocentric orbit',
  accent: '#7cb6e8',
  coordinatesLabel: 'Earth-trailing solar orbit · no live tracking',
  sceneNote:
    'Fictional astronaut encounter. Telescope pose, star positions, viewing cone, transit diagram and spacecraft distance are schematic. Kepler observed stars from solar orbit; it did not travel to the exoplanets it detected.',
  discoveries: [
    {
      id: 'photometer',
      title: 'A camera built for precision',
      component: 'Schmidt telescope and photometer',
      position: [0, 1.4, 0.8],
      cameraPosition: [0, 2.8, 4.2],
      summary: 'A wide-field telescope measured many stars at once instead of producing ordinary close-up photographs.',
      story:
        'Kepler’s photometer used a 0.95-metre aperture, a 1.4-metre primary mirror and a large CCD focal plane to monitor a broad star field with exceptional stability.',
      science:
        'Recording many stars repeatedly made it possible to search for small, regular changes in brightness and to estimate how frequently planets occur.',
      engineering:
        'The spacecraft supplied power, precise pointing, data storage and monthly communications while the photometer stared at its selected field. Stability mattered because spacecraft motion can imitate brightness changes.',
      status:
        'Historical hardware description. The displayed model is normalized for inspection and does not preserve the spacecraft’s physical scale.',
      evidence: 'Historical record',
      sourceIds: ['kepler-mission', 'kepler-spacecraft'],
    },
    {
      id: 'transit-method',
      title: 'A repeating shadow',
      component: 'Transit light-curve observation',
      position: [0, 1.8, -9.5],
      cameraPosition: [0, 2.5, -3.5],
      summary: 'A planet crossing its star can produce a small, repeating dip in measured brightness.',
      story:
        'Kepler searched for transits: alignments in which an orbiting planet passes across the face of its host star from the telescope’s viewpoint.',
      science:
        'The depth of a transit helps estimate a planet’s size relative to its star, while the time between repeated transits gives its orbital period. Not every planet is aligned to transit, and not every dip is a planet.',
      engineering:
        'Detection depended on calibrated pixels, stable pointing and algorithms that compared repeated measurements. Candidate signals required additional checks against eclipsing stars, instrument effects and other false positives.',
      status:
        'The star, orbit and light curve in this scene are explanatory geometry, not a reconstruction of a specific Kepler planetary system.',
      evidence: 'Reconstruction',
      sourceIds: ['kepler-mission', 'kepler-results'],
    },
    {
      id: 'k2-balance',
      title: 'A telescope learns to balance',
      component: 'Reaction wheels, solar panels and K2 pointing strategy',
      position: [3.4, 0, 0],
      cameraPosition: [6, 1.5, 2.5],
      summary: 'After two reaction wheels failed, engineers used balanced sunlight pressure to support a second mission.',
      story:
        'The original survey ended after a second reaction-wheel failure prevented Kepler from holding its original field precisely. Engineers repurposed the observatory as K2.',
      science:
        'K2 observed a sequence of fields near the ecliptic, extending planet searches while also studying stars, clusters, galaxies and transient events.',
      engineering:
        'Two surviving reaction wheels controlled two axes. Pointing along the orbital plane reduced roll disturbance by balancing solar radiation pressure, with periodic thruster corrections managing drift.',
      status:
        'Historical engineering record. The arrows and balance line in this scene explain forces; they are not telemetry from an operating spacecraft.',
      evidence: 'Historical record',
      sourceIds: ['k2-mission', 'k2-engineering'],
    },
    {
      id: 'planet-statistics',
      title: 'From individual dips to a galaxy',
      component: 'Kepler and K2 science archive',
      position: [-3.4, -0.3, 0],
      cameraPosition: [-6, 1.2, 2.5],
      summary: 'Thousands of detections transformed the question from whether other planets exist to how common they are.',
      story:
        'Across its prime and K2 missions, Kepler observed more than half a million stars and enabled the discovery of thousands of planets with a wide range of sizes and orbits.',
      science:
        'The mission showed that planets are common and that small planets are abundant. Statistical conclusions account for observing limits, including the fact that only suitably aligned systems transit.',
      engineering:
        'Kepler’s lasting product is its calibrated archive as well as its spacecraft discoveries. Researchers can reanalyze the stored measurements with improved methods after the mission has ended.',
      status:
        'Historical scientific legacy. No live survey or current spacecraft communication is represented here.',
      evidence: 'Historical record',
      sourceIds: ['kepler-results', 'kepler-legacy'],
    },
  ],
  task: {
    question: 'What does a repeating transit signal allow scientists to infer most directly?',
    options: [
      'The approximate planet-to-star size ratio and the planet’s orbital period.',
      'A detailed photograph of the planet’s surface and inhabitants.',
      'That every planet in the system crosses the star from Earth’s viewpoint.',
    ],
    correctIndex: 0,
    explanation:
      'Transit depth constrains relative size and the interval between transits gives orbital period. The method does not image a surface, and orbital alignment means many planets never transit from our viewpoint.',
  },
  sources: [
    {
      id: 'kepler-mission',
      title: 'Kepler mission history',
      url: 'https://science.nasa.gov/mission/kepler/',
      credit: 'NASA Science',
    },
    {
      id: 'kepler-spacecraft',
      title: 'Kepler spacecraft and photometer',
      url: 'https://science.nasa.gov/resource/kepler-spacecraft/',
      credit: 'NASA / Kepler / Ball Aerospace',
    },
    {
      id: 'k2-mission',
      title: 'K2 mission pointing strategy',
      url: 'https://science.jpl.nasa.gov/projects/k2/',
      credit: 'NASA Jet Propulsion Laboratory',
    },
    {
      id: 'k2-engineering',
      title: 'Understanding the Kepler reaction wheels and satellite',
      url: 'https://ntrs.nasa.gov/citations/20180007379',
      credit: 'NASA Technical Reports Server · NASA Ames',
    },
    {
      id: 'kepler-results',
      title: 'Kepler science results',
      url: 'https://science.nasa.gov/resource/keplers-science-results/',
      credit: 'NASA Science',
    },
    {
      id: 'kepler-legacy',
      title: 'What Kepler taught us',
      url: 'https://science.nasa.gov/universe/exoplanets/what-did-kepler-teach-us-celebrating-the-space-telescope-10-years-after-launch/',
      credit: 'NASA Science',
    },
  ],
};
