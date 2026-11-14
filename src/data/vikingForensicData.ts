/**
 * Viking 1 Lander Forensic Data & Investigation Specification
 *
 * Chryse Planitia Landing: July 20, 1976 (Sol 0)
 * Mission Duration: 2,245 Martian Sols (Final Transmission: November 11, 1982)
 *
 * Strict Epistemic Provenance Standards:
 * - [DOCUMENTED HISTORY]: Verified from NASA JPL / Langley primary telemetry & photography.
 * - [RECONSTRUCTION]: Architectural/forensic 3D models and schematic geometric layouts.
 * - [EXPEDITION FICTION]: Fictional future astronaut inspection timeline & HUD interface.
 */

export type EpistemicProvenance =
  | '[DOCUMENTED HISTORY]'
  | '[RECONSTRUCTION]'
  | '[EXPEDITION FICTION]';

export interface ArchiveFAQChip {
  question: string;
  answer: string;
  citation: string;
}

export interface HolographicScrubberSpec {
  futureStateLabel: string; // 0% - Imagined future artifact state
  replayStateLabel: string; // 100% - 1976 operational replay
  wireframeColor: string;
  mechanismSummary: string;
  animationSteps: string[];
}

export interface VikingDiscoveryNode {
  id: string;
  title: string;
  component: string;
  coordinates: [number, number, number]; // (X, Y, Z) in meters
  provenance: EpistemicProvenance;
  summary: string;
  story: string;
  engineering: string;
  science: string;
  aftermath: string;
  evidence: string;
  faqChips: [ArchiveFAQChip, ArchiveFAQChip, ArchiveFAQChip];
  timeScrubber: HolographicScrubberSpec;
  sourceUrls: Array<{ title: string; url: string; credit: string }>;
}

