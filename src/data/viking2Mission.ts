import type { ExpeditionMission } from '../types/expedition';

/** Viking 2 at Utopia Planitia, presented as a separate sister-lander episode. */
export const VIKING_2_MISSION: ExpeditionMission = {
  id: 'viking2',
  chapter: 2,
  destination: 'Utopia Planitia · Mars',
  name: 'Viking 2 · Gerald Soffen Station',
  title: 'Frost on the Plain of Utopia',
  subtitle: 'A sister lander carried the same laboratory into a colder, rockier world.',
  question: 'Why send two nearly identical laboratories to different places on Mars?',
  introduction:
    'Viking 2 landed in Utopia Planitia on 3 September 1976, about 6,460 kilometres from Viking 1. Its northern site was flatter, rockier and colder, letting the twin mission compare two distinct Martian environments.',
  arrival:
    'Your fictional expedition reaches the Gerald Soffen Memorial Station. Inspect the tilted lander, seasonal frost, weather instruments and the experiments that repeated Viking 1’s search for signs of life.',
  legacy:
    'Viking 2 extended the first successful Martian surface investigation to a second climate and terrain. Together, the twins showed why repeated measurements and environmental context matter when evidence is ambiguous.',
  dateLabel: 'Touchdown: 3 September 1976 · final data: 11 April 1980',
  statusLabel: 'Historical: inactive lander in Utopia Planitia',
  accent: '#9fc8d4',
  coordinatesLabel: 'Utopia Planitia · 47.64° N, 134.29° E',
  sceneNote:
    'Schematic Utopia Planitia inspection layout. Frost, rocks and instrument stations are illustrative and not a georeferenced reconstruction. The lander’s future condition is imagined; no live telemetry is shown.',
  discoveries: [
    {
      id: 'utopia-landing',
      title: 'A landing on uneven ground',
      component: 'Three-legged Viking lander',
      position: [0, 0.75, 0],
      cameraPosition: [3.2, 1.8, 4.1],
      summary: 'One foot settled on a rock, leaving the lander tilted about 8.5 degrees.',
      story:
        'Orbital photographs redirected Viking 2 from rougher terrain to Utopia Planitia. The lander arrived safely, but its rocky site left the deck tilted westward.',
      science:
        'A second landing site allowed researchers to compare terrain, weather and soil responses instead of assuming one location represented all of Mars.',
      engineering:
        'The lander descended behind an aeroshell and parachute, then used terminal descent engines and three leg assemblies for touchdown.',
      status: 'Historical landing configuration. This model preserves the recognizable hardware but only approximates the documented tilt.',
      evidence: 'Historical record',
      sourceIds: ['viking2-overview', 'viking-project'],
    },
    {
      id: 'utopia-frost',
      title: 'Frost changes the horizon',
      component: 'Seasonal surface-frost archive',
      position: [7.2, 0.18, -4.5],
      cameraPosition: [6.3, 1.7, -1.7],
      summary: 'Viking 2 photographed frost at its higher-latitude landing site.',
      story:
        'As seasons changed at Utopia Planitia, thin bright frost appeared on the ground. The cameras documented a surface that did not remain visually constant through the Martian year.',
      science:
        'Seasonal frost connected surface observations with temperature, atmospheric water and the climate of a northern landing site.',
      engineering:
        'The twin facsimile cameras built panoramas line by line and could revisit the same terrain to record changes over time.',
      status: 'Historical image record. The pale patch in this scene is an explanatory reconstruction, not simulated frost physics.',
      evidence: 'Historical record',
      sourceIds: ['frost-image', 'viking2-overview'],
    },
    {
      id: 'utopia-weather',
      title: 'Weather from another latitude',
      component: 'Meteorology boom and pressure sensor',
      position: [-0.7, 1.7, -0.2],
      cameraPosition: [-2.6, 2.1, 1.9],
      summary: 'Temperature, pressure and wind measurements placed the icy images in context.',
      story:
        'Viking 2 monitored daily and seasonal changes in temperature, pressure and wind at a site much farther north than Viking 1.',
      science:
        'Comparing two stations helped separate local conditions from broader atmospheric cycles and strengthened the first long-duration Martian climate record.',
      engineering:
        'A compact weather package combined sensors on and around the lander; radio links returned the measurements for analysis on Earth.',
      status: 'Historical observations ended with the lander mission in April 1980.',
      evidence: 'Historical record',
      sourceIds: ['viking2-overview', 'viking-science'],
    },
    {
      id: 'utopia-biology',
      title: 'Repeat the difficult question',
      component: 'Biology laboratory and soil sampler',
      position: [1.5, 0.55, 0.3],
      cameraPosition: [3.1, 1.6, 1.9],
      summary: 'A second set of soil tests produced activity but no clear evidence of organisms.',
      story:
        'Viking 2 collected soil on three occasions. Its biology experiments produced results similar to Viking 1, including chemical activity that could imitate a biological response.',
      science:
        'Replication at another site made the reactive soil harder to dismiss as a single local anomaly, but the combined evidence still did not confirm life.',
      engineering:
        'A sampler arm delivered soil to three biology experiments, a gas chromatograph mass spectrometer and an X-ray fluorescence instrument inside the stationary lander.',
      status: 'Historical astrobiology investigation. NASA describes the results as inconclusive for present or past surface life.',
      evidence: 'Historical record',
      sourceIds: ['viking2-overview', 'viking-astrobiology'],
    },
  ],
  task: {
    question: 'What was the strongest scientific reason for operating Viking 2 as a sister mission to Viking 1?',
    options: [
      'It let scientists compare repeated measurements from two different Martian environments.',
      'It proved every location on Mars has exactly the same weather and soil.',
      'It returned a living Martian organism to Earth for laboratory study.',
    ],
    correctIndex: 0,
    explanation:
      'The two landers carried closely related instruments to different sites. Agreement and disagreement between them helped scientists evaluate local variation, seasonal conditions and ambiguous soil chemistry; neither mission returned samples to Earth or confirmed life.',
  },
  sources: [
    { id: 'viking2-overview', title: 'Viking 2 mission overview', url: 'https://science.nasa.gov/mission/viking-2/', credit: 'NASA Science' },
    { id: 'viking-project', title: 'Viking Project landing sites and mission record', url: 'https://science.nasa.gov/mission/viking/', credit: 'NASA Science' },
    { id: 'viking-science', title: 'Viking spacecraft and science instruments', url: 'https://science.nasa.gov/mission/viking/spacecraft-and-science/', credit: 'NASA Science' },
    { id: 'viking-astrobiology', title: 'Viking Project and astrobiology', url: 'https://science.nasa.gov/astrobiology/missions/viking-project/', credit: 'NASA Astrobiology' },
    { id: 'frost-image', title: 'Frost at the Viking Lander 2 site · PIA00573', url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00573', credit: 'NASA/JPL-Caltech' },
  ],
};
