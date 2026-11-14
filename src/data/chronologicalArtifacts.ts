import { EXPEDITION_MISSIONS } from "./expeditionMissions";
import type { MissionId, MissionSource } from "../types/expedition";

export interface ChronologicalArtifact {
  id: string;
  volumeId: MissionId;
  title: string;
  dateLabel: string;
  /** YYYYMMDD, or YYYY0000 when the source supports only a year. */
  chronologicalOrder: number;
  synopsis: string;
  classification: string;
  organisation: string;
  coordinatesLabel: string;
  coordinateData?: {
    latitude: number; longitude: number; body: "moon" | "mars";
    precision?: "site" | "region";
    event?: string;
    sourceUrl?: string;
  };
  atlasContext?: string;
  spaceFocus?: "jupiter" | "eros" | "ceres" | "heliocentric";
  playableMissionId?: MissionId;
  overview: string;
  purpose: string;
  operation: string;
  scientificContribution: string;
  currentStatus: string;
  schematic: "lander" | "camera" | "rover" | "helicopter" | "probe" | "orbiter" | "telescope" | "laboratory";
  /** Historical destinations, never a measured orbit or a live position. */
  journey?: string[];
  sources: MissionSource[];
}

const mission = (id: MissionId) => EXPEDITION_MISSIONS.find((item) => item.id === id)!;
const sources = (id: MissionId, ...ids: string[]) => mission(id).sources.filter((source) => ids.includes(source.id));
const nasaSource = (id: string, title: string, url: string): MissionSource => ({ id, title, url, credit: "NASA Science · historical mission archive" });
// Reuse the existing evidence dossiers rather than maintaining a second history.
const discoveryNotes = (id: MissionId, discoveryId: string) => {
  const record = mission(id).discoveries.find((item) => item.id === discoveryId)!;
  return { overview: record.summary, purpose: record.story, operation: record.engineering,
    scientificContribution: record.science, currentStatus: record.status,
    sources: sources(id, ...record.sourceIds) };
};

/** Dates identify the named event, not a common epoch or the spacecraft's current location.
 * Primary sources checked 14 November 2026; see docs/design/chronological-source-ledger.md.
 */
