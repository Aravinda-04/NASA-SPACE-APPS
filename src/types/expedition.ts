export type BookId = "surveyor" | "curiosity" | "pioneer";
export type MissionId =
  | BookId
  | "viking"
  | "viking2"
  | "john-klein"
  | "apollo12"
  | "returned-camera"
  | "ingenuity"
  | "near"
  | "dawn"
  | "kepler";
export type EvidenceKind =
  | "Historical record"
  | "Reconstruction"
  | "Fictional expedition";

export interface MissionSource {
  id: string;
  title: string;
  url: string;
  credit: string;
}

export interface Discovery {
  id: string;
  title: string;
  component: string;
  position: [number, number, number];
  cameraPosition?: [number, number, number];
  summary: string;
  story: string;
  science: string;
  engineering: string;
  status: string;
  evidence: EvidenceKind;
  sourceIds: string[];
}

export interface LearningTask {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExpeditionMission {
  id: MissionId;
  chapter: number;
  destination: string;
  name: string;
  title: string;
  subtitle: string;
  question: string;
  introduction: string;
  arrival: string;
  legacy: string;
  dateLabel: string;
  statusLabel: string;
  accent: string;
  coordinatesLabel: string;
  sceneNote: string;
  discoveries: Discovery[];
  task: LearningTask;
  sources: MissionSource[];
}

export interface MissionProgress {
  discovered: string[];
  completed: boolean;
}

export type ExpeditionProgress = Record<MissionId, MissionProgress>;

export type CardId =
  | "surveyor-camera"
  | "curiosity-skycrane"
  | "pioneer-messenger"
  | "viking-laboratory"
  | "viking2-frost-station"
  | "john-klein-rock-archive"
  | "apollo12-precision-landing"
  | "returned-camera-lab"
  | "ingenuity-first-flight"
  | "near-asteroid-lander"
  | "dawn-two-worlds"
  | "kepler-transit-hunter";
export interface CollectionMetadata {
  earnedAt: string | null;
  firstViewedAt: string | null;
  origin: "mission-completion" | "legacy-completion";
}
export interface OptionalAttempt {
  answer: number | null;
  attempts: number;
  correct: boolean;
}
/** Additive to the v2 save; readingLocations keeps its original 0–3 meaning. */
export interface BookReadingContext {
  view: "contents" | "reading";
  artifactId: string;
  panel: "contents" | "atlas" | "dossier";
}
export interface SavedExpedition {
  version: 2;
  progress: ExpeditionProgress;
  lastMissionId?: MissionId;
  readingLocations: Record<BookId, number>;
  readingContexts?: Partial<Record<BookId, BookReadingContext>>;
  collection: Partial<Record<CardId, CollectionMetadata>>;
  optionalAttempts: Partial<Record<MissionId, OptionalAttempt>>;
}

export interface MissionWorldProps {
  mission: ExpeditionMission;
  selectedId: string | null;
  discoveredIds: string[];
  onSelect: (id: string) => void;
}
