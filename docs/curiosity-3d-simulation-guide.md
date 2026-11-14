# Comprehensive Technical Blueprint: Curiosity Rover 3D Interactive Simulation

> **Document Purpose**: Complete architectural, visual, engineering, and content reference for the 3D Mars Curiosity Rover simulation in the *Off-World Expedition Journal*. This specification provides everything necessary for an AI agent or engineer to recreate this scenario or author an equivalent space exploration simulation.

---

## 1. System Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------+
|                                    React 18 App                                       |
|                                                                                       |
|  +--------------------+   +--------------------------------------------------------+  |
|  | BackpackLauncher   |   | ExplorationExperience (Container & State Coordinator)  |  |
|  | (Persistent HUD)   |   | - View mode (surface / orbit)                          |  |
|  +--------------------+   | - Waypoint tracking & proximity calculation            |  |
|                           | - Camera command queue & fast-travel                   |  |
|                           | - Pointer lock & input listeners                       |  |
|                           +--------------------------------------------------------+  |
|                                     |                                 |               |
|                                     v (Canvas 3D)                     v (DOM HUD)     |
|                        +--------------------------+      +-------------------------+  |
|                        | Three.js Scene           |      | Editorial UI Overlays   |  |
|                        | - Directional/Hemi light |      | - Topbar & Back action  |  |
|                        | - Mars atmosphere & fog  |      | - Discovery list drawer |  |
|                        | - Procedural Surface     |      | - Proximity banner [F]  |  |
|                        | - 4-Band Cel Shading     |      | - Archive record drawer |  |
|                        | - NormalizedModel (GLB)  |      | - Evidence task modal   |  |
|                        | - MarsArtifacts          |      | - Controls & shortcuts  |  |
|                        | - DiscoveryMarker (3D)   |      | - Caption disclaimer    |  |
|                        +--------------------------+      +-------------------------+  |
+---------------------------------------------------------------------------------------+
```

### Core Dependencies (`package.json`)
- **React**: `^18.3.1` / `react-dom: ^18.3.1`
- **Three.js**: `^0.169.0`
- **React Three Fiber (R3F)**: `@react-three/fiber: ^8.17.10`
- **React Three Drei**: `@react-three/drei: ^9.114.0`
- **Icons**: `lucide-react: ^0.454.0`
- **Bundler & Language**: `vite: ^5.4.10`, `typescript: ^5.6.3`, `tailwindcss: ^3.4.14`

---

## 2. Typography & Font System

The visual design is inspired by high-end museum exhibitions and Apple editorial aesthetics: a rich serif for titles and stories, coupled with an ultra-clean geometric sans for data, HUD labels, and controls.

| Font Family | Local File | Source & License | Weights Used | Usage in Curiosity Simulation |
| :--- | :--- | :--- | :--- | :--- |
| **DM Serif Display** | `/public/fonts/journal-display.ttf` | Google Fonts (SIL OFL 1.1) | `400` (Regular) | Mission heading (`Curiosity · Mars Science Laboratory`), "Your discoveries", Archive record titles, Conclusion headers |
| **DM Sans** | `/public/fonts/journal-sans.ttf` | Google Fonts (SIL OFL 1.1) | `100–900` (Variable) | Body text, telemetry/archive tabs, button labels, HUD badges, keycaps (`[C]`, `[F]`) |

### CSS Font Face Definition (`src/styles/offworld.css`)
```css
@font-face {
  font-family: "DM Sans";
  src: url("/fonts/journal-sans.ttf") format("truetype");
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: "DM Serif Display";
  src: url("/fonts/journal-display.ttf") format("truetype");
  font-weight: 400;
  font-display: swap;
}
```

### Contrast & Sizing Standards
- Body text is set to `14px–16px` with line-height `1.6–1.75`.
- Primary text on dark HUD `#fff8e7` achieves a contrast ratio of **12.69:1** against `#152826`.
- Archive drawer paper background `#f5eedc` with dark ink `#14292d` achieves a contrast ratio of **10.89:1**.
- Keycap badges `<kbd>` have 1px borders with explicit uppercase styling.

---

