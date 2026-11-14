# Chronological archive source ledger

Checked against the primary records on 14 November 2026. Supplied dossiers were
used to identify candidates; their dates, image labels and scientific claims were
not adopted automatically. Existing mission/discovery prose and source objects
are reused in `src/data/chronologicalArtifacts.ts` where applicable.

## Chronology convention

Each row names its event: landing, recovery, result announcement, report
publication, first flight, or launch year. Entries are sorted within their own
volume. These dates do not represent a shared epoch, a spacecraft's current
condition, or colocated hardware. Outer Space uses launch years throughout.

| Record | Primary evidence and qualification |
| --- | --- |
| Surveyor 3 | [NASA mission history](https://science.nasa.gov/mission/surveyor-3/): landing on 20 April 1967 UT; last contact on 4 May. The source gives 3° south, 23.41° west. The archive uses this rounded historical coordinate, not a modern precision survey. |
| Apollo 12 / Intrepid | [NASA mission summary](https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_12a_Summary.htm): 19 November 1969 landing, precision-landing objectives and separated stages. Existing discovery sources also include LRO site context. No georeferenced distance is reconstructed. |
| Recovered camera | [NASA's Apollo 12 / Surveyor 3 record](https://science.nasa.gov/resource/apollo-12-and-surveyor-3/): dated 20 November 1969, documenting the visit and removal of the camera and other pieces. Distinguish recovery on the Moon from later return to Earth. |
| Camera test report | [NTRS 19710024418](https://ntrs.nasa.gov/citations/19710024418): publication date **31 December 1970**; the leading digits of the accession ID are not its publication year. Test findings concern returned hardware and include material discoloration. |
| Viking 1 | [NASA mission history](https://science.nasa.gov/mission/viking-1/): landing 20 July 1976, instruments, long surface operation and end of lander operations in November 1982. Biology experiments are not presented as proof of life. |
| Viking 2 | [NASA mission history](https://science.nasa.gov/mission/viking-2/): landing 3 September 1976 at Utopia Planitia and end of lander transmissions in April 1980. The interactive globe now uses **47.64°N, 134.29°E**, the explicitly planetocentric coordinate in [NASA's Viking overview](https://science.nasa.gov/mission/viking/). Do not mix its latitude with the older mission-history value of 47.968°N. |
| Curiosity / sky crane | Existing mission source objects: [landing sequence](https://science.nasa.gov/resource/final-minutes-of-curiositys-arrival-at-mars/), [post-landing orbital image](https://www.jpl.nasa.gov/images/pia16001-scene-of-a-martian-landing/) and [mission overview](https://science.nasa.gov/mission/msl-curiosity/). Landing is labelled 6 August 2012 **UTC**. No live location or hardware status is claimed. |
| John Klein | Existing [JPL announcement](https://www.jpl.nasa.gov/news/nasa-rover-finds-conditions-once-suited-for-ancient-life-on-mars/), 12 March 2013. This is an announcement date, not an invented sampling time. Habitability is distinguished from evidence of organisms. |
| Ingenuity | [NASA mission and flight archive](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/): first flight 19 April 2021, 72 flights, last flight 18 January 2024, mission end following rotor damage. It travelled with Perseverance at Jezero, not with Curiosity at Gale. |
| Pioneer 10 | Existing [NASA history](https://science.nasa.gov/mission/pioneer-10/) and [last-signal record](https://science.nasa.gov/missions/pioneer/pioneer-10-sends-last-signal/): launch 1972, Jupiter encounter 1973, final signal received 23 January 2003. A signal detection is not a telemetry return or a successful two-way exchange. |
| NEAR Shoemaker | [NASA mission history](https://science.nasa.gov/mission/near-shoemaker/): launch 1996, Eros orbit 2000, landing 12 February 2001 and last contact 28 February. Its Mathilde encounter and Eros landing are distinct events. |
| Dawn | [NASA overview](https://science.nasa.gov/mission/dawn/) and [mission-status archive](https://science.nasa.gov/mission/dawn/mission-status/): launch 2007, separate Vesta and Ceres campaigns, mission end in 2018 after attitude-control fuel depletion. The spacecraft was left in Ceres orbit, not landed. |
| Kepler / K2 | [NASA mission history](https://science.nasa.gov/mission/kepler/): launch year 2009, transit photometry, extended K2 mission, 2018 retirement and heliocentric orbit. A telescope's observation targets are not physical destinations it visited. |

## Interactive atlas and preview provenance

- Primary contents now places the interactive Three.js atlas on the left and the
  chronological index on the right. NASA source imagery and checksums are recorded
  in `public/images/atlas/README.md` and `manifest.json`. The dossier's smaller SVG
  component studies remain original schematic reconstructions.
- Surveyor 3 uses its sourced historical rounded region (3°S, 23.41°W). The camera
  recovery shares that **historical recovery region**; the equipment was returned
  to Earth. The Earth laboratory report has no lunar pin.
- Apollo 12 uses −3.0128° latitude, −23.4219° east longitude from [NASA NSSDCA's
  landing-site table](https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html),
  with its DE421 / Mean Earth–Polar Axis reference. Close lunar pins are not a
  measured reconstruction of the distance between spacecraft.
- Viking 1 uses 22.27°N, 312.05°E (equivalent to −47.95° east longitude), and
  Viking 2 uses 47.64°N, 134.29°E from the [explicitly planetocentric NASA
  overview](https://science.nasa.gov/mission/viking/). Older historical latitude
  values differ and are not substituted into this spherical display.
- Curiosity uses **−4.5895°, 137.4417°E**, supported by [NASA's MSL landing
  reconstruction](https://ntrs.nasa.gov/citations/20130010911). This is Bradbury
  Landing in 2012, not the rover's present location or the location of every
  discarded component. John Klein has no fabricated drill-target coordinate.
- Ingenuity uses the **approximate Jezero region, 18°N / 77°E**, stated in [JPL's
  landing press kit](https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/quick_facts/).
  It is explicitly labelled regional; it is neither the exact first-flight
  waypoint nor the helicopter's final position.
- The 3D Solar System is a mission-context schematic. Rings, sizes, angles,
  connections and body positions are illustrative, not ephemerides. Selection
  focuses Pioneer 10's historical Jupiter encounter, NEAR's Eros context, Dawn's
  Ceres context or Kepler's heliocentric observatory context. No live spacecraft
  position or reconstructed transfer geometry is claimed.
- The small SVG dossier previews remain labelled schematic reconstructions. Their
  coordinate grid is equirectangular and shows no measured terrain. Kepler's
  “Starlight” label denotes an observation, not a visited destination.
- The existing mission registry determines playability. Only Surveyor 3,
  Curiosity and Pioneer 10 connect to 3D episodes. Archive records create no
  completion states or rewards.
