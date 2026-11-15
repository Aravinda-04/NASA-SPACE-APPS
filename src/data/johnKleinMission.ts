import type { ExpeditionMission } from '../types/expedition';

export const JOHN_KLEIN_MISSION: ExpeditionMission = {
  id: 'john-klein',
  chapter: 2,
  destination: 'Yellowknife Bay · Gale Crater',
  name: 'John Klein · Rock Archive',
  title: 'A Lakebed Written in Stone',
  subtitle: 'Curiosity’s first collected drill sample opened an archive beneath the rust-red surface.',
  question: 'How can powdered rock reveal whether an ancient environment was habitable?',
  introduction:
    'On 8 February 2013, Curiosity drilled 6.4 centimetres into the fine-grained John Klein mudstone and collected the first sample from inside a Martian rock. CheMin and SAM then examined its minerals and chemistry.',
  arrival:
    'Your fictional field expedition enters the shallow Yellowknife Bay depression. Follow the pale mineral veins, inspect the drill and tailings, then trace the sample’s path into Curiosity’s internal laboratories.',
  legacy:
    'John Klein supplied evidence for an ancient wet environment with chemical ingredients and energy sources that could have supported microbes. Habitability describes suitable conditions; it is not a detection of life.',
  dateLabel: 'Sample collected: 8 February 2013 · mission Sol 182',
  statusLabel: 'Historical drill site · Curiosity continued onward',
  accent: '#e0b071',
  coordinatesLabel: 'Yellowknife Bay · Gale Crater rock archive',
  sceneNote:
    'Schematic Yellowknife Bay field reconstruction with exaggerated fractures, veins and basin walls for inspection. The stations compress rover-scale details into one layout and do not reproduce exact terrain geometry or live rover position.',
  discoveries: [
    {
      id: 'klein-mudstone', title: 'Layers from quiet water', component: 'Fine-grained sedimentary bedrock',
      position: [-5.5, 0.22, -4], cameraPosition: [-4.2, 1.7, -1.3],
      summary: 'Thin, fine-grained rock preserved evidence of an ancient wet setting.',
      story: 'John Klein lies among flat, fractured rocks in the shallow Yellowknife Bay depression. The target was selected because its sedimentary texture and mineral veins could preserve evidence of past water.',
      science: 'Fine grains and sedimentary layers helped researchers interpret the site as part of an ancient environment where water persisted long enough to alter minerals.',
      engineering: 'Mastcam, MAHLI and ChemCam provided context before engineers committed the rover’s sampling hardware to the target.',
      status: 'Historical geological interpretation. The layered slabs here are illustrative.', evidence: 'Historical record',
      sourceIds: ['site-selection', 'drill-preparation'],
    },
    {
      id: 'klein-drill', title: 'The first collected core powder', component: 'Full-depth drill hole and gray tailings',
      position: [0, 0.18, -1.8], cameraPosition: [0.9, 1.5, 1.1],
      summary: 'A 1.6-centimetre-wide hole reached 6.4 centimetres into the rock.',
      story: 'After checkout and mini-drill tests, Curiosity used its rotary-percussive drill to collect powder from inside John Klein. Gray tailings contrasted with the oxidized surface.',
      science: 'Sampling the interior reduced the dominance of surface weathering and gave the onboard laboratories material from the rock’s protected interior.',
      engineering: 'The arm-mounted drill generated powder, while CHIMRA processed and sieved it before delivering small portions to laboratory inlet ports.',
      status: 'Historical sampling event on Sol 182. The glowing ring is an interface marker, not an active instrument.', evidence: 'Historical record',
      sourceIds: ['first-sample', 'sample-confirmed'],
    },
    {
      id: 'klein-veins', title: 'Pale paths through fractures', component: 'Light-toned mineral veins',
      position: [4.8, 0.2, -4.6], cameraPosition: [3.7, 1.6, -1.7],
      summary: 'Veins recorded fluids moving through fractures after the sediment became rock.',
      story: 'The drill area contained intersecting fractures, raised light-toned veins and small mineral concretions. These features recorded more than one stage of the site’s geological history.',
      science: 'Minerals filling cracks are physical evidence that water-bearing fluids once moved through the bedrock.',
      engineering: 'Context mosaics and close-up imaging let the team choose a safe target while preserving the relationship between the sample and surrounding geology.',
      status: 'Historical image evidence represented here by enlarged pale seams.', evidence: 'Historical record',
      sourceIds: ['site-selection'],
    },
    {
      id: 'klein-laboratory', title: 'From powder to habitability', component: 'CheMin and SAM analysis archive',
      position: [8.5, 0.55, 1.5], cameraPosition: [6.2, 1.7, 3],
      summary: 'Minerals, elements and chemical energy combined into a picture of a habitable ancient environment.',
      story: 'Curiosity delivered sieved John Klein powder to CheMin and SAM. Their results were interpreted together with images and other measurements rather than as a single decisive signal.',
      science: 'The sample supported an ancient wet environment with essential ingredients and a chemical energy gradient usable by some Earth microbes. It did not show that microbes actually lived there.',
      engineering: 'CheMin identified minerals using X-ray diffraction; SAM investigated gases and compounds released from the sample.',
      status: 'Historical laboratory result preserved in the mission archive.', evidence: 'Historical record',
      sourceIds: ['sample-results', 'tailings-results'],
    },
  ],
  task: {
    question: 'What conclusion does the combined John Klein evidence support?',
    options: [
      'Yellowknife Bay once offered environmental conditions that could have supported microbial life.',
      'Curiosity found and photographed living microbes inside the drill hole.',
      'The gray powder proved every rock in Gale Crater formed at the same time.',
    ],
    correctIndex: 0,
    explanation: 'The rock’s sedimentary context, minerals and chemistry supported ancient habitability. Suitable conditions and ingredients are not proof that life existed, and one drilled target cannot represent every Gale Crater rock.',
  },
  sources: [
    { id: 'site-selection', title: 'John Klein site selected for Curiosity’s drill debut', url: 'https://www.jpl.nasa.gov/images/pia16567-john-klein-site-selected-for-curiositys-drill-debut/', credit: 'NASA/JPL-Caltech/MSSS' },
    { id: 'drill-preparation', title: 'Preparing to drill the first Martian rock sample', url: 'https://www.jpl.nasa.gov/news/nasa-mars-rover-preparing-to-drill-into-first-martian-rock/', credit: 'NASA/JPL-Caltech' },
    { id: 'first-sample', title: 'Curiosity collects first Martian bedrock sample', url: 'https://www.jpl.nasa.gov/news/nasa-curiosity-rover-collects-first-martian-bedrock-sample/', credit: 'NASA/JPL-Caltech' },
    { id: 'sample-confirmed', title: 'First drilled Mars rock sample confirmed', url: 'https://www.jpl.nasa.gov/news/nasa-rover-confirms-first-drilled-mars-rock-sample/', credit: 'NASA/JPL-Caltech' },
    { id: 'sample-results', title: 'Curiosity rover hits paydirt', url: 'https://www.jpl.nasa.gov/videos/curiosity-rover-hits-paydirt/', credit: 'NASA/JPL-Caltech' },
    { id: 'tailings-results', title: 'John Klein drill tailings and analysis', url: 'https://www.jpl.nasa.gov/images/pia16815-dust-from-mars-drilling-tailings-and-discard-piles/', credit: 'NASA/JPL-Caltech/MSSS' },
  ],
};