## 3. 3D Models, Draco Compression & Model Normalization

### Curiosity Rover GLB Asset
- **Asset path**: `/public/models/curiosity.glb` (5,285,116 bytes / ~5.04 MB).
- **Source**: NASA 3D Resources / Eyes on the Solar System (`https://science.nasa.gov/resource/curiosity-rover-3d-model/`).
- **Draco Compression Decoder**: Shipped locally at `/public/vendor/draco/` (`draco_decoder.js`, `draco_decoder.wasm`, `draco_wasm_wrapper.js`) to guarantee 100% offline functionality without external CDN dependencies.

### Procedural Model Normalization Pipeline (`NormalizedModel`)
In `src/features/exploration/MissionWorld.tsx`, any arbitrary 3D model is normalized at runtime so it fits uniformly in the scene regardless of its original Maya/Blender export scale:

```typescript
function NormalizedModel({ path, span, grounded = true }: { path: string; span: number; grounded?: boolean }) {
  const { scene } = useGLTF(path, '/vendor/draco/');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    // 1. Material conversion to 4-band Cel-Shading
    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (!node.geometry?.attributes.position?.count) { node.visible = false; return; }

      const convert = (original: THREE.Material) => {
        const source = original as THREE.MeshStandardMaterial;
        return new THREE.MeshToonMaterial({
          color: source.color ? source.color.clone() : new THREE.Color('#d8d4c6'),
          map: source.map ?? null,
          gradientMap: getFourStepGradientMap(),
          transparent: source.transparent,
          opacity: source.opacity,
          side: source.side,
          alphaTest: source.alphaTest,
        });
      };
      node.material = Array.isArray(node.material) ? node.material.map(convert) : convert(node.material);
      node.castShadow = true;
      node.receiveShadow = true;
    });

    // 2. Automatic Bounding Box Calculation & Scaling
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = span / Math.max(size.x, size.y, size.z, 0.001);

    const container = new THREE.Group();
    container.add(clone);
    clone.position.sub(center);
    if (grounded) clone.position.y += size.y / 2; // Snap base of wheels to ground level (y=0)
    container.scale.setScalar(scale);

    return container;
  }, [scene, span, grounded]);

  // Proper GPU disposal on unmount
  useEffect(() => () => {
    model.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((m) => m.dispose());
      }
    });
  }, [model]);

  return <primitive object={model} dispose={null} />;
}
```

### Fallback Schematic Geometry (`CuriositySchematic`)
If the WebGL context is stressed or the 5MB model takes time to load, React `Suspense` and `ModelFallback` immediately render a lightweight geometric rover composed of Three.js primitives:
- Main chassis: `boxGeometry args={[1.5, 0.5, 2]}` colored `#e0dbca`.
- 6 Wheels: `cylinderGeometry args={[0.35, 0.35, 0.25, 16]}` rotated 90° on Z, colored `#454842`.
- Mast & ChemCam sensor head: Strut cylinder from `[-0.35, 1.25, -0.3]` to `[-0.35, 2.15, -0.3]` with box head `#d5d0bf` and lens `#283c42`.

---

## 4. Environment & World Building

The Mars environment uses an illustrative, high-contrast Moebius graphic-novel style rather than a dark realistic simulation.

### 1. Atmosphere, Sky & Lighting
- **Background Color**: `#c69273` (warm dusty terracotta).
- **Atmospheric Fog**: `THREE.Fog('#c69273', near: 42, far: 150)` creating an unbroken fade from the ground into the horizon.
- **Ambient Light**: `color="#fff0d6"`, intensity `0.7`.
- **Hemisphere Light**: Sky `#f5d9b0`, Ground `#69402d`, intensity `1.15`.
- **Directional Sunlight**:
  - `position={[-12, 16, 8]}`, intensity `3.0`, color `#fff4dd`.
  - Shadows enabled: `castShadow`, `shadow-mapSize={[1024, 1024]}`, `shadow-camera-left={-25}`, `shadow-camera-right={25}`, `shadow-camera-top={25}`, `shadow-camera-bottom={-25}`, `shadow-bias={-0.001}`.

