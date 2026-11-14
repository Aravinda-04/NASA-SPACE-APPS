# Planetary atlas imagery

Downloaded from the original NASA hosts on 14 November 2026. Files are served
locally; `manifest.json` records byte counts and SHA-256 checksums. No texture
or background is a live observation or current mission telemetry.

| File | Original asset | Primary source / credit |
| --- | --- | --- |
| `moon-color.jpg` | [lroc_color_2k.jpg](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg), 2048 × 1024 | [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), LRO / LROC. NASA's Scientific Visualization Studio; Ernie Wright / Noah Petro; LROC source mosaic assembled by the camera team at Arizona State University. |
| `moon-relief.jpg` | [ldem_3_8bit.jpg](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit.jpg), 1024 × 512 | [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), LRO / LOLA. |
| `mars-color.jpg` | [Mars.jpg](https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/mars/Mars.jpg), 1440 × 720 | [NASA Mars Image Texture](https://science.nasa.gov/3d-resources/mars/). NASA / Jet Propulsion Laboratory & Caltech. Viking images processed by USGS. |

Both color textures are used with a 0°-centred cylindrical map convention.
East-positive longitude maps to `u = (longitude + 180) / 360`; north is at the top.
The Mars image was visually checked against the placement of Olympus Mons and
Valles Marineris. The Moon kit explicitly documents its 0° central meridian.

The Moon color product is optimized for visualization, not scientific image
analysis. Its polar areas include lower-resolution LOLA albedo information.
The relief image drives a small illustrative bump effect, not calibrated terrain
geometry. Lighting, radius and relief strength are display choices. No DEM is
used for gameplay, landing-site reconstruction or quantitative measurement.

The library's Moon/Mars environment uses the matching map behind a strong blur.
The Outer Space background reuses the existing credited NASA artist's concept
`/images/history/pioneer-concept.webp`; it is decorative, not a historical
spacecraft photograph. The atlas itself draws original schematic geometry.
