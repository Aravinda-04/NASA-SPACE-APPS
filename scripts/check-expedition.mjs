import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compiledModules = new Map();
const moduleUrl = (url) => {
  if (compiledModules.has(url.href)) return compiledModules.get(url.href);
  const source = readFileSync(url, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
    },
  });
  const resolved = outputText.replace(/from (["'])(\.[^"']+)\1/g, (_, quote, path) => {
    const dependency = new URL(path.endsWith('.ts') ? path : `${path}.ts`, url);
    return `from ${quote}${moduleUrl(dependency)}${quote}`;
  });
  const result = `data:text/javascript;base64,${Buffer.from(resolved).toString("base64")}`;
  compiledModules.set(url.href, result);
  return result;
};
const loadTs = (path) => import(moduleUrl(new URL(path, import.meta.url)));
const { EXPEDITION_MISSIONS: missions } = await loadTs(
  "../src/data/expeditionMissions.ts",
);
const {
  contentRevision,
  normalizeProgress,
  readSavedExpedition,
  normalizeSave,
  emptySave,
  completeMission,
  collectionCount,
  EXPEDITION_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
} = await loadTs("../src/utils/expeditionProgress.ts");
assert.equal(missions.length, 13);
assert.equal(new Set(missions.map((m) => m.id)).size, 13);
for (const mission of missions) {
  assert.equal(
    mission.discoveries.length,
    4,
    `${mission.id}: four essential discoveries`,
  );
  assert.equal(
    new Set(mission.discoveries.map((d) => d.id)).size,
    mission.discoveries.length,
  );
  const sourceIds = new Set(mission.sources.map((s) => s.id));
  for (const source of mission.sources)
    assert.equal(new URL(source.url).protocol, "https:");
  for (const discovery of mission.discoveries) {
    assert.ok(discovery.sourceIds.length, `${discovery.id}: source required`);
    for (const id of discovery.sourceIds)
      assert.ok(
        sourceIds.has(id),
        `${mission.id}/${discovery.id}: missing source ${id}`,
      );
    assert.ok(discovery.position.every(Number.isFinite));
    for (const key of ["summary", "story", "science", "engineering", "status"])
      assert.ok(discovery[key]?.length > 20);
  }
  assert.ok(
    mission.task.correctIndex >= 0 &&
      mission.task.correctIndex < mission.task.options.length,
  );
  assert.ok(
    mission.sceneNote.includes("Fictional") ||
      mission.sceneNote.includes("Schematic"),
  );
}
const cleaned = normalizeProgress(
  {
    curiosity: {
      discovered: ["wheels", "wheels", "bad-id", 3],
      completed: true,
    },
  },
  missions,
);
assert.deepEqual(cleaned.curiosity, {
  discovered: ["wheels"],
  completed: false,
});
assert.equal(normalizeProgress(null, missions).pioneer.completed, false);
assert.equal(
  normalizeProgress(
    {
      pioneer: {
        discovered: missions[2].discoveries.map((d) => d.id),
        completed: true,
      },
    },
    missions,
  ).pioneer.completed,
  true,
);
globalThis.localStorage = { getItem: () => "{broken" };
assert.equal(
  readSavedExpedition(missions).progress.curiosity.discovered.length,
  0,
);
globalThis.localStorage = {
  getItem: () => {
    throw new Error("Storage denied");
  },
};
assert.equal(readSavedExpedition(missions).progress.surveyor.completed, false);
globalThis.localStorage = {
  getItem: () =>
    JSON.stringify({ version: 1, lastMissionId: "unrecognized", progress: {} }),
};
assert.equal(readSavedExpedition(missions).lastMissionId, undefined);
const savedRecord = {
  version: 1,
  contentRevision: contentRevision(missions),
  lastMissionId: "pioneer",
  progress: {
    pioneer: {
      discovered: missions[2].discoveries.map((d) => d.id),
      completed: true,
    },
  },
};
globalThis.localStorage = { getItem: () => JSON.stringify(savedRecord) };
assert.equal(readSavedExpedition(missions).progress.pioneer.completed, true);
assert.equal(readSavedExpedition(missions).lastMissionId, "pioneer");
const revised = structuredClone(missions);
revised[2].task.question += " Revised evidence.";
assert.equal(
  readSavedExpedition(revised).progress.pioneer.completed,
  true,
  "Editorial revisions must not erase valid legacy completion.",
);
const migrated = readSavedExpedition(missions);
assert.equal(migrated.version, 2);
assert.equal(migrated.collection["pioneer-messenger"].earnedAt, null);
assert.equal(
  migrated.collection["pioneer-messenger"].origin,
  "legacy-completion",
);
const storage = new Map([[LEGACY_STORAGE_KEY, JSON.stringify(savedRecord)]]);
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null };
assert.equal(readSavedExpedition(missions).progress.pioneer.completed, true);
assert.equal(
  storage.has(LEGACY_STORAGE_KEY),
  true,
  "Reading migration must leave the original save intact.",
);
const v2 = {
  ...migrated,
  readingLocations: { surveyor: 3, curiosity: 1, pioneer: 2 },
  optionalAttempts: { pioneer: { answer: 2, attempts: 3, correct: true } },
};
storage.set(EXPEDITION_STORAGE_KEY, JSON.stringify(v2));
assert.deepEqual(
  readSavedExpedition(revised),
  v2,
  "V2 reload preserves books, completion, card metadata and optional attempts.",
);
storage.set(EXPEDITION_STORAGE_KEY, "{broken");
assert.equal(
  readSavedExpedition(missions).progress.pioneer.completed,
  true,
  "Corrupt v2 can recover a valid legacy backup.",
);
const viking = missions.find(mission => mission.id === 'viking');
const standaloneStorage = new Map([
  ['viking_expedition_progress', JSON.stringify({
    discovered: viking.discoveries.map(discovery => discovery.id),
    completed: true,
  })],
]);
globalThis.localStorage = { getItem: key => standaloneStorage.get(key) ?? null };
const standaloneMigrated = readSavedExpedition(missions);
assert.equal(standaloneMigrated.progress.viking.completed, true);
assert.equal(standaloneMigrated.collection['viking-laboratory'].origin, 'legacy-completion');
assert.equal(standaloneMigrated.collection['viking-laboratory'].earnedAt, null);
const invalid = normalizeSave(
  {
    version: 2,
    progress: {},
    collection: { "pioneer-messenger": { earnedAt: "bad" }, invented: {} },
    readingLocations: { curiosity: 999 },
    optionalAttempts: { curiosity: { attempts: -4 } },
  },
  missions,
);
assert.deepEqual(invalid.collection, {});
assert.equal(invalid.readingLocations.curiosity, 0);
assert.deepEqual(invalid.optionalAttempts, {});
let journey = emptySave(missions);
assert.equal(
  completeMission(journey, "surveyor", missions, "2026-11-14T00:00:00Z"),
  journey,
  "Records are required before completion.",
);
for (const mission of missions) {
  journey.progress[mission.id].discovered = mission.discoveries.map(
    (d) => d.id,
  );
  journey = completeMission(
    journey,
    mission.id,
    missions,
    "2026-11-14T00:00:00Z",
  );
  const beforeReplay = journey;
  journey = completeMission(
    journey,
    mission.id,
    missions,
    "2026-11-15T00:00:00Z",
  );
  assert.equal(
    journey,
    beforeReplay,
    "Replay is idempotent and preserves the earned timestamp.",
  );
}
assert.equal(collectionCount(journey), 13);
assert.equal(Object.keys(journey.collection).length, 13);
assert.equal(
  normalizeSave(
    { ...journey, collection: { ...journey.collection, future: {} } },
    missions,
  ).collection.future,
  undefined,
);
const { COLLECTIBLE_CARDS: cards } = await loadTs(
  "../src/data/collectibleCards.ts",
);
const { OPTIONAL_QUESTIONS: questions } = await loadTs(
  "../src/data/optionalQuestions.ts",
);
const { BOOK_BY_MISSION: bookByMission } = await loadTs(
  "../src/data/books.ts",
);
assert.deepEqual(bookByMission, {
  surveyor: 'surveyor', apollo12: 'surveyor', 'returned-camera': 'surveyor', 'camera-lab': 'surveyor', curiosity: 'curiosity', pioneer: 'pioneer',
  viking: 'curiosity', viking2: 'curiosity', 'john-klein': 'curiosity', ingenuity: 'curiosity', near: 'pioneer', dawn: 'pioneer', kepler: 'pioneer',
});
for (const card of cards) {
  assert.ok(missions.some((m) => m.id === card.missionId));
  assert.equal(new URL(card.source).protocol, "https:");
  assert.ok(
    readFileSync(new URL("../public" + card.artwork, import.meta.url)).length >
      0,
  );
}
assert.equal(cards.length, missions.length);
assert.equal(new Set(cards.map((c) => c.id)).size, 13);
assert.equal(new Set(cards.map((c) => c.missionId)).size, 13);
for (const mission of missions) {
  const q = questions[mission.id];
  assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
  assert.ok(q.explanation.length > 30);
}
const {
  LIGHT_SPEED_KM_S,
  LIGHT_TIME_PRESETS,
  lightTimeSeconds,
  formatLightTime,
} = await loadTs("../src/utils/lightTime.ts");
assert.equal(LIGHT_SPEED_KM_S, 299792.458);
assert.ok(Math.abs(lightTimeSeconds(12.23e9) - 40794.889) < 0.01);
assert.equal(formatLightTime(lightTimeSeconds(12.23e9)), "11h 20m");
assert.equal(formatLightTime(2 * lightTimeSeconds(12.23e9)), "22h 40m");
assert.ok(
  Math.abs(lightTimeSeconds(LIGHT_TIME_PRESETS[1].distanceKm) - 1.28222) <
    0.001,
);
assert.ok(
  Math.abs(lightTimeSeconds(LIGHT_TIME_PRESETS[2].distanceKm) - 499.00478) <
    0.001,
);
console.log(
  "Passed: 13 missions, 52 sourced discoveries, tasks, legacy migration, v2 roundtrip, content resilience, denied/corrupt storage, repeat-safe 13-card rewards, artwork, optional questions and numerical light-time checks.",
);