### 2. Moebius 4-Band Cel Shading (`src/utils/celShading.ts`)
Instead of standard smooth PBR lighting, all surfaces use a stepped ramp texture (`getFourStepGradientMap()`):
```typescript
// 4 discrete luminance steps
const steps = new Uint8Array([40, 105, 185, 255]);
// Step 1 (0-25%): deep ink shadow (40)
// Step 2 (25-50%): mid core shadow (105)
// Step 3 (50-75%): illuminated surface (185)
// Step 4 (75-100%): peak highlight (255)

const texture = new THREE.DataTexture(steps, 4, 1, THREE.RedFormat);
texture.minFilter = THREE.NearestFilter;
texture.magFilter = THREE.NearestFilter;
texture.generateMipmaps = false;
```

### 3. Procedural Surface & Terrain Generation (`Surface`)
Built using a deterministic pseudo-random number generator (PRNG) with seed `2012` (the landing year of Curiosity):
```typescript
function seeded(seed: number) {
  return () => {
    seed = Math.imul(1664525, seed) + 1013904223;
    return (seed >>> 0) / 4294967296;
  };
}
```
1. **Ground Disk**:
   - `circleGeometry args={[180, 96]}`, rotated `[-Math.PI / 2, 0, 0]`, position `[0, -0.04, 0]`.
   - Material: `MeshToonMaterial color="#b8734f"` with cel-shading map, `receiveShadow`.
2. **Rocks & Boulders**:
   - 125 low-poly rocks distributed radially between 5m and 73m.
   - Geometry: `dodecahedronGeometry args={[1, 0]}`.
   - Varied scale `[scale, scale * 0.7, scale * 1.1]`.
   - Colors: Alternate `#89533c` and `#d49a6e`.
   - Exclusion zones: Proximity filter (`Math.hypot > 3`) ensures stations at `[-11, -10]`, `[10, -7]`, and `[0, 0]` remain unobstructed.
3. **Distant Mountain Backdrop**:
   - 28 low-poly mountain peaks distributed in a perimeter at distances `75 + random * 25`.
   - Geometry: `icosahedronGeometry args={[1, 1]}` with height `7 + random * 18` and radius `10 + random * 15`.
   - Color: `#aa6649`.

### 4. Authored Martian Artifacts (`MarsArtifacts`)
1. **Landing Debris Station (Heat Shield Exhibit)**:
   - Position: `[-11, 0.13, -10]`, rotated `[0.12, 0.3, 0.08]`.
   - Base shield: `cylinderGeometry args={[1.7, 1.5, 0.19, 24]}`, color `#5d4639`.
   - Inset cap: `cylinderGeometry args={[1.25, 1.6, 0.13, 24]}`, color `#a77953`.
2. **John Klein Drill Site**:
   - Position: `[10, 0, -7]`.
   - Drilled rock outcrop: Flattened dodecahedron `scale={[1.6, 0.18, 1.05]}`, color `#b8a087`.
   - Borehole: `circleGeometry args={[0.06, 12]}`, color `#3c3028` at `[0.18, 0.35, 0.05]`.
3. **Illustrative Rover Tracks**:
   - 2 parallel dashed golden tracks on each side (`x = -0.65` and `x = +0.65`):
   - `@react-three/drei` `Line` component with coordinates `[[x, 0.018, 3], [x+0.6, 0.018, 5], [x+2, 0.018, 7], [x+4.4, 0.018, 9]]`.
   - Color `#e5bb80`, `dashed`, `dashSize={0.18}`, `gapSize={0.2}`, opacity `0.4`.

---

## 5. Camera, Navigation & Controls

### Dual-Mode Camera (`ExplorerCamera`)

```
             +--------------------+
             |   ViewMode State   |
             +---------+----------+
                       |
        +--------------+--------------+
        |                             |
        v                             v
+-----------------------+   +----------------------+
|     'surface'         |   |      'orbit'         |
| First-Person Explorer |   |   Orbit Inspection   |
| - WASD movement       |   | - Drei OrbitControls |
| - Mouse look / Lock   |   | - Drag to rotate     |
| - Shift to sprint     |   | - Scroll to zoom     |
| - Height locked 1.7m  |   | - Distance 3..55m    |
| - Proximity detection |   | - Polar angle clamp  |
+-----------------------+   +----------------------+
```

