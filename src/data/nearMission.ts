import type { ExpeditionMission } from '../types/expedition';

/**
 * NEAR Shoemaker (Near Earth Asteroid Rendezvous) Mission Definition
 *
 * Asteroid 433 Eros (Orbital insertion: 14 Feb 2000 · Touchdown: 12 Feb 2001)
 * First spacecraft to orbit and land on an asteroid
 */
export const NEAR_MISSION: ExpeditionMission = {
  id: 'near',
  chapter: 3,
  destination: 'Asteroid 433 Eros · Deep space',
  name: 'NEAR Shoemaker',
  title: 'The Asteroid Rendezvous',
  subtitle: 'An orbital survey finishes with history’s first soft landing on a small body.',
  question: 'Can a spacecraft land on an asteroid without landing gear?',
  introduction:
    'Launched in 1996, NEAR Shoemaker became the first spacecraft to orbit a small celestial body when it reached asteroid 433 Eros on Valentine’s Day 2000. Exactly one year later, despite never being designed as a lander, the team commanded a historic five-engine descent directly onto the asteroid’s surface.',
  arrival:
    'Your fictional expedition has made an imagined orbital rendezvous. Use your jetpack to inspect NEAR Shoemaker high above the cratered ridges of 433 Eros, then open the records of humanity’s first asteroid landing.',
  legacy:
    'Designed purely as an orbital spacecraft, NEAR Shoemaker touched down on Eros at gentle walking speed (1.5–1.8 m/s) on February 12, 2001. Surviving impact on its solar panel tips, it transmitted gamma-ray spectra directly from the surface for 16 days, proving that Eros is a primitive, undifferentiated remnant of the early solar system.',
  dateLabel: 'Orbit: 14 Feb 2000 · Touchdown: 12 Feb 2001',
  statusLabel: 'Historical: final surface transmission 28 February 2001',
  accent: '#c9a04a',
  coordinatesLabel: 'Asteroid 433 Eros · 35° S, 81° W (touchdown site)',
  sceneNote:
    'Fictional astronaut rendezvous. Spacecraft pose, lighting, and asteroid proximity are illustrative reconstructions. There is no claim that the spacecraft has been revisited or reactivated.',
  discoveries: [
    {
      id: 'high-gain-dish',
      title: 'A fixed voice to Earth',
      component: '1.5-meter parabolic high-gain antenna',
      position: [0.0, 1.35, 0.0],
      cameraPosition: [0.0, 2.7, 2.5],
      summary:
        'A fixed 1.5-meter dish required the entire spacecraft to reorient between photographing Eros and transmitting to Earth.',
      story:
        'Unlike orbiters with articulated dish gimbals, NEAR Shoemaker’s 1.5-meter parabolic reflector was rigidly mounted to the bus to minimize moving parts and launch mass. To transmit science data across 300 million kilometers back to the Deep Space Network, the spacecraft had to use its reaction wheels to pivot away from the asteroid and aim directly toward Earth.',
      science:
        'Precise radio Doppler measurements of the radio carrier signal let navigators map Eros’s uneven gravity field in three dimensions, determining its bulk density (2,670 kg/m³) is nearly identical to Earth’s continental crust.',
      engineering:
        'The X-band antenna fed a 5-watt solid-state power amplifier, achieving data rates up to 26.5 kbps. Two medium-gain horn antennas and a low-gain omnidirectional system provided emergency communications in any orientation.',
      status:
        'Historical operation (1996–2001). The dish maintained carrier lock through the final descent, confirming touchdown on the surface of Eros.',
      evidence: 'Historical record',
      sourceIds: ['near-mission', 'near-telecom'],
    },
    {
      id: 'solar-wings',
      title: 'Sunlight past Mars',
      component: 'Four-panel gallium arsenide solar array',
      position: [-2.4, 0.75, 0.0],
      cameraPosition: [-3.8, 1.5, 1.8],
      summary:
        'Four rigid wings spanning 5.6 meters made NEAR one of the first solar-powered missions beyond Mars.',
      story:
        'Prior deep-space missions to the outer solar system relied on nuclear RTG batteries. NEAR Shoemaker pioneered the use of high-efficiency gallium arsenide solar cells spanning four fixed rectangular wings, producing 1,800 watts at Earth and 400 watts at Eros’s orbital distance of 1.78 AU.',
      science:
        'Operating so far from the Sun demonstrated that solar power was viable for asteroid exploration, establishing the engineering heritage later used by missions like Dawn, Rosetta, and OSIRIS-REx.',
      engineering:
        'The array spanned 5.6 meters tip-to-tip. During the February 2001 landing, the bottom edges of these very solar panels touched the rocky regolith of Eros first, absorbing the 1.5 m/s impact without fracturing the main bus.',
      status:
        'Historical operation (1996–2001). The panels generated sufficient power on the asteroid’s surface to operate the gamma-ray spectrometer for over two weeks.',
      evidence: 'Historical record',
      sourceIds: ['near-mission', 'near-power'],
    },
    {
      id: 'science-deck',
      title: 'Lasers and color eyes',
      component: 'Multispectral Imager (MSI) & Laser Rangefinder (NLR)',
      position: [0.85, -0.65, 0.75],
      cameraPosition: [2.2, -0.2, 1.9],
      summary:
        'A co-aligned camera and pulsed infrared laser mapped 160,000 photos and millimeter-scale topography of Eros.',
      story:
        'Mounted on a dedicated exterior instrument platform, the Multispectral Imager and NEAR Laser Rangefinder (NLR) worked in tandem. The laser fired 10,640 nm infrared pulses at 8 Hz, calculating the spacecraft’s range to within 30 centimeters while the imager resolved features as small as 10 cm across during low passes.',
      science:
        'Revealed that Eros is a heavily fractured, solid remnant of a primitive planetesimal rather than a loose rubble pile. It also discovered mysterious "dust ponds"—smooth flat accumulations of electrostatic fine regolith inside craters.',
      engineering:
        'The instrument deck co-aligned the camera, laser rangefinder, and Near-Infrared Spectrograph (NIS), allowing simultaneous measurement of surface topography, color variations, and mineral absorption bands (pyroxene and olivine).',
      status:
        'Historical imaging and altimetry (2000–2001). Captured the highest-resolution photos ever taken of an asteroid surface during the descent.',
      evidence: 'Historical record',
      sourceIds: ['near-mission', 'near-science'],
    },
    {
      id: 'eros-landing',
      title: 'Touchdown on Eros',
      component: 'Descent engine cluster & surface gamma-ray spectrometer',
      position: [0.0, -1.35, -0.5],
      cameraPosition: [0.0, -2.5, -2.4],
      summary:
        'An orbiter with zero landing gear executed a five-burn descent, surviving touchdown at 1.5 m/s on 12 February 2001.',
      story:
        'On February 12, 2001, NEAR concluded its orbital mission with an audacious test: a 5-burn controlled descent to the southern hemisphere of Eros. In microgravity (less than 1/1000th of Earth gravity), the probe touched down at just 1.5 to 1.8 meters per second and remained upright and functional on the rocky surface.',
      science:
        'Because the probe was in direct contact with the surface, its X-ray / Gamma-Ray Spectrometer (XGRS) obtained unprecedented high-sensitivity readings of surface elements, confirming Eros matches the composition of primitive ordinary chondrite meteorites.',
      engineering:
        'Descent was controlled by four 450-Newton hydrazine thrusters and eleven smaller attitude thrusters. Upon touchdown, thrusters shut down immediately and controllers re-pointed the carrier beacon, maintaining two-way communication until February 28, 2001.',
      status:
        'Historical first asteroid landing (2001). The intact spacecraft rests permanently in the southern hemisphere of 433 Eros.',
      evidence: 'Historical record',
      sourceIds: ['near-landing', 'near-results'],
    },
  ],
  task: {
    question:
      'What did NEAR Shoemaker’s historic touchdown on 433 Eros prove about exploration of small bodies?',
    options: [
      'A spacecraft without landing gear could perform a controlled soft touchdown in microgravity and continue surface science.',
      'Asteroid Eros possesses a dense atmosphere that allowed NEAR to deploy parachutes.',
      'The spacecraft vaporized instantly upon making contact with the asteroid surface.',
    ],
    correctIndex: 0,
    explanation:
      'Because Eros’s gravity is less than 0.1% of Earth’s (escape velocity is only ~10 m/s), NEAR Shoemaker was able to use attitude thrusters to execute a gentle 1.5 to 1.8 m/s touchdown. Despite lacking landing legs, it rested intact on its solar panel tips and transmitted surface gamma-ray data for 16 days.',
  },
  sources: [
    {
      id: 'near-mission',
      title: 'NASA Science: NEAR Shoemaker Mission Overview',
      url: 'https://science.nasa.gov/mission/near-shoemaker/',
      credit: 'NASA Science · historical mission archive',
    },
    {
      id: 'near-landing',
      title: 'NASA JPL: NEAR Shoemaker Touches Down on Asteroid Eros',
      url: 'https://www.jpl.nasa.gov/news/near-shoemaker-touches-down-on-asteroid-eros',
      credit: 'NASA / Jet Propulsion Laboratory',
    },
    {
      id: 'near-telecom',
      title: 'JHU APL: NEAR Telecommunications Subsystem Design',
      url: 'https://www.jhuapl.edu/Content/techdigest/pdf/V19-N02/19-02-Bokulic.pdf',
      credit: 'Johns Hopkins University Applied Physics Laboratory',
    },
    {
      id: 'near-power',
      title: 'JHU APL: The NEAR Power System at 1.78 AU',
      url: 'https://www.jhuapl.edu/Content/techdigest/pdf/V19-N02/19-02-Jenkins.pdf',
      credit: 'Johns Hopkins University Applied Physics Laboratory',
    },
    {
      id: 'near-science',
      title: 'NASA NSSDC: NEAR Science Instruments Catalog',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/near.html',
      credit: 'NASA National Space Science Data Center',
    },
    {
      id: 'near-results',
      title: 'NASA Science: First Spacecraft to Orbit and Land on an Asteroid',
      url: 'https://science.nasa.gov/resource/first-spacecraft-to-orbit-and-land-on-an-asteroid/',
      credit: 'NASA Science Exploration',
    },
  ],
};
