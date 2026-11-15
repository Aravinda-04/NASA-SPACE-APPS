import type { CardId, MissionId } from "../types/expedition";
export interface CollectibleDefinition {
  id: CardId;
  missionId: MissionId;
  title: string;
  classification: string;
  fact: string;
  explanation: string;
  source: string;
  sourceLabel: string;
  artwork: string;
  alt: string;
  accent: string;
}
export const COLLECTIBLE_CARDS: CollectibleDefinition[] = [
  {
    id: "returned-camera-lab", missionId: "returned-camera", title: "Hardware Evidence", classification: "Returned lunar equipment",
    fact: "Apollo 12 returned Surveyor 3's television camera so engineers could examine the effects of lunar exposure.",
    explanation: "The camera connected remote observation, astronaut recovery and laboratory testing. Its physical condition supplied evidence that transmitted pictures alone could not provide.",
    source: "https://ntrs.nasa.gov/citations/19710024418", sourceLabel: "NASA-CR-121796 · returned camera tests",
    artwork: "/images/rewards/surveyor-camera-illustration.webp", alt: "Illustration of the returned Surveyor camera against a lunar landscape.", accent: "#b6d0cc",
  },
  {
    id: "apollo12-precision-landing",
    missionId: "apollo12",
    title: "Precision Landing",
    classification: "Crewed lunar surface expedition",
    fact: "Apollo 12 landed close enough to Surveyor 3 for astronauts to visit the robotic spacecraft on foot.",
    explanation: "Intrepid's targeted landing enabled a two-EVA program combining sample collection, experiment deployment and recovery of selected Surveyor hardware for laboratory examination on Earth.",
    source: "https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_12a_Summary.htm",
    sourceLabel: "NASA History · Apollo 12 mission summary",
    artwork: "/images/covers/moon.jpeg",
    alt: "A lunar surface image used as the background for the Apollo 12 precision-landing reward.",
    accent: "#d4c28f",
  },
  {
    id: "surveyor-camera",
    missionId: "surveyor",
    title: "Recovered Camera",
    classification: "Returned hardware",
    fact: "Apollo 12 returned the camera so engineers could test the effects of about 2½ years on the Moon.",
    explanation:
      "The camera became evidence. Optical, electrical and mechanical tests helped engineers investigate how hardware had endured lunar exposure. Discoloration was linked to dust contamination and radiation damage. Most parts withstood the environment well; the report does not prove that equipment never degrades.",
    source: "https://ntrs.nasa.gov/citations/19710024418",
    sourceLabel: "NASA-CR-121796 · NTRS 19710024418",
    artwork: "/images/rewards/surveyor-camera-illustration.webp",
    alt: "Illustrated reconstruction of the cylindrical Surveyor 3 camera and scanning-mirror hood against a symbolic lunar landscape.",
    accent: "#b4bdb5",
  },
  {
    id: "curiosity-skycrane",
    missionId: "curiosity",
    title: "Sky-Crane Trailblazer",
    classification: "Landing system",
    fact: "Curiosity’s descent stage lowered the rover on tethers, then flew away after touchdown.",
    explanation:
      "The heat shield, parachute and powered descent stage each had a different job. Separating equipment allowed the rover to reach the surface ready for science. Orbital observations documented the rover and discarded hardware. This is an illustrated reconstruction, not a landing photograph.",
    source:
      "https://www.jpl.nasa.gov/images/pia14839-curiositys-sky-crane-maneuver-artists-concept/",
    sourceLabel: "NASA/JPL-Caltech · PIA14839",
    artwork: "/images/rewards/curiosity-sky-crane-illustration.webp",
    alt: "Illustrated reconstruction of Curiosity beneath its powered descent stage, suspended on tethers above Mars.",
    accent: "#e5a279",
  },
  {
    id: "pioneer-messenger",
    missionId: "pioneer",
    title: "Deep Space Messenger",
    classification: "Deep-space probe",
    fact: "Pioneer 10’s last faint signal reached Earth on 23 January 2003. It contained no telemetry.",
    explanation:
      "At a documented separation of about 12.23 billion kilometres, one-way light time was about 11 hours 20 minutes. Twice that delay describes a hypothetical fixed-distance round trip, not an actual successful exchange in 2003. Controllers must plan ahead.",
    source:
      "https://science.nasa.gov/missions/pioneer/pioneer-10-sends-last-signal/",
    sourceLabel: "NASA · Pioneer 10 Sends Last Signal",
    artwork: "/images/rewards/pioneer-10-illustration.webp",
    alt: "Illustrated reconstruction of Pioneer 10’s dish, equipment body and booms against symbolic deep space.",
    accent: "#b8c9e0",
  },
  {
    id: "viking-laboratory",
    missionId: "viking",
    title: "First Martian Laboratory",
    classification: "Surface science station",
    fact: "Viking 1 operated on Mars for more than six years and returned the first successful measurements from the planet's surface.",
    explanation:
      "Viking combined imaging, weather, chemistry and biology investigations at one stationary landing site. Its biology results required careful interpretation: an active chemical response is not, by itself, proof of life.",
    source: "https://science.nasa.gov/mission/viking-1/",
    sourceLabel: "NASA Science · Viking 1 mission archive",
    artwork: "/images/covers/mars.jpeg",
    alt: "A sourced view of the Martian surface used as a thematic background for the Viking 1 expedition card.",
    accent: "#d18a5b",
  },
  {
    id: "viking2-frost-station",
    missionId: "viking2",
    title: "Frost Station",
    classification: "Northern Mars surface station",
    fact: "Viking 2 photographed seasonal frost from its higher-latitude landing site in Utopia Planitia.",
    explanation:
      "The sister lander repeated weather, imaging and soil investigations in a colder, rockier environment. Comparing two sites made the Viking results more valuable while the biology responses remained inconclusive for life.",
    source: "https://science.nasa.gov/mission/viking-2/",
    sourceLabel: "NASA Science · Viking 2 mission archive",
    artwork: "/images/covers/mars.jpeg",
    alt: "A sourced view of the Martian surface used as a thematic background for the Viking 2 expedition card.",
    accent: "#9fc8d4",
  },
  {
    id: "john-klein-rock-archive",
    missionId: "john-klein",
    title: "Rock Archive",
    classification: "Drilled Martian mudstone",
    fact: "John Klein was the first Martian rock drilled to collect a sample from its interior.",
    explanation:
      "Curiosity processed powder from beneath the weathered surface and delivered it to CheMin and SAM. Mineral, chemical and geological evidence supported an ancient environment favorable for microbial life without proving that life existed.",
    source: "https://www.jpl.nasa.gov/news/nasa-curiosity-rover-collects-first-martian-bedrock-sample/",
    sourceLabel: "NASA/JPL-Caltech · first bedrock sample",
    artwork: "/images/history/curiosity-hardware.webp",
    alt: "Curiosity mission hardware artwork used for the John Klein rock-archive reward.",
    accent: "#e0b071",
  },
  {
    id: "ingenuity-first-flight",
    missionId: "ingenuity",
    title: "Flight Beyond Earth",
    classification: "Mars technology demonstrator",
    fact: "Ingenuity achieved the first powered, controlled flight on another world on 19 April 2021.",
    explanation:
      "Ingenuity demonstrated that powered flight was possible in Mars' thin atmosphere. Its autonomous navigation, lightweight rotors and repeated flights turned a short technology demonstration into a foundation for future aerial exploration.",
    source: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/",
    sourceLabel: "NASA Science · Ingenuity flight record",
    artwork: "/images/history/curiosity-hardware.webp",
    alt: "A Mars hardware image used as a thematic background for the Ingenuity expedition card.",
    accent: "#e0a36f",
  },
  {
    id: "near-asteroid-lander",
    missionId: "near",
    title: "Asteroid Touchdown",
    classification: "Asteroid orbiter and lander",
    fact: "NEAR Shoemaker became the first spacecraft to orbit and then land on an asteroid.",
    explanation:
      "NEAR was designed as an orbiter, but Eros' weak gravity allowed a controlled descent without conventional landing gear. The spacecraft survived touchdown and continued returning surface measurements for sixteen days.",
    source: "https://science.nasa.gov/mission/near-shoemaker/",
    sourceLabel: "NASA Science · NEAR Shoemaker mission archive",
    artwork: "/images/covers/outer_space.jpeg",
    alt: "A deep-space image used as a thematic background for the NEAR Shoemaker expedition card.",
    accent: "#c9a04a",
  },
  {
    id: "dawn-two-worlds",
    missionId: "dawn",
    title: "Two-World Navigator",
    classification: "Solar-electric asteroid-belt explorer",
    fact: "Dawn was the first spacecraft to orbit two extraterrestrial destinations: Vesta and Ceres.",
    explanation:
      "Efficient ion propulsion allowed Dawn to enter Vesta orbit, leave it and later enter orbit around Ceres. Its instruments revealed two contrasting planetary building blocks: rocky, differentiated Vesta and volatile-rich Ceres with bright carbonate salts.",
    source: "https://science.nasa.gov/mission/dawn/",
    sourceLabel: "NASA Science · Dawn mission overview",
    artwork: "/images/covers/outer_space.jpeg",
    alt: "A deep-space image used as a thematic background for the Dawn expedition card.",
    accent: "#8fb8c9",
  },
  {
    id: "kepler-transit-hunter",
    missionId: "kepler",
    title: "Transit Hunter",
    classification: "Exoplanet survey telescope",
    fact: "Kepler revealed that planets are common by measuring tiny, repeating dips in the brightness of distant stars.",
    explanation:
      "Kepler’s stable wide-field photometer monitored many stars repeatedly. Transit depth and timing helped scientists estimate planet sizes and orbital periods, while validation work separated planetary signals from other causes of changing brightness.",
    source: "https://science.nasa.gov/resource/keplers-science-results/",
    sourceLabel: "NASA Science · Kepler’s Science Results",
    artwork: "/images/covers/outer_space.jpeg",
    alt: "A deep-space image used as a thematic background for the Kepler transit-hunter expedition card.",
    accent: "#7cb6e8",
  },
];
