import type { ExpeditionMission } from '../types/expedition';

/**
 * Viking 1 Lander Expedition Mission Definition
 *
 * Chryse Planitia (22.27° N, 47.95° W)
 * Historical Touchdown: 20 July 1976
 * Final Transmission: 11 November 1982 (2,245 Martian Sols)
 */
export const VIKING_MISSION: ExpeditionMission = {
  id: 'viking' as any,
  chapter: 2,
  destination: 'Mars',
  name: 'Viking 1 · Thomas A. Mutch Station',
  title: 'The First Long-Lived Surface Observatory',
  subtitle: 'A touchdown in Chryse Planitia. Two cameras, a shovel, and a chemistry riddle.',
  question: 'What happens when life-detection instruments disagree?',
  introduction:
    'On July 20, 1976, Viking 1 became the first spacecraft to operate long-term on the surface of Mars. In Chryse Planitia, its mechanical cameras, surface sampler, and miniature biology laboratories opened humanity’s first direct view of the Martian surface.',
  arrival:
    'On this fictional future visit, inspect the lander on Chryse Planitia. Walk the plain, examine "Big Joe", and open the archive to investigate the famous 1976 biology paradox.',
  legacy:
    'Operating across 2,245 sols, Viking 1 established humanity’s baseline Martian weather record. In 1984, NASA officially named the lander the Thomas A. Mutch Memorial Station in honor of the imaging science team leader.',
  dateLabel: 'Touchdown: 20 July 1976 · Chryse Planitia',
  statusLabel: 'Historical: final transmission 11 November 1982',
  accent: '#b84b29',
  coordinatesLabel: 'Chryse Planitia · 22.27° N, 47.95° W',
  sceneNote:
    'Schematic inspection layout, not a continuous geographic site. The lander, "Big Joe", and Sandy Flats trench are illustrative reconstructions for demonstration. Future condition is imagined; no live telemetry is shown.',
  discoveries: [
    {
      id: 'sampler-arm',
      title: 'A shovel on Mars',
      component: 'Surface sampler collector arm',
      position: [1.75, 0.45, 0.12],
      cameraPosition: [2.6, 1.7, 1.2],
      summary: 'A mechanical arm freed itself to dig humanity’s first trench in Martian soil.',
      story:
        'On Sol 2 the collector arm stalled because a mechanical locking pin failed to release. Engineers commanded a vibration sequence on Sol 5 that freed the pin directly into Footpad #3, allowing the arm to dig the famous "Sandy Flats" trench on Sol 8.',
      science:
        'Subsurface soil was protected from solar ultraviolet radiation, making it essential for biology and organic chemistry tests.',
      engineering:
        'The 3.05-meter tubular steel boom rolled out like a carpenter tape measure. A backhoe-style shroud prevented fine drift sand from spilling during delivery to the deck hoppers.',
      status:
        'Historical operation (1976). The boom operated for years, digging multiple trenches and testing magnetic dust adhesion.',
      evidence: 'Historical record',
      sourceIds: ['sampler-history', 'footpad-pin'],
    },
    {
      id: 'facsimile-cameras',
      title: 'Line by line',
      component: 'Twin mechanical facsimile cameras',
      position: [-0.77, 1.05, 0.77],
      cameraPosition: [-0.77, 1.7, 2.3],
      summary: 'Instead of television chips, Viking used nodding mirrors to scan Mars line by line.',
      story:
        'Minutes after touchdown on July 20, 1976, Camera 2 began scanning Footpad #3 to confirm ground stability. Moments later, Camera 1 swept across the horizon to reveal the rolling red plain and the landmark boulder "Big Joe".',
      science:
        'Three sequential vertical sweeps through red, green, and blue optical filters proved the Martian sky was butterscotch-pink due to suspended iron-oxide dust rather than black or blue.',
      engineering:
        'Built by Itek, each camera scanned vertically using a nodding mirror and a single photodiode array, rotating horizontally 0.04° between lines. A full panorama took several minutes.',
      status:
        'Historical imaging (1976–1982). Documented seasonal frost, dust storms, and micro-dune migrations.',
      evidence: 'Historical record',
      sourceIds: ['first-photo', 'big-joe-photo'],
    },
    {
      id: 'biology-gcms',
      title: 'The chemistry puzzle',
      component: 'Biological package & GCMS oven',
      position: [-0.47, 0.95, -0.75],
      cameraPosition: [-0.47, 1.7, -2.1],
      summary: 'A radioactive gas surge clashed with zero detected organic molecules.',
      story:
        'When nutrient broth touched Chryse soil in the Labeled Release (LR) chamber, radioactive gas spiked—initially appearing positive for microbial life. Yet the GCMS heated soil to 500°C and detected zero organic carbon molecules.',
      science:
        'In 2008, the Phoenix lander resolved the contradiction: Martian soil contains perchlorates (ClO₄⁻). When heated to 500°C in the GCMS oven, perchlorates break down and incinerate organic molecules before detection!',
      engineering:
        'TRW packed three biological experiments and 40,000 components into 1 cubic foot (0.028 m³). Regolith was distributed into pressurized micro-test cells by a central rotating carousel.',
      status:
        'Historical astrobiology investigation (1976). Established that soil oxidizers must be characterized before claiming biosignatures.',
      evidence: 'Historical record',
      sourceIds: ['biology-source', 'gcms-source'],
    },
    {
      id: 'rtg-comms',
      title: 'The silent sol',
      component: 'SNAP-19 RTGs & S-band dish antenna',
      position: [-0.50, 1.65, -0.13],
      cameraPosition: [-1.2, 1.7, -0.13],
      summary: 'Plutonium power lasted six years until an antenna command severed contact.',
      story:
        'Powered by twin SNAP-19 RTGs (70W electrical), Viking 1 operated for 2,245 sols. On November 11, 1982, ground command sequence 004 accidentally overwrote the high-gain antenna pointing tables, turning the dish away from Earth permanently.',
      science:
        'Over three full Martian years, Viking recorded daily weather (air temperature -14°C to -120°C, atmospheric pressure, wind speeds), establishing humanity’s baseline Martian climatology.',
      engineering:
        'The 76-cm parabolic reflector maintained line-of-sight tracking with the Deep Space Network. Once pointed away, the receiver could no longer hear ground correction commands.',
      status:
        'Historical final transmission (1982). In 1984, NASA named the inactive lander the Thomas A. Mutch Memorial Station.',
      evidence: 'Historical record',
      sourceIds: ['final-transmission', 'mutch-station'],
    },
  ],
  task: {
    question:
      'Which conclusion is supported by modern analysis of Viking 1’s soil experiments?',
    options: [
      'Viking 1 photographed living alien microbes.',
      'Viking 1 revealed highly reactive oxidizing chemistry (perchlorates), but could not confirm living organisms.',
      'A single temperature measurement proved that Mars has liquid oceans under the surface.',
    ],
    correctIndex: 1,
    explanation:
      'The combined chemical data revealed reactive soil oxidizers (perchlorates). While the Labeled Release test reacted strongly to nutrients, the absence of clear organic molecules meant scientists could not confirm living microbes.',
  },
  sources: [
    {
      id: 'sampler-history',
      title: 'NASA SP-4212: Viking Surface Sampler Deployment',
      url: 'https://history.nasa.gov/SP-4212/ch10-5.html',
      credit: 'NASA History Division',
    },
    {
      id: 'footpad-pin',
      title: 'PIA00384: Locking Pin in Footpad #3',
      url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00384',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'first-photo',
      title: 'PIA00381: First Photograph from Mars Surface',
      url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00381',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'big-joe-photo',
      title: 'PIA00393: 300-Degree Chryse Panorama with "Big Joe"',
      url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00393',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'biology-source',
      title: 'NASA Astrobiology: The Viking Biology Experiments',
      url: 'https://astrobiology.nasa.gov/missions/viking/',
      credit: 'NASA Astrobiology Program',
    },
    {
      id: 'gcms-source',
      title: 'Search for Organic Matter on Mars (Biemann et al.)',
      url: 'https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/JS082i028p04641',
      credit: 'Journal of Geophysical Research',
    },
    {
      id: 'final-transmission',
      title: 'The Viking 1 Lander Final Transmission',
      url: 'https://science.nasa.gov/mission/viking-1/',
      credit: 'NASA Science Missions',
    },
    {
      id: 'mutch-station',
      title: 'Thomas A. Mutch Memorial Station Designation',
      url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C',
      credit: 'NASA NSSDC',
    },
  ],
};