export const VIKING_DISCOVERIES: VikingDiscoveryNode[] = [
  {
    id: '1_SAMPLER_BOOM_TRENCH',
    title: 'The Stalled Pin & "Sandy Flats" Trench',
    component: 'Surface Sampler Arm & Soil Shroud',
    coordinates: [1.8, 0.2, 2.2],
    provenance: '[DOCUMENTED HISTORY]',
    summary:
      'A locked pin threatened the entire soil biology mission until engineers commanded a vibration sequence that freed the arm.',
    story:
      'On July 22, 1976 (Sol 2), the collector boom stalled after extending only a few centimeters because a mechanical locking pin failed to drop. Mission engineers at JPL and Martin Marietta devised an extension-and-shake sequence on Sol 5, safely releasing the pin directly into Footpad #3. On Sol 8, the scoop dug the famous "Sandy Flats" trench, delivering the first pristine Martian soil to the onboard biology instruments.',
    engineering:
      'The 3.05-meter boom used a motorized bi-stem tubular steel boom that rolled out flat like a carpenter tape measure and formed a rigid tube upon extension. A backhoe-style shroud prevented fine drift sand from spilling during transport to the top-deck sample hoppers.',
    science:
      'Sampling fine Chryse regolith from below the radiation-sterilized surface layer was vital for the biology and organic chemistry packages. The trench exposed subsurface material protected from solar ultraviolet radiation.',
    aftermath:
      'The collector arm operated across thousands of sols, digging multiple trenches, nudging small rocks, and conducting magnetic particle adhesion tests with magnets mounted on the backhoe blade.',
    evidence:
      'Documented in NASA telemetry, Sol 5 Camera 2 photograph of locking pin in Footpad #3 (PIA00384), and Sol 8 trench photography.',
    faqChips: [
      {
        question: 'Why did the arm stall on Sol 2?',
        answer:
          'A mechanical locking pin designed to secure the collector head during launch and entry failed to pull free on the initial extension command.',
        citation: 'NASA SP-4212: On Mars — Exploration of the Red Planet 1958-1978',
      },
      {
        question: 'How did engineers confirm the pin dropped?',
        answer:
          'Camera 2 was commanded to take a high-resolution vertical scan of Footpad #3, capturing the silver pin resting inside the honeycomb pad.',
        citation: 'JPL PIA00384 (Sol 5 Camera 2 record)',
      },
      {
        question: 'How deep was the Sandy Flats trench?',
        answer:
          'The backhoe blade scooped approximately 15 cm deep, successfully piercing through the surficial duricrust into softer reddish-brown soil.',
        citation: 'Viking Lander 1 Surface Sampler Technical Log',
      },
    ],
    timeScrubber: {
      futureStateLabel: '2026+ Quiet Chryse Artifact',
      replayStateLabel: '1976 Sol 5–8 Pin Drop & Dig Sequence',
      wireframeColor: '#00F0FF',
      mechanismSummary:
        'Holographic cyan ghost extends the 3.05m boom out of its housing, drops the pin toward Footpad #3, and scoops a 15cm trench in the rust soil.',
      animationSteps: [
        '0% (Future): Retracted collector head rests static near lander chassis.',
        '35%: Cyan boom extends 1.4m; locking pin shakes and drops into Footpad #3.',
        '70%: Boom articulates downward, embedding backhoe teeth into regolith.',
        '100% (1976): Scoop drives 15cm into the soil, creating the Sandy Flats trench.',
      ],
    },
    sourceUrls: [
      {
        title: 'NASA SP-4212: Viking Surface Sampler Deployment',
        url: 'https://history.nasa.gov/SP-4212/ch10-5.html',
        credit: 'NASA History Division',
      },
      {
        title: 'PIA00384: Locking Pin in Footpad #3',
        url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00384',
        credit: 'NASA/JPL-Caltech',
      },
    ],
  },
  {
    id: '2_FACSIMILE_CAMERAS',
    title: 'Line by Line: The First Eye on Mars',
    component: 'Twin Mechanical Facsimile Cameras',
    coordinates: [0.4, 1.35, 0.9],
    provenance: '[DOCUMENTED HISTORY]',
    summary:
      'Rather than modern digital CCD sensors, Viking used mechanical nodding mirrors that scanned one vertical line of light at a time.',
    story:
      'Seconds after touchdown on July 20, 1976, Camera 2 began scanning Viking 1 Footpad #3 (PIA00381) to verify stability and ground clearance. Moments later, Camera 1 performed a sweeping 300° panoramic scan that revealed the rolling Chryse plain and the massive 2-meter vesicular basalt boulder named "Big Joe".',
    engineering:
      'Built by Itek, each camera utilized a single silicon photodiode array and a nodding mirror driven by an electric motor. The mirror scanned vertically from bottom to top; between each nod, the entire turret rotated horizontally by a tiny azimuth increment (0.04° or 0.12°). A full panorama took several minutes to complete.',
    science:
      'Color imagery was produced by combining three sequential vertical sweeps through red, green, and blue optical filters, proving the Martian sky was butterscotch-pink due to suspended iron-oxide dust rather than black or blue.',
    aftermath:
      'Over six Earth years, the two cameras documented seasonal frost, atmospheric dust storms, and micro-dune migrations across the landing site.',
    evidence:
      'NASA PIA00381 (First Photo from the Surface of Mars) and PIA00393 (First 300° Panorama showing "Big Joe").',
    faqChips: [
      {
        question: 'Why not use a standard video or TV camera?',
        answer:
          '1970s vidicon tube cameras were heavy, fragile, consumed high power, and lacked the dynamic range required for direct Martian sunlight and deep rock shadows.',
        citation: 'Itek Optical Systems Technical Journal (1977)',
      },
      {
        question: 'How fast was the vertical scanning mirror?',
        answer:
          'The mirror completed vertical lines at rates between 13.5 and 250 milliseconds per line depending on selected resolution and sensitivity mode.',
        citation: 'NASA Technical Note TN D-8148',
      },
      {
        question: 'What is the landmark boulder "Big Joe"?',
        answer:
          'A dark, porous vesicular basalt rock approximately 2m wide and 1m tall located ~8m northwest of the lander, likely ejected from a distant impact crater.',
        citation: 'JPL PIA00393 / Viking Geological Team Reports',
      },
    ],
    timeScrubber: {
      futureStateLabel: 'Static Camera Turrets',
      replayStateLabel: '1976 Line-by-Line Panorama & Scan-Plane',
      wireframeColor: '#00F0FF',
      mechanismSummary:
        'Sweeping vertical cyan scan-plane fans across Footpad #3 and "Big Joe", projecting a column-by-column progressive sweep in the PiP monitor.',
      animationSteps: [
        '0%: Camera turrets stationary; historical viewfinder idle.',
        '40%: Cyan vertical fan projects 25° downward, tracing Footpad #3.',
        '75%: Turret rotates azimuth, scanning across the plain towards "Big Joe".',
        '100%: 300° sweep completes; PIA00381 and PIA00393 records verified.',
      ],
    },
    sourceUrls: [
      {
        title: 'PIA00381: First Photograph from Mars Surface',
        url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00381',
        credit: 'NASA/JPL-Caltech',
      },
      {
        title: 'PIA00393: 300-Degree Chryse Panorama with "Big Joe"',
        url: 'https://photojournal.jpl.nasa.gov/catalog/PIA00393',
        credit: 'NASA/JPL-Caltech',
      },
    ],
  },
  {
    id: '3_BIOLOGY_GCMS_OVEN',
    title: 'The Great Chemistry Puzzle: LR vs GCMS',
    component: 'Biological Package (LR, GEX, PR) & GCMS Oven',
    coordinates: [-0.8, 1.1, -0.4],
    provenance: '[DOCUMENTED HISTORY]',
    summary:
      'A radioactive metabolic signal clashed with a total absence of organic molecules, sparking a 30-year debate solved by perchlorates.',
    story:
      'Viking carried three automated biological experiments: Labeled Release (LR), Gas Exchange (GEX), and Pyrolytic Release (PR). When nutrient broth tagged with radioactive Carbon-14 was squirted onto soil in the LR chamber, a sudden surge of radioactive gas was released—matching criteria for metabolism. But the Gas Chromatograph Mass Spectrometer (GCMS) heated the soil to 500°C and detected zero organic carbon down to parts per billion.',
    engineering:
      'The TRW-built biology package squeezed 40,000 components into 1 cubic foot (0.028 m³). Regolith dropped from the top funnel into a rotating carousel that distributed 1-cc soil aliquots into pressurized micro-test cells.',
    science:
      'If microbes produced the LR gas, organic molecules should have been found by GCMS. The 2008 Phoenix mission later explained the paradox: Martian soil contains perchlorates (ClO₄⁻). When heated to 500°C in the GCMS oven, perchlorates break down into aggressive oxygen and chlorine that combust and destroy organics before detection!',
    aftermath:
      'Viking taught astrobiologists that soil chemistry and inorganic oxidizers must be characterized before claiming organic detection.',
    evidence:
      'TRW Biology Instrument logs; Klein, Levin, and Biemann historical papers (1976–1977); 2008 Phoenix perchlorate validation.',
    faqChips: [
      {
        question: 'Why did the Labeled Release test register positive?',
        answer:
          'Superoxides, peroxides, and perchlorates in Martian soil rapidly broke down organic compounds like formate in the nutrient solution, evolving 14CO2 gas without living cells.',
        citation: 'NASA Astrobiology Institute Review',
      },
      {
        question: 'What temperature did the GCMS pyrolysis oven reach?',
        answer:
          'The GCMS oven heated samples sequentially up to 500°C (932°F) to volatilize organic compounds for carrier-gas separation.',
        citation: 'Journal of Geophysical Research (Biemann et al., 1977)',
      },
      {
        question: 'Could Viking have missed living microbes?',
        answer:
          'Yes, because the intense oxidizers in the soil incinerated organics inside the oven, masking micro-scale biosignatures.',
        citation: 'Phoenix Wet Chemistry Laboratory Findings (2008)',
      },
    ],
    timeScrubber: {
      futureStateLabel: 'Sealed Thermal Enclosure',
      replayStateLabel: '1976 Soil Drop, 500°C Pyrolysis & LR Gas Release',
      wireframeColor: '#00F0FF',
      mechanismSummary:
        'Holographic cutaway of internal carousel showing soil dropping from the top hopper into the 500°C pyrolysis chamber and the Labeled Release nutrient chamber.',
      animationSteps: [
        '0%: Sealed white thermal insulation covers biology bay.',
        '30%: Chassis cutaway fades in, exposing the 3-chamber carousel.',
        '65%: Soil aliquot drops into the 500°C GCMS pyrolysis oven.',
        '100%: Nutrient injection triggers glowing radioactive gas spike in LR cell.',
      ],
    },
    sourceUrls: [
      {
        title: 'NASA Astrobiology: The Viking Biology Experiments',
        url: 'https://astrobiology.nasa.gov/missions/viking/',
        credit: 'NASA Astrobiology Program',
      },
      {
        title: 'Journal of Geophysical Research: Search for Organic Matter on Mars',
        url: 'https://agupubs.onlinelibrary.wiley.com/doi/abs/10.1029/JS082i028p04641',
        credit: 'Klaus Biemann et al. (1977)',
      },
    ],
  },
  {
    id: '4_RTG_SBAND_COMMS',
    title: 'The Silent Sol: Accident of Sol 2,245',
    component: 'Twin SNAP-19 RTGs & S-Band High-Gain Dish',
    coordinates: [-1.1, 1.45, 0.2],
    provenance: '[DOCUMENTED HISTORY]',
    summary:
      'Viking 1 transmitted science across six years until a battery software patch accidentally pointed the antenna away from Earth forever.',
    story:
      'Powered by radioactive decay of Plutonium-238 inside twin SNAP-19 RTGs, Viking 1 outlived its 90-day design lifetime by more than 2,000 sols. On November 11, 1982, controllers uploaded ground command sequence 004 to update battery-charging logic. The commands unintentionally overwrote the high-gain antenna pointing tables, commanding the dish to turn away from Earth. Despite months of deep-space listening, Viking never responded.',
    engineering:
      'The high-gain antenna was a 76-cm parabolic reflector steered in azimuth and elevation to maintain direct line-of-sight tracking with NASA Deep Space Network dishes in Goldstone, Madrid, and Canberra. Redundant UHF relay antennas also communicated with Viking orbiters overhead.',
    science:
      'Viking 1 collected continuous daily meteorology records (atmospheric pressure, wind speed, air temperature from -14°C to -120°C) across three full Martian years, providing humanity’s baseline Martian climatological dataset.',
    aftermath:
      'NASA formally declared the mission complete in May 1983. In 1984, the lander was designated the Thomas A. Mutch Memorial Station in honor of the Viking imaging team leader.',
    evidence:
      'NASA JPL Viking 1 Final Mission Report (1983); Deep Space Network communication logbook.',
    faqChips: [
      {
        question: 'How much power did the SNAP-19 RTGs produce?',
        answer:
          'The two generators produced approximately 70 watts of electrical power at landing, gradually decaying to about 50 watts by late 1982.',
        citation: 'Department of Energy / Teledyne Isotopes SNAP-19 Report',
      },
      {
        question: 'Why could controllers not reset the lander?',
        answer:
          'Because the high-gain antenna was turned away from Earth, the lander receiver never acquired the uplink commands needed to restore default pointing.',
        citation: 'JPL Viking Project Historical Operations Ledger',
      },
      {
        question: 'What was the longest weather record on Mars?',
        answer:
          'Viking 1 recorded daily surface meteorology across 2,245 sols (more than 6 Earth years), documenting seasonal polar cap sublimation cycles.',
        citation: 'NASA Planetary Data System (PDS) Viking Meteorology',
      },
    ],
    timeScrubber: {
      futureStateLabel: 'Silent Desolate Station',
      replayStateLabel: '1976-1982 Earth-Locked Beam vs Nov 1982 Misalignment',
      wireframeColor: '#00F0FF',
      mechanismSummary:
        'Compares the 1976–1982 Earth-locked X/S-band transmission beam (#00F0FF) against the Nov 1982 antenna misalignment angle (#EF4444) that permanently severed contact.',
      animationSteps: [
        '0%: High-gain antenna rests static; no radio vector emitted.',
        '30%: Cyan RF beam (#00F0FF) locks toward Earth (Goldstone / Madrid).',
        '70%: Command sequence 004 executes; antenna gimbals slew off-target.',
        '100%: Red vector (#EF4444) points into empty sky; carrier signal lost.',
      ],
    },
    sourceUrls: [
      {
        title: 'NASA JPL: The Viking 1 Lander Final Transmission',
        url: 'https://science.nasa.gov/mission/viking-1/',
        credit: 'NASA Science Missions',
      },
      {
        title: 'Thomas A. Mutch Memorial Station Designation',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075C',
        credit: 'NASA Space Science Data Coordinated Archive',
      },
    ],
  },
];