1. **Surface Mode (First Person)**:
   - Camera elevation: Fixed at `y = 1.7` (eye height).
   - Speed: `3.0 m/s` default, `6.0 m/s` when holding `Shift`.
   - Movement: Vector calculation based on `yaw` angle:
     ```typescript
     movement.set(right, 0, -forward);
     if (movement.lengthSq() > 0) {
       movement.normalize().applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw.current);
     }
     camera.position.addScaledVector(movement, speed * dt);
     // Bounded movement zone
     camera.position.x = THREE.MathUtils.clamp(camera.position.x, -38, 38);
     camera.position.z = THREE.MathUtils.clamp(camera.position.z, -38, 38);
     ```
   - Pitch & Yaw: Clamped pitch (`-84.6°` to `+84.6°`), Euler rotation order `'YXZ'`.
2. **Orbit Mode**:
   - Activated via `[C]` key or button click.
   - Smooth OrbitControls targeting the rover or active discovery.
   - `minDistance: 3`, `maxDistance: 55`, `maxPolarAngle: Math.PI * 0.48` (prevents looking beneath the ground disk).
3. **Teleport / Fast Travel (`goTo`)**:
   - Triggered by clicking the compass arrow icon in the discovery drawer or the bottom right button.
   - Positions camera at `[target.x + 2.5, 1.7, target.z + 4.5]`, orienting view directly towards the target.

### Proximity Detection Loop
Runs in `useFrame` throttled to 5 Hz (every 200ms) to conserve CPU cycles:
```typescript
for (const discovery of mission.discoveries) {
  const dx = camera.position.x - discovery.position[0];
  const dy = camera.position.y - discovery.position[1];
  const dz = camera.position.z - discovery.position[2];
  const distance = Math.hypot(dx, dy, dz);
  if (distance < 7 && (!nearest || distance < nearest.distance)) {
    nearest = { id: discovery.id, distance: Math.round(distance * 10) / 10 };
  }
}
```
If `distance < 7m`, the floating interaction prompt appears: `Inspect [Name] · [X.X] m away in this reconstruction · [F]`.

---

## 6. Mission Content & The 4 Discoveries

The Curiosity mission definition in `src/data/expeditionMissions.ts` consists of 4 curated waypoint stations:

```
                                  [North: -Z]
                                       |
                   Station 1: Landing  |  Station 4: John Klein
                   [-11, 0.3, -10]     |  [10, 0.3, -7]
                                       |
  [West: -X] ----------------------- [0,0] ----------------------- [East: +X]
                               Station 2: Wheels [0, 0.6, 0]
                               Station 3: Mast   [0, 2.0, 0]
                                       |
                                       |   Rover tracks
                                       |   extending south
                                       |
                                  [South: +Z]
```

### Detailed Waypoint Content
1. **Station 1: `landing` — "A successful separation"**
   - **Position**: `[-11, 0.3, -10]` (Heat shield exhibit).
   - **Component**: Landing hardware archive.
   - **Story**: Explains how the heat shield protected the spacecraft, the supersonic parachute slowed it, and the sky-crane powered descent stage touched Curiosity down before flying away.
   - **Science**: Explains that leaving hardware behind was an intentional engineering choice to protect the science instruments.
   - **Engineering**: Real NASA PIA16001 data: heat shield landed ~1,500m away, parachute ~615m, descent stage ~650m.
   - **Sources**: `PIA16001: Scene of a Martian Landing` & `Final Minutes of Curiosity's Arrival at Mars`.

2. **Station 2: `wheels` — "A laboratory on six wheels"**
   - **Position**: `[0, 0.6, 0]` (Chassis level).
   - **Component**: Wheels and rocker-bogie suspension.
   - **Story**: Six-wheel rocker-bogie mobility enables the rover to climb over rocks larger than its wheels without tipping.
   - **Engineering**: Max speed is ~4.2 cm/s (deliberate, highly planned traverse; not high-speed racing).
   - **Sources**: `JPL Robotics Mars 2020 & Curiosity Mobility Comparison`.

