import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BOOKS, getBook } from "../src/data/books";
import { EXPEDITION_MISSIONS } from "../src/data/expeditionMissions";
import { STORY_MEDIA, EDL_EVENTS } from "../src/data/bookStories";
import { getChronologicalArtifacts } from "../src/data/chronologicalArtifacts";
import type { MissionId } from "../src/types/expedition";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, "fixtures");
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

const baseline: Record<string, any> = {};

const missions: MissionId[] = ["surveyor", "curiosity", "pioneer"];

for (const missionId of missions) {
  const mission = EXPEDITION_MISSIONS.find((m) => m.id === missionId)!;
  const book = getBook(missionId);
  const media = STORY_MEDIA[missionId];
  const artifacts = getChronologicalArtifacts(missionId);

  baseline[missionId] = {
    meta: {
      id: missionId,
      volume: book.volume,
      number: book.number,
      title: book.title,
      name: mission.name,
    },
    spread0: {
      left: {
        runningHeader: ["Off-world / Interactive field atlas", book.volume],
        heading:
          missionId === "surveyor"
            ? "The Moon, a little closer."
            : missionId === "curiosity"
              ? "A world of discoveries."
              : "Beyond the familiar.",
        subtitle:
          missionId === "pioneer"
            ? "Follow the context of a remarkable journey."
            : "Turn the world. Find the place. Follow the evidence.",
        controls: [
          "left",
          "right",
          "up",
          "down",
          "zoom-in",
          "zoom-out",
          "overview",
          "focus",
          "labels",
        ],
        artifacts: artifacts.map((a) => ({
          id: a.id,
          title: a.title,
          purpose: a.purpose,
          actions: ["Open artifact dossier", "Enter 3D simulation"],
        })),
        footer: [
          `p. 01 — ${missionId === "pioneer" ? "Space atlas" : "Planetary atlas"}`,
          "History, located.",
        ],
      },
      right: {
        runningHeader: [
          "Astro-archaeology expedition manual",
          "Archive index",
        ],
        volumeLine: `Contents: Volume ${["I", "II", "III"][Number(book.number) - 1]} — ${book.volume}`,
        heading: "A trail of discoveries.",
        subtitle:
          "A chronological registry of spacecraft, instruments & scientific legacies.",
        instruction:
          "Select a record to locate its scientific story. Dates refer to the event named in each entry.",
        records: artifacts.map((a, i) => ({
          index: i + 1,
          id: a.id,
          dateLabel: a.dateLabel,
          title: a.title,
          synopsis: a.synopsis,
          recordId: `R${String(i + 1).padStart(2, "0")}`,
        })),
        footer: [`p. 02 — Table of contents`, "Close book"],
      },
    },
    spread1: {
      left: {
        eyebrow: mission.name,
        heading: "An object becomes evidence.",
        introduction: mission.introduction,
        question: mission.question,
        facts: [
          { label: "Mission", value: mission.name },
          { label: "Historical status", value: mission.statusLabel },
          { label: "Location", value: mission.coordinatesLabel },
        ],
      },
      right: {
        image: {
          src: media.src,
          alt: media.alt,
          caption: media.caption,
          source: media.source,
        },
        heading: "Look a little closer.",
        discoveries: mission.discoveries.map((d) => d.title),
        sources: mission.sources.map((s) => ({
          title: s.title,
          url: s.url,
          credit: s.credit,
        })),
        sceneNote: mission.sceneNote,
      },
    },
    spread2:
      missionId === "curiosity"
        ? {
            type: "edl",
            left: {
              eyebrow: "6 AUGUST 2012 · EVENT TIME AT MARS",
              heading: "Seven minutes of terror",
              intro:
                "Landing was a sequence of different engineering jobs. Follow what each piece of equipment did, and why it was left behind.",
              events: EDL_EVENTS.map((e, i) => `${String(i + 1).padStart(2, "0")} · ${e.title}`),
              scrubberLabel: "Mission timeline",
            },
            rightSteps: EDL_EVENTS.map((e, i) => ({
              stepIndex: i,
              stepCounter: `${i + 1} / ${EDL_EVENTS.length}`,
              time: e.time,
              title: e.title,
              equipment: e.equipment,
              purpose: e.purpose,
              fate: e.fate,
              touchdownCaption:
                "Earth received touchdown at 05:31:45.4 UTC, about 13m48s later. Event occurrence and Earth reception are different times.",
              jplLink:
                "https://www.jpl.nasa.gov/news/timeline-of-major-mission-events-during-curiositys-landing/",
            })),
          }
        : missionId === "pioneer"
          ? {
              type: "light-time",
              left: {
                eyebrow: "PIONEER 10 · 23 JANUARY 2003",
                heading: "The 11-hour message",
                intro:
                  "NASA received Pioneer 10’s last faint signal with no telemetry. At about 12.23 billion km away, its signal needed about 11 hours 20 minutes to reach Earth.",
                note: "Controllers plan ahead. They cannot use a live steering wheel across this distance.",
                nasaLink: "https://science.nasa.gov/mission/pioneer-10/",
              },
              right: {
                diagramLabel: "DIAGRAM / DISTANCE AND OBJECT SIZES NOT TO SCALE",
                readouts: ["ONE-WAY LIGHT TIME", "HYPOTHETICAL ROUND TRIP"],
                controls: ["Play signal", "Reset", "One way", "Hypothetical round trip"],
                warning:
                  "This demonstrates propagation, not an actual successful two-way contact in 2003. Processing delay, moving endpoints and hardware availability are excluded. The final faint signal contained no telemetry.",
              },
            }
          : {
              type: "surveyor-camera",
              left: {
                eyebrow: "SURVEYOR 3 / APOLLO 12",
                heading: "The camera that became evidence",
                intro:
                  "After about 2½ years on the Moon, the television camera returned to Earth. Engineers examined its optics, electronics, mechanisms, materials and coatings.",
                tabs: ["Historical photo", "Laboratory tests", "Illustration"],
                question:
                  "Which record would help you evaluate a material’s performance: a landing photograph, or tests of the returned hardware?",
                nasaReportLink: "https://ntrs.nasa.gov/citations/19710024418",
              },
              right: {
                pipelineHeading: "Equipment → purpose → fate → knowledge",
                pipelineText:
                  "Camera → observe the Moon → returned by Apollo 12 → test how materials and instruments endured lunar exposure.",
                caption:
                  "The report describes specific observations. It does not establish that all equipment survives every lunar condition.",
              },
            },
    spread3: {
      left: {
        eyebrow: mission.name,
        heading: "Your expedition starts here.",
        arrival: mission.arrival,
        question: mission.question,
        facts: [
          { label: "Mission", value: mission.name },
          { label: "Historical status", value: mission.statusLabel },
          { label: "Location", value: mission.coordinatesLabel },
        ],
      },
      right: {
        schematic: book.schematic,
        caption: "Original schematic reconstruction · not a photograph.",
        heading: "Look a little closer.",
        discoveries: mission.discoveries.map((d) => d.title),
        sources: mission.sources.map((s) => ({
          title: s.title,
          url: s.url,
          credit: s.credit,
        })),
        sceneNote: mission.sceneNote,
      },
    },
  };
}

const outputPath = path.join(fixturesDir, "content-baseline.json");
fs.writeFileSync(outputPath, JSON.stringify(baseline, null, 2), "utf-8");
console.log(`Content baseline successfully saved to ${outputPath}`);