const { CHRONOLOGICAL_ARTIFACTS: artifacts, getChronologicalArtifacts, getPlayableMission, getArtifactSimulation } = await loadTs('../src/data/chronologicalArtifacts.ts');
const { createContentsTrajectory } = await loadTs('../src/utils/contentsTrajectory.ts');
assert.equal(new Set(artifacts.map(item => item.id)).size, artifacts.length);
assert.deepEqual(['surveyor', 'curiosity', 'pioneer'].map(id => getChronologicalArtifacts(id).length), [4, 5, 4]);
assert.deepEqual(artifacts.filter(getPlayableMission).map(item => item.playableMissionId).sort(), ['curiosity', 'pioneer', 'surveyor']);
assert.deepEqual(
  [...new Set(artifacts.map(getArtifactSimulation).filter(Boolean).map(target => target.targetId))].sort(),
  ['apollo12', 'camera-lab', 'curiosity', 'dawn', 'ingenuity', 'john-klein', 'kepler', 'near', 'pioneer', 'returned-camera', 'surveyor', 'viking', 'viking2'],
);
for (const item of artifacts) {
  assert.ok(missions.some(m => m.id === item.volumeId));
  for (const field of ['overview', 'purpose', 'operation', 'scientificContribution', 'currentStatus', 'synopsis']) assert.ok(item[field]?.length > 20, `${item.id}: ${field}`);
  assert.ok(item.sources.length, `${item.id}: sources required`);
  for (const source of item.sources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert.match(url.hostname, /(^|\.)nasa\.gov$/);
  }
  if (item.coordinateData) {
    assert.ok(Math.abs(item.coordinateData.latitude) <= 90);
    assert.ok(Math.abs(item.coordinateData.longitude) <= 180);
    assert.ok(['moon', 'mars'].includes(item.coordinateData.body));
  }
  if (item.journey) { assert.equal(item.coordinateData, undefined); assert.equal(item.journey.length, 3); }
}
assert.equal(getPlayableMission({ ...artifacts[0], playableMissionId: 'invented' }), undefined);
assert.equal(getPlayableMission({ ...artifacts[0], playableMissionId: 'pioneer' }), undefined, 'Do not launch another volume by accident');
for (const id of ['surveyor', 'curiosity', 'pioneer']) {
  const list = getChronologicalArtifacts(id);
  assert.deepEqual(list.map(item => item.chronologicalOrder), list.map(item => item.chronologicalOrder).sort((a,b) => a-b));
}
for (const count of [0, 1, 2, 4, 5, 9]) {
  const { nodes, path } = createContentsTrajectory(count);
  assert.equal(nodes.length, count);
  assert.ok(!path.includes('NaN') && !path.includes('Infinity'));
  assert.equal((path.match(/C /g) ?? []).length, Math.max(0, count - 1));
  nodes.forEach((node, i) => {
    assert.ok(Math.abs(node.y / 560 - (i + .5) / count) < 1e-12, 'SVG and HTML row centres align');
    assert.ok(node.x > 0 && node.x < 132);
    if (i) { assert.notEqual(node.x, nodes[i-1].x); assert.ok(node.y > nodes[i-1].y); }
  });
}
const contextSave = { ...v2, readingContexts: { surveyor: { view: 'contents', artifactId: 'surveyor-camera', panel: 'dossier' }, pioneer: { view: 'reading', artifactId: 'kepler', panel: 'contents' } } };
assert.deepEqual(normalizeSave(contextSave, missions), contextSave, 'Additive reading context survives a v2 roundtrip');
assert.deepEqual(normalizeSave(contextSave, missions).readingLocations, v2.readingLocations, 'No reading-page renumbering');
assert.deepEqual(normalizeSave(contextSave, missions).collection, v2.collection, 'Opening dossiers does not award or erase cards');
assert.equal(normalizeSave({ ...v2, readingContexts: { surveyor: { view: 'wrong', artifactId: 'anything', panel: 'dossier' } } }, missions).readingContexts, undefined);
assert.equal(normalizeSave({ ...v2, readingContexts: { surveyor: { view: 'contents', artifactId: '<script>', panel: 'dossier' } } }, missions).readingContexts, undefined);
console.log('Passed: 13 sourced chronological records, 13 simulation targets, chronology, coordinate bounds, 0/1/2/4/5/9-node Bézier geometry, additive reading-context migration and reward preservation.');