export const CHRONOLOGICAL_ARTIFACTS: ChronologicalArtifact[] = [
  {
    ...discoveryNotes("surveyor", "lander"),
    id: "surveyor-3", volumeId: "surveyor", title: "Surveyor 3", dateLabel: "20 Apr 1967 · landing", chronologicalOrder: 19670420,
    synopsis: "A robotic scout tests the ground for human explorers.", classification: "Robotic lunar lander", organisation: "NASA / JPL",
    coordinatesLabel: "Oceanus Procellarum · lunar landing site",
    coordinateData: { latitude: -3, longitude: -23.41, body: "moon", precision: "region", event: "Historical landing region", sourceUrl: "https://science.nasa.gov/mission/surveyor-3/" },
    playableMissionId: "surveyor", schematic: "lander",
    purpose: "It tested lunar soil and returned surface images to help assess conditions for future Apollo landings.",
  },
  {
    ...discoveryNotes("surveyor", "descent"),
    id: "apollo-12", volumeId: "surveyor", title: "Apollo 12 · Intrepid", dateLabel: "19 Nov 1969 · landing", chronologicalOrder: 19691119,
    synopsis: "A precision landing brings two expeditions together.", classification: "Crewed lunar module", organisation: "NASA · Apollo program",
    coordinatesLabel: "Ocean of Storms · Apollo 12 site", schematic: "lander",
    coordinateData: { latitude: -3.0128, longitude: -23.4219, body: "moon", precision: "site", event: "Apollo 12 descent-stage landing site", sourceUrl: "https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html" },
    sources: [...sources("surveyor", "apollo-summary", "site-orbit"), nasaSource("apollo-coordinates", "Apollo landing-site coordinates · DE421 frame", "https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html")],
    purpose: "Apollo 12 demonstrated a precision lunar landing, collected samples and deployed experiments. Landing near Surveyor 3 also made equipment recovery possible.",
  },
  {
    ...discoveryNotes("surveyor", "camera"),
    id: "surveyor-camera", volumeId: "surveyor", title: "The returned camera", dateLabel: "20 Nov 1969 · recovery", chronologicalOrder: 19691120,
    synopsis: "An instrument becomes a sample of the lunar environment.", classification: "Recovered television camera", organisation: "NASA · Apollo 12 / Surveyor",
    coordinatesLabel: "Recovered on the Moon · returned to Earth", schematic: "camera",
    coordinateData: { latitude: -3, longitude: -23.41, body: "moon", precision: "region", event: "1969 recovery region · equipment returned to Earth", sourceUrl: "https://science.nasa.gov/mission/surveyor-3/" },
    atlasContext: "The pin marks the historical recovery region. The camera was removed and returned to Earth; it is not still at this lunar location.",
  },
  {
    id: "camera-tests", volumeId: "surveyor", title: "The laboratory afterlife", dateLabel: "1970 · report published", chronologicalOrder: 19701231,
    synopsis: "Back on Earth, the hardware tells a second scientific story.", classification: "Engineering test report", organisation: "NASA / JPL · NASA-CR-121796",
    coordinatesLabel: "Earth laboratories · returned lunar equipment", schematic: "laboratory",
    atlasContext: "This report concerns tests on Earth. The Moon is shown as context for the equipment's original exposure; there is no lunar test-site pin.",
    overview: "A report on the recovered Surveyor 3 camera records engineering tests after its time on the Moon.",
    purpose: "Researchers wanted to learn how lunar exposure had affected the instrument.",
    operation: "They examined circuits, optics, mechanisms, coatings and internal materials, comparing their condition with engineering expectations.",
    scientificContribution: "Dust and radiation helped explain surface discoloration. The findings informed understanding of hardware exposed to the lunar environment.",
    currentStatus: "The camera was returned to Earth. The report remains in NASA's public technical archive; it is evidence about tested hardware, not a measurement of today's lunar site.",
    sources: sources("surveyor", "camera-report"),
  },
  {
    id: "viking-1", volumeId: "curiosity", title: "Viking 1", dateLabel: "20 Jul 1976 · landing", chronologicalOrder: 19760720,
    synopsis: "A long-lived surface laboratory opens a new view of Mars.", classification: "Mars orbiter & lander", organisation: "NASA · Langley / JPL",
    coordinatesLabel: "Chryse Planitia · Mars", schematic: "lander",
    coordinateData: { latitude: 22.27, longitude: -47.95, body: "mars", precision: "site", event: "Viking 1 landing site · planetocentric", sourceUrl: "https://science.nasa.gov/mission/viking/" },
    overview: "Viking 1 paired a Mars orbiter with a stationary surface laboratory.",
    purpose: "Its experiments investigated Martian soil, weather and the possibility of life.",
    operation: "A sampling arm fed soil to instruments; cameras and weather sensors recorded the surface. Radioisotope generators supplied the lander's electricity.",
    scientificContribution: "Surface images and long weather records expanded our understanding of Mars. The biology experiments did not establish the presence of life.",
    currentStatus: "Lander operations ended in November 1982 after a faulty command. The inactive hardware remains at its landing site.",
    sources: [nasaSource("viking-1", "Viking 1 mission history", "https://science.nasa.gov/mission/viking-1/"), nasaSource("viking-coordinates", "Viking landing locations · planetocentric coordinates", "https://science.nasa.gov/mission/viking/")],
  },
  {
    id: "viking-2", volumeId: "curiosity", title: "Viking 2", dateLabel: "3 Sep 1976 · landing", chronologicalOrder: 19760903,
    synopsis: "A second landing site makes comparison possible.", classification: "Mars orbiter & lander", organisation: "NASA · Langley / JPL",
    coordinatesLabel: "Utopia Planitia · Mars", schematic: "lander",
    coordinateData: { latitude: 47.64, longitude: 134.29, body: "mars", precision: "site", event: "Viking 2 landing site · planetocentric", sourceUrl: "https://science.nasa.gov/mission/viking/" },
    overview: "Viking 2 was a separate orbiter-and-lander mission, with its own landing site on Mars.",
    purpose: "A second site let researchers compare soils and environments rather than generalise from one location.",
    operation: "Cameras, a sampling arm, chemistry experiments and weather sensors worked together. Radioisotope generators powered the lander.",
    scientificContribution: "Its measurements and photographs broadened the Viking record. The biology results remained inconclusive about life.",
    currentStatus: "The orbiter ended operations in 1978 and lander transmissions ended in April 1980. The lander remains on Mars.",
    sources: [nasaSource("viking-2", "Viking 2 mission history", "https://science.nasa.gov/mission/viking-2/"), nasaSource("viking-coordinates", "Viking landing locations · planetocentric coordinates", "https://science.nasa.gov/mission/viking/")],
  },
  {
    ...discoveryNotes("curiosity", "landing"),
    id: "curiosity-rover", volumeId: "curiosity", title: "Curiosity & the sky crane", dateLabel: "6 Aug 2012 · landing (UTC)", chronologicalOrder: 20120806,
    synopsis: "Discarded landing hardware delivers a mobile laboratory.", classification: "Rover & powered descent system", organisation: "NASA / JPL-Caltech",
    coordinatesLabel: "Gale Crater · landing hardware region", playableMissionId: "curiosity", schematic: "rover",
    coordinateData: { latitude: -4.5895, longitude: 137.4417, body: "mars", precision: "site", event: "Bradbury Landing · 6 August 2012", sourceUrl: "https://ntrs.nasa.gov/citations/20130010911" },
    atlasContext: "The pin marks the 2012 rover touchdown site, not the current rover location. Discarded landing components lie at separate nearby sites.",
    overview: "Curiosity is a six-wheeled science laboratory, delivered by a heat shield, parachute and powered descent stage.",
    purpose: "The rover was sent to investigate whether ancient Mars had environments suitable for microbial life.",
    currentStatus: "The landing hardware separated in 2012. The rover went on to explore Gale Crater; this schematic shows neither its present location nor a live hardware condition.",
    sources: [...sources("curiosity", "curiosity-mission", "landing-map", "landing-sequence", "instruments-source"), nasaSource("curiosity-coordinates", "MSL landing reconstruction · actual landing coordinates", "https://ntrs.nasa.gov/citations/20130010911")],
  },
  {
    ...discoveryNotes("curiosity", "sample"),
    id: "john-klein", volumeId: "curiosity", title: "John Klein · rock archive", dateLabel: "12 Mar 2013 · result announced", chronologicalOrder: 20130312,
    synopsis: "A drilled rock preserves evidence of ancient habitability.", classification: "Drill sample & scientific result", organisation: "NASA / JPL-Caltech",
    coordinatesLabel: "Yellowknife Bay · Gale Crater", schematic: "laboratory",
    atlasContext: "This rock investigation took place at Yellowknife Bay, after landing. No verified drill-target coordinate is included here; use the Gale landing record for a geographic reference.",
  },
  {
    id: "ingenuity", volumeId: "curiosity", title: "Ingenuity", dateLabel: "19 Apr 2021 · first flight", chronologicalOrder: 20210419,
    synopsis: "A small rotorcraft proves that powered flight can work on Mars.", classification: "Helicopter technology demonstration", organisation: "NASA / JPL-Caltech · Mars 2020",
    coordinatesLabel: "Jezero Crater · separate from Curiosity", schematic: "helicopter",
    coordinateData: { latitude: 18, longitude: 77, body: "mars", precision: "region", event: "Approximate Jezero mission region · not a flight waypoint", sourceUrl: "https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/quick_facts/" },
    atlasContext: "NASA's press kit gives an approximate Jezero region, about 18°N, 77°E. This regional pin is not the exact first-flight or final-landing position.",
    overview: "Ingenuity was a small helicopter carried to Mars beneath Perseverance, a different rover from Curiosity.",
    purpose: "It tested powered, controlled flight in the thin Martian atmosphere, then helped scout terrain.",
    operation: "Counter-rotating blades generated lift. A solar panel charged batteries, and onboard control allowed flight without real-time piloting from Earth.",
    scientificContribution: "Its 72 flights provided engineering knowledge for future aerial exploration and overhead views for rover planning.",
    currentStatus: "Its final flight was on 18 January 2024. Rotor damage ended the flying mission; the helicopter remains in Jezero Crater.",
    sources: [nasaSource("ingenuity", "Ingenuity mission history and flight record", "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/"), nasaSource("ingenuity-region", "Ingenuity press kit · approximate landing region", "https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/quick_facts/")],
  },
  {
    ...discoveryNotes("pioneer", "antenna"),
    id: "pioneer-10", volumeId: "pioneer", title: "Pioneer 10", dateLabel: "1972 · launch", chronologicalOrder: 19720000,
    synopsis: "The first Jupiter flyby opens the way beyond the planets.", classification: "Outer-planet flyby spacecraft", organisation: "NASA · Ames Research Center",
    coordinatesLabel: "Outward journey · no live position", playableMissionId: "pioneer", schematic: "probe", journey: ["Earth", "Jupiter", "Outward"],
    spaceFocus: "jupiter", atlasContext: "Focus: Jupiter encounter, December 1973. The connection is a historical journey schematic, not a reconstructed trajectory or Pioneer 10's present position.",
    overview: "Pioneer 10 was a robotic spacecraft that flew past Jupiter in December 1973.",
    purpose: "It investigated Jupiter and the space environment on a journey beyond the inner solar system.",
    operation: "Radioisotope generators supplied power. Instruments measured the surroundings, and a high-gain dish directed radio signals toward Earth.",
    scientificContribution: "Its observations revealed more about Jupiter's radiation and magnetic environment and supported planning for later missions.",
    currentStatus: "Its last signal reached Earth on 23 January 2003. Loss of radio contact did not stop its outward motion; no current position or power measurement is shown here.",
  },
  {
    id: "near-shoemaker", volumeId: "pioneer", title: "NEAR Shoemaker", dateLabel: "1996 · launch", chronologicalOrder: 19960000,
    synopsis: "An asteroid orbiter finishes with an unexpected landing.", classification: "Asteroid orbiter & lander", organisation: "NASA / Johns Hopkins APL",
    coordinatesLabel: "433 Eros · touchdown in 2001", schematic: "orbiter", journey: ["Earth", "Mathilde", "Eros"],
    spaceFocus: "eros", atlasContext: "Focus: Eros, the target of NEAR's 2000–2001 orbital campaign and landing. Its displayed placement is illustrative, not a dated heliocentric position.",
    overview: "NEAR Shoemaker was the first spacecraft to orbit and land on an asteroid.",
    purpose: "It explored the structure, composition and surface of asteroid Eros.",
    operation: "Cameras, spectrometers and a laser rangefinder studied the asteroid; radio tracking helped investigate its gravity.",
    scientificContribution: "The measurements connected Eros's shape and surface with evidence about its composition and interior.",
    currentStatus: "It touched down on Eros on 12 February 2001 despite not being designed as a lander. Surface communication continued until 28 February; the spacecraft remains on Eros.",
    sources: [nasaSource("near", "NEAR Shoemaker mission history", "https://science.nasa.gov/mission/near-shoemaker/")],
  },
  {
    id: "dawn", volumeId: "pioneer", title: "Dawn", dateLabel: "2007 · launch", chronologicalOrder: 20070000,
    synopsis: "One spacecraft studies two very different small worlds.", classification: "Asteroid-belt orbiter", organisation: "NASA / JPL-Caltech",
    coordinatesLabel: "Vesta, then Ceres · distinct orbital campaigns", schematic: "orbiter", journey: ["Earth", "Vesta", "Ceres"],
    spaceFocus: "ceres", atlasContext: "Focus: Ceres, Dawn's second orbital destination after Vesta. Schematic connections express mission sequence; they do not reconstruct either transfer orbit.",
    overview: "Dawn orbited both the giant asteroid Vesta and dwarf planet Ceres.",
    purpose: "Comparing two surviving early worlds helped researchers investigate the solar system's formation.",
    operation: "Ion propulsion enabled the journey between targets. Cameras and spectrometers investigated their surfaces.",
    scientificContribution: "Dawn revealed contrasting geological histories, including Ceres's bright salt deposits.",
    currentStatus: "The mission ended in 2018 when attitude-control fuel ran out. Dawn was left in orbit around Ceres, rather than landed on its surface.",
    sources: [nasaSource("dawn", "Dawn mission overview", "https://science.nasa.gov/mission/dawn/"), nasaSource("dawn-end", "Dawn mission status", "https://science.nasa.gov/mission/dawn/mission-status/")],
  },
  {
    id: "kepler", volumeId: "pioneer", title: "Kepler / K2", dateLabel: "2009 · launch", chronologicalOrder: 20090000,
    synopsis: "Tiny changes in starlight reveal distant planetary systems.", classification: "Space telescope", organisation: "NASA · Ames Research Center",
    coordinatesLabel: "Heliocentric orbit · telescope observes distant stars", schematic: "telescope", journey: ["Earth", "Solar orbit", "Starlight"],
    spaceFocus: "heliocentric", atlasContext: "Focus: an Earth-trailing heliocentric observatory. The telescope observed distant stars from a solar orbit; it did not fly to those stars. The orbital angle is illustrative.",
    overview: "Kepler was a space telescope that searched for planets around other stars.",
    purpose: "Its survey tested how common planets, including small planets, are in our galaxy.",
    operation: "A telescope and detector array measured stellar brightness. Repeating dips could reveal a planet crossing a star, with further checks needed to confirm a planet.",
    scientificContribution: "Kepler and its extended K2 mission demonstrated that planets are abundant and revealed many kinds of planetary systems.",
    currentStatus: "NASA retired Kepler in 2018 after its fuel was exhausted. It remains in an orbit around the Sun, not on a distant planet.",
    sources: [nasaSource("kepler", "Kepler / K2 mission history", "https://science.nasa.gov/mission/kepler/")],
  },
];

