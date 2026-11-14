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
| Viking 2 | [NASA mission history](https://science.nasa.gov/mission/viking-2/): landing 3 September 1976 at Utopia Planitia and end of lander transmissions in April 1980. The historical coordinate 47.968°N, 225.71°W is converted to **134.29°E** by 360 − 225.71. These are not Curiosity's coordinates. |
| Curiosity / sky crane | Existing mission source objects: [landing sequence](https://science.nasa.gov/resource/final-minutes-of-curiositys-arrival-at-mars/), [post-landing orbital image](https://www.jpl.nasa.gov/images/pia16001-scene-of-a-martian-landing/) and [mission overview](https://science.nasa.gov/mission/msl-curiosity/). Landing is labelled 6 August 2012 **UTC**. No live location or hardware status is claimed. |
| John Klein | Existing [JPL announcement](https://www.jpl.nasa.gov/news/nasa-rover-finds-conditions-once-suited-for-ancient-life-on-mars/), 12 March 2013. This is an announcement date, not an invented sampling time. Habitability is distinguished from evidence of organisms. |
| Ingenuity | [NASA mission and flight archive](https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/): first flight 19 April 2021, 72 flights, last flight 18 January 2024, mission end following rotor damage. It travelled with Perseverance at Jezero, not with Curiosity at Gale. |
| Pioneer 10 | Existing [NASA history](https://science.nasa.gov/mission/pioneer-10/) and [last-signal record](https://science.nasa.gov/missions/pioneer/pioneer-10-sends-last-signal/): launch 1972, Jupiter encounter 1973, final signal received 23 January 2003. A signal detection is not a telemetry return or a successful two-way exchange. |
| NEAR Shoemaker | [NASA mission history](https://science.nasa.gov/mission/near-shoemaker/): launch 1996, Eros orbit 2000, landing 12 February 2001 and last contact 28 February. Its Mathilde encounter and Eros landing are distinct events. |
| Dawn | [NASA overview](https://science.nasa.gov/mission/dawn/) and [mission-status archive](https://science.nasa.gov/mission/dawn/mission-status/): launch 2007, separate Vesta and Ceres campaigns, mission end in 2018 after attitude-control fuel depletion. The spacecraft was left in Ceres orbit, not landed. |
| Kepler / K2 | [NASA mission history](https://science.nasa.gov/mission/kepler/): launch year 2009, transit photometry, extended K2 mission, 2018 retirement and heliocentric orbit. A telescope's observation targets are not physical destinations it visited. |

## Preview provenance

- All previews are original SVG schematic reconstructions, not NASA imagery,
  telemetry, terrain models or engineering drawings.
- Only Surveyor 3 and Viking 2 show numerical location markers; their coordinates
  are supported above. A simple equirectangular grid projects longitude linearly
  from −180° to +180° and latitude from +90° to −90°. It shows no terrain.
- Other surface records use component studies and named location context. No
  coordinate is inferred from a crater name or from a related spacecraft.
- Outer Space diagrams show labelled conceptual sequences, never measured orbits,
  current positions or flight-time geometry. Kepler's final label is explicitly
  “Starlight,” an observation rather than a landing site.
- The existing mission registry determines playability. Only Surveyor 3,
  Curiosity and Pioneer 10 connect to 3D episodes. Archive records create no
  completion states or rewards.