3. **Station 3: `instruments` — "Different tools, different questions"**
   - **Position**: `[0, 2, 0]` (Mast head).
   - **Component**: ChemCam, drill, CheMin and SAM.
   - **Story**: No single instrument gives the answer. ChemCam fires laser pulses into rocks; the drill acquires powdered rock samples for the CheMin (X-ray diffraction) and SAM (Sample Analysis at Mars) internal analytical laboratories.
   - **Sources**: `NASA Science: Curiosity Science Instruments`.

4. **Station 4: `sample` — "A rock remembers water"**
   - **Position**: `[10, 0.3, -7]` (John Klein drill station).
   - **Component**: John Klein drill-site archive.
   - **Story**: In 2013 at Yellowknife Bay, Curiosity drilled the John Klein mudstone, finding sulfur, nitrogen, oxygen, phosphorus, and carbon—evidence that ancient Mars had fresh, non-acidic lakes suitable for microbial life.
   - **Scientific Nuance**: Emphasizes that habitability means *conditions could have supported life*, not proof that life existed.
   - **Sources**: `JPL News: Conditions Once Suited for Ancient Life on Mars (March 12, 2013)`.

---

## 7. Interactive UI/UX Elements & Popups

### 1. In-World 3D Marker (`DiscoveryMarker`)
- Rendered using `@react-three/drei` `Billboard` so it always faces the player.
- Outer ring + center dot on top of a vertical anchor pin.
- **Dynamic colors**:
  - Selected: `#fff3d4` (warm highlight)
  - Discovered: `#86bfb4` (soft sage green)
  - Undiscovered: `#bb6745` (Mars rust accent)

### 2. Top Navigation Bar (`.exp-topbar`)
- Left: `<button className="exp-back-button">` with arrow icon (`Back to journal`).
- Center: Mission Title (`Curiosity · Mars Science Laboratory`) + Subtitle (`Mars · Surface expedition`).
- Right: Journal record pill `<button className="exp-journal-toggle">` showing current count (`4/4 records`) and green checkmark when complete.

### 3. Discovery Checklist Drawer (`.exp-discoveries`)
- Positioned on the left side (`top: 157px; left: 30px; width: 296px`).
- Collapsible via chevron button or `[J]` key.
- List items show:
  - Discovered status badge (Number `1–4` or checkmark `<Check />`).
  - Waypoint title and component label.
  - Compass navigation button (`.exp-go-button` / `<Navigation />`) to teleport camera directly to the site.
- Bottom action: Flag button (`.exp-task-button`) "Connect the evidence" (glows orange when 4/4 discovered).

### 4. Archive Record Drawer (`ArchiveRecord` / `.exp-archive`)
- Positioned on the right side (`top: 112px; bottom: 124px; width: 455px`).
- Warm parchment aesthetic (`background: #f5eedc`, `color: #14292d`).
- Content tabs:
  - **The story**: Narrative overview + "What it helped us learn".
  - **Engineering**: Technical mechanics and telemetry facts.
- Status note & "Follow the evidence" section with direct outbound links to official NASA and JPL papers.

### 5. Expedition Conclusion Panel (`.exp-task-panel`)
- Triggered after inspecting all 4 stations.
- Multiple-choice assessment testing scientific reasoning:
  - *Question*: "Which conclusion is supported by the John Klein investigation?"
  - *Option A*: Curiosity photographed living microbes.
  - *Option B* (Correct): Ancient conditions could have supported microbial life.
  - *Option C*: A single laser measurement proved that Mars still has lakes.
- Instant feedback explains the distinction between ancient habitability and detection of organisms.
- Completing the task unlocks the **Sky-Crane Trailblazer** collectible card in the Space Backpack.

### 6. Bottom Controls Bar (`.exp-bottom-bar`)
- Left group:
  - Orbit View toggle (`[C]` shortcut).
  - Mouse Capture button (`Capture mouse` / Pointer Lock).
  - Controls modal button (`Controls`).