const { wrapLongitude, planetCoordinateToVector, shortestAngleDelta, easeAtlasFocus } = await loadTs('../src/utils/planetCoordinates.ts');
const { SOLAR_ATLAS_BODIES: solarBodies, PLANET_TEXTURES } = await loadTs('../src/data/atlas.ts');
assert.ok(Math.abs(wrapLongitude(225.71) + 134.29) < 1e-10);
assert.ok(Math.abs(wrapLongitude(312.05) + 47.95) < 1e-10);
assert.equal(wrapLongitude(540), -180);
assert.equal(wrapLongitude(-540), -180);
const closeTo = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≠ ${expected}`);
planetCoordinateToVector(0, 0).forEach((value, i) => closeTo(value, [1,0,0][i]));
planetCoordinateToVector(0, 90).forEach((value, i) => closeTo(value, [0,0,-1][i]));
planetCoordinateToVector(90, 0).forEach((value, i) => closeTo(value, [0,1,0][i]));
planetCoordinateToVector(-90, 0).forEach((value, i) => closeTo(value, [0,-1,0][i]));
for (const record of artifacts.filter(item => item.coordinateData)) {
  const coordinate = record.coordinateData;
  assert.ok(coordinate.sourceUrl, `${record.id}: source for spatial pin`);
  assert.match(new URL(coordinate.sourceUrl).hostname, /(^|\.)nasa\.gov$/);
  const [x,y,z] = planetCoordinateToVector(coordinate.latitude, coordinate.longitude, 4.7);
  closeTo(Math.hypot(x,y,z), 4.7);
  closeTo(Math.asin(y / 4.7) * 180 / Math.PI, coordinate.latitude);
  closeTo(Math.atan2(-z,x) * 180 / Math.PI, coordinate.longitude);
}
assert.throws(() => planetCoordinateToVector(91, 0), RangeError);
assert.throws(() => planetCoordinateToVector(0, NaN), RangeError);
assert.throws(() => planetCoordinateToVector(0, 0, -1), RangeError);
closeTo(shortestAngleDelta(179 * Math.PI / 180, -179 * Math.PI / 180), 2 * Math.PI / 180);
closeTo(shortestAngleDelta(-179 * Math.PI / 180, 179 * Math.PI / 180), -2 * Math.PI / 180);
assert.equal(easeAtlasFocus(0), 0); assert.equal(easeAtlasFocus(1), 1);
assert.equal(easeAtlasFocus(-1), 0); assert.equal(easeAtlasFocus(2), 1);
for (const record of artifacts.filter(item => item.volumeId === 'pioneer')) {
  assert.equal(record.coordinateData, undefined);
  assert.ok(solarBodies.some(body => body.id === record.spaceFocus));
  assert.match(record.atlasContext, /schematic|illustrative/i);
}
const curiosityPin = artifacts.find(item => item.id === 'curiosity-rover').coordinateData;
assert.equal(curiosityPin.latitude, -4.5895); assert.equal(curiosityPin.longitude, 137.4417);
assert.equal(artifacts.find(item => item.id === 'viking-2').coordinateData.latitude, 47.64, 'Use the planetocentric latitude on the globe');
assert.equal(artifacts.find(item => item.id === 'ingenuity').coordinateData.precision, 'region');
for (const [body, texture] of Object.entries(PLANET_TEXTURES)) {
  assert.ok(readFileSync(new URL('../public' + texture.color, import.meta.url)).length > 10000, `${body}: local surface imagery`);
  if (texture.relief) assert.ok(readFileSync(new URL('../public' + texture.relief, import.meta.url)).length > 10000);
}
const atlasSave = { ...contextSave, readingContexts: { curiosity: { view: 'contents', artifactId: 'curiosity-rover', panel: 'atlas' } } };
assert.deepEqual(normalizeSave(atlasSave, missions), atlasSave, 'Atlas panel is an additive v2 context');
console.log('Passed: sourced globe pins, coordinate/texture orientation, longitude wrapping, pole conversion, shortest-path focus, bounded easing, schematic deep-space targets, local NASA textures and atlas save migration.');