export const getChronologicalArtifacts = (id: MissionId) => CHRONOLOGICAL_ARTIFACTS
  .filter((artifact) => artifact.volumeId === id).sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);

/** The registry is the authority on whether a linked episode actually exists. */
export const getPlayableMission = (artifact: ChronologicalArtifact) => EXPEDITION_MISSIONS
  .find((item) => item.id === artifact.playableMissionId && item.id === artifact.volumeId);

export type SimulationTarget = 'surveyor' | 'curiosity' | 'pioneer' | 'viking' | 'ingenuity';

export interface ArtifactSimulationInfo {
  targetId: SimulationTarget;
  label: string;
  title: string;
}

/**
 * Maps each historical artifact to its specific interactive 3D simulation.
 * Prevents generic or incorrect fallback linking to the Curiosity rover.
 */
export const getArtifactSimulation = (artifact: ChronologicalArtifact): ArtifactSimulationInfo | null => {
  // 1. Viking 1 (and sister lander Viking 2) -> Chryse Planitia Viking 3D Simulation
  if (artifact.id === 'viking-1' || artifact.id === 'viking-2') {
    return { targetId: 'viking', label: 'Enter 3D simulation', title: 'Viking 1' };
  }
  // 2. Ingenuity Helicopter -> Jezero Crater Ingenuity 3D Simulation
  if (artifact.id === 'ingenuity') {
    return { targetId: 'ingenuity', label: 'Enter 3D simulation', title: 'Ingenuity Helicopter' };
  }
  // 3. Curiosity Rover & John Klein drill rock -> Gale Crater Curiosity 3D Simulation
  if (artifact.id === 'curiosity-rover' || artifact.id === 'john-klein') {
    return { targetId: 'curiosity', label: 'Enter 3D simulation', title: 'Curiosity Rover' };
  }
  // 4. Surveyor 3, Apollo 12, & Surveyor camera -> Ocean of Storms Surveyor 3 3D Simulation
  if (artifact.id === 'surveyor-3' || artifact.id === 'apollo-12' || artifact.id === 'surveyor-camera') {
    return { targetId: 'surveyor', label: 'Enter 3D simulation', title: 'Surveyor 3' };
  }
  // 5. Pioneer 10 -> Deep Space Pioneer 10 3D Simulation
  if (artifact.id === 'pioneer-10') {
    return { targetId: 'pioneer', label: 'Enter 3D simulation', title: 'Pioneer 10' };
  }
  // 6. Fallback for any other playable mission if configured
  if (artifact.playableMissionId) {
    return { targetId: artifact.playableMissionId as SimulationTarget, label: 'Enter 3D simulation', title: artifact.title };
  }
  return null;
};