- Right action: `Go to a discovery ->` quick navigation button.
- Center bottom: Scientific disclaimer text (`.exp-scene-caption`).

### 7. Space Backpack Launcher (`.backpack-launcher`)
- Positioned persistently on the right edge (`src/features/collection/BackpackExperience.tsx`).
- Displays 3D render of the backpack (`/images/rewards/offworld-backpack-shell.webp`).
- Opening it suspends the 3D scene loop (`frameloop="never"`) to eliminate background GPU drain.

---

## 8. Step-by-Step Blueprint to Recreate a Similar Scenario

To build another mission (e.g., *Perseverance at Jezero Crater*, *Cassini at Saturn*, or *James Webb Space Telescope*), follow this exact execution pattern:

```typescript
// Step 1: Define Mission Data in src/data/expeditionMissions.ts
export const PERSEVERANCE_MISSION: ExpeditionMission = {
  id: 'perseverance',
  destination: 'Mars',
  name: 'Perseverance · Mars 2020',
  accent: '#c85a32',
  sceneNote: 'Schematic reconstruction of Jezero crater delta investigation.',
  discoveries: [
    {
      id: 'ingenuity',
      title: 'First powered flight',
      component: 'Ingenuity Mars Helicopter',
      position: [5, 0.4, 6],
      summary: 'Aerial scouting on another world.',
      story: '...',
      science: '...',
      engineering: '...',
      status: '...',
      evidence: 'Historical record',
      sourceIds: ['ingenuity-source']
    },
    // Add 3 more discoveries
  ],
  task: {
    question: '...',
    options: ['...', '...', '...'],
    correctIndex: 1,
    explanation: '...'
  },
  sources: [ /* NASA sources */ ]
};

// Step 2: Set up R3F Canvas in Experience Container
<Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.7, 14], fov: 58 }}>
  <color attach="background" args={['#c69273']} />
  <fog attach="fog" args={['#c69273', 42, 150]} />
  <ambientLight intensity={0.7} color="#fff0d6" />
  <hemisphereLight args={['#f5d9b0', '#69402d', 1.15]} />
  <directionalLight position={[-12, 16, 8]} intensity={3} castShadow />

  {/* Step 3: Procedural terrain with Moebius 4-band shader */}
  <Surface moon={false} />

  {/* Step 4: 3D Model with runtime material replacement & auto-centering */}
  <NormalizedModel path="/models/perseverance.glb" span={3.3} />

  {/* Step 5: Waypoints with Billboard rings */}
  {discoveries.map((d) => (
    <DiscoveryMarker
      key={d.id}
      position={d.position}
      onClick={() => openArchive(d.id)}
    />
  ))}

  {/* Step 6: Dual-mode camera with 5Hz proximity loop */}
  <ExplorerCamera mode={mode} onNearby={handleNearby} />
</Canvas>
```

---

## 9. Key Architectural Lessons & Best Practices

1. **Moebius Cel-Shading over Heavy PBR**: Replacing standard metallic/roughness PBR with a 4-step `DataTexture` and `MeshToonMaterial` achieves an artistic, graphic-novel aesthetic that runs at 60 FPS even on low-end mobile devices and integrated GPUs.
2. **Deterministic PRNG over Heightmaps**: Using `seeded(2012)` allows generating 125 rocks, 28 hills, and ground geometry procedurally without downloading heavy multi-megabyte terrain displacement maps.
3. **Decoupled 3D World & DOM UI**: Keeping the UI entirely in semantic HTML/CSS overlays (`position: absolute`) rather than 3D HTML planes in Three.js ensures full accessibility, screen-reader compatibility, sharp text rendering, and responsive reflow across desktop and mobile.
4. **Offline Resilience**: Shipping local Draco decoders (`/public/vendor/draco/`) and low-poly fallback geometry (`CuriositySchematic`) ensures the application never crashes even if the 3D model fails to load or WebGL has reduced capacity.
5. **Educational Integrity**: Clear separation between scientific historical facts (documented in NASA PIA images) and illustrative reconstruction choices (clarified in `.exp-scene-caption` and badges).
