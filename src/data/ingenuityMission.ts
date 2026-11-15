import type { ExpeditionMission } from '../types/expedition';

/**
 * Ingenuity Mars Helicopter Expedition Mission Definition
 *
 * Jezero Crater (18.44° N, 77.45° E)
 * First Flight (Sol 58): 19 April 2021
 * Final Flight (Sol 1035 / Flight 72): 18 January 2024
 */
export const INGENUITY_MISSION: ExpeditionMission = {
  id: 'ingenuity',
  chapter: 2,
  destination: 'Mars · Jezero Crater',
  name: 'Ingenuity Mars Helicopter',
  title: 'The First Powered Flight on Another World',
  subtitle: 'A 39-second hover became 72 flights across the floor of Jezero Crater.',
  question: 'How can a rotorcraft generate lift in an atmosphere 100 times thinner than Earth’s?',
  introduction:
    'On April 19, 2021, Ingenuity became the first aircraft in history to make a powered, controlled flight on another planet. Operating in Jezero Crater beneath Martian skies, its counter-rotating carbon blades and autonomous vision system proved that humanity could fly across alien worlds.',
  arrival:
    'On this fictional future visit, explore Wright Brothers Field in Jezero Crater. Inspect the helicopter, trace the autonomous visual odometry flight corridor, and examine the legacy of its historic 72-flight campaign.',
  legacy:
    'Designed for up to five flights, Ingenuity completed 72, covered about 17 kilometres and logged 128.8 minutes in the air. It proved flight, scouted terrain for Perseverance and exposed the limits of visual navigation over low-texture sand.',
  dateLabel: 'First flight: 19 April 2021 · Jezero Crater',
  statusLabel: 'Mission complete: final flight 18 January 2024 (72 flights)',
  accent: '#d97706',
  coordinatesLabel: 'Jezero Crater · 18.44° N, 77.45° E',
  sceneNote:
    'Schematic inspection layout, not a continuous geographic site. The helicopter, Wright Brothers Field marker, flight path corridor, and Flight 72 dune are illustrative reconstructions for demonstration. Future condition is imagined; no live telemetry is shown.',
  discoveries: [
    {
      id: 'coaxial-rotors',
      title: 'Thin air, fast blades',
      component: 'Coaxial counter-rotating rotor system',
      position: [0.0, 0.55, 0.0],
      cameraPosition: [-2.2, 1.8, 2.4],
      summary:
        'Two pairs of carbon-fiber blades spun in opposite directions at 2,400+ RPM to generate lift in Mars’s 1% atmosphere.',
      story:
        'On April 19, 2021, Ingenuity achieved the first powered, controlled flight on another planet. Because the Martian atmosphere has only about 1% of Earth’s sea-level density, the 1.2-meter counter-rotating composite blades had to spin at 2,400 to 2,900 RPM—almost ten times faster than helicopters on Earth. The counter-rotating coaxial design cancelled gyroscopic torque without requiring a heavy tail rotor.',
      science:
        'The flights demonstrated that controlled aerodynamic flight is practical in Mars’s extremely thin carbon-dioxide atmosphere and supplied real performance data for future aircraft.',
      engineering:
        'Powered by six lithium-ion batteries recharged daily by a top-mounted solar array. Two brushless DC motors drove independent swashplates for collective and cyclic pitch control, built with lightweight carbon foam cores and carbon fiber skins weighing just 1.8 kg (4.0 lbs) total.',
      status:
        'Designed as a 30-day technology demonstration for up to 5 flights, Ingenuity exceeded all expectations by flying 72 times across three Earth years, transforming into an aerial scout for Perseverance.',
      evidence: 'Historical record',
      sourceIds: ['ingenuity-press-kit', 'flight-log'],
    },
    {
      id: 'autonomous-odometry',
      title: 'Eyes on the ground',
      component: 'Downward NAVCAM & autonomous visual odometry',
      position: [2.8, 0.08, -2.4],
      cameraPosition: [4.5, 2.2, 0.2],
      summary:
        'With radio signals taking up to 20 minutes from Earth, Ingenuity piloted itself using a downward camera tracking sand ripples 30 times a second.',
      story:
        'Because radio signals between Earth and Mars take anywhere from 5 to 20 minutes to cross interplanetary space, real-time joystick piloting was impossible. Ingenuity had to make all split-second flight corrections autonomously. A downward-facing black-and-white navigation camera (NAVCAM) captured 30 frames per second of Martian terrain features, estimating speed, drift, and position on the fly.',
      science:
        'Demonstrated visual navigation without GPS while also revealing that feature-poor terrain can deprive the system of reliable motion estimates.',
      engineering:
        'An onboard cellphone-grade processor (Qualcomm Snapdragon 801 running Linux and JPL’s F Prime flight software) combined NAVCAM optical flow with a laser rangefinder (altimeter) and an inertial measurement unit (IMU) running guidance algorithms at 500 Hz.',
      status:
        'Historical navigation record from 72 flights. Cyan locks and the elevated route in this scene are explanatory interface graphics, not recorded telemetry.',
      evidence: 'Historical record',
      sourceIds: ['flight-software', 'flight-log'],
    },
    {
      id: 'wright-brothers-field',
      title: 'A piece of Kitty Hawk',
      component: 'Wright Brothers Field & commemorative wing fabric',
      position: [2.2, 0.08, 1.8],
      cameraPosition: [4.2, 2, 4.4],
      summary:
        'Beneath the solar panel, a postage-stamp swatch of fabric from the 1903 Wright Flyer connected the first flight on Earth to the first on Mars.',
      story:
        'On Sol 58 (April 19, 2021), Ingenuity lifted off from a patch of Jezero Crater that NASA officially named "Wright Brothers Field," earning the honorary ICAO airport code JZRO. Tucked discreetly under the helicopter’s solar panel was an unbleached muslin fabric swatch from the lower-left wing of the original 1903 Wright Flyer that flew at Kitty Hawk, North Carolina.',
      science:
        'Echoed the legacy of early aviation: just as Orville and Wilbur Wright proved controlled powered flight on Earth with a 12-second hop, Ingenuity proved extraterrestrial flight was possible with a 39.1-second hover up to 3 meters altitude.',
      engineering:
        'Attached with Kapton tape to the underside of the solar panel mounting plate, adding negligible mass while enduring launch vibrations, vacuum cruise, entry/descent/landing beneath Perseverance, and Martian thermal cycles.',
      status:
        'Wright Brothers Field served as Airfield 1. The helicopter moved across dozens of distinct Martian airfields throughout its 1,000+ Martian sol expedition.',
      evidence: 'Historical record',
      sourceIds: ['wright-flyer-swatch', 'ingenuity-press-kit'],
    },
    {
      id: 'flight-72-legacy',
      title: 'The final landing',
      component: 'Flight 72 landing site & rotor blade legacy',
      position: [-5.5, 0.35, -4.8],
      cameraPosition: [-2.7, 2, -1.9],
      summary:
        'On January 18, 2024, Flight 72 over featureless dunes ended with a damaged rotor blade, completing a historic 72-flight campaign.',
      story:
        'Flight 72 was a short vertical hop over low-texture rippled sand. NASA’s investigation concluded that insufficient surface features likely produced inaccurate navigation estimates, beginning a chain of events that ended in a hard landing and severe rotor damage.',
      science:
        'Provided crucial boundary data on the limits of optical flow navigation over low-texture aeolian sand fields, informing navigation sensor designs for future rotorcraft such as the Dragonfly mission to Saturn’s moon Titan.',
      engineering:
        'Post-flight images and engineering data were used to reconstruct the accident. A separated blade fragment was identified about 15 metres from the helicopter.',
      status:
        'Flight operations ended in January 2024. The team received its final downlink in April 2024; this reconstruction does not imply continuing contact.',
      evidence: 'Historical record',
      sourceIds: ['final-flight-report', 'accident-investigation', 'flight-log'],
    },
  ],
  task: {
    question:
      'Why did Ingenuity’s rotor blades need to spin at 2,400 to 2,900 RPM, nearly 10 times faster than a helicopter on Earth?',
    options: [
      'Because Martian gravity is ten times stronger than Earth’s gravity.',
      'Because Mars’s atmosphere is only ~1% as dense as Earth’s, requiring extreme blade speeds to generate enough aerodynamic lift.',
      'To generate electromagnetic thrust by ionizing the Martian dust clouds.',
    ],
    correctIndex: 1,
    explanation:
      'Mars’s surface atmospheric density is less than 1% of Earth’s (equivalent to an altitude of ~100,000 feet on Earth). To generate sufficient aerodynamic lift with a 1.2-meter rotor span, the blades had to rotate at extremely high speeds (2,400–2,900 RPM), with blade tips approaching transonic speeds in cold carbon dioxide.',
  },
  sources: [
    {
      id: 'ingenuity-press-kit',
      title: 'NASA JPL: Ingenuity Landing Press Kit',
      url: 'https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/',
      credit: 'NASA/JPL-Caltech',
    },
    {
      id: 'flight-log',
      title: 'NASA Science: Ingenuity Mars Helicopter Flight Record',
      url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
      credit: 'NASA Science',
    },
    {
      id: 'flight-software',
      title: 'NASA JPL: F Prime Flight Software Architecture',
      url: 'https://github.com/nasa/fprime',
      credit: 'NASA Jet Propulsion Laboratory',
    },
    {
      id: 'wright-flyer-swatch',
      title: 'Smithsonian Air & Space: Wright Brothers Swatch on Mars',
      url: 'https://airandspace.si.edu/stories/editorial/wright-brothers-mars-ingenuity-helicopter',
      credit: 'Smithsonian National Air and Space Museum',
    },
    {
      id: 'final-flight-report',
      title: 'NASA Release 24-013: Ingenuity Mission Complete',
      url: 'https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/',
      credit: 'NASA Headquarters',
    },
    {
      id: 'accident-investigation',
      title: 'NASA performs first aircraft accident investigation on another world',
      url: 'https://www.jpl.nasa.gov/news/nasa-performs-first-aircraft-accident-investigation-on-another-world/',
      credit: 'NASA/JPL-Caltech',
    },
  ],
};
