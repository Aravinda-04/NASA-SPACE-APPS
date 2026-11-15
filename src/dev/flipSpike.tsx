import { useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { BookReader } from "../features/book/BookReader";
import { EXPEDITION_MISSIONS } from "../data/expeditionMissions";
import { getChronologicalArtifacts } from "../data/chronologicalArtifacts";
import { mountHTMLSpike } from "./htmlPageAdapter";
import type { BookReadingContext, MissionId, MissionProgress } from "../types/expedition";
import "../styles/global.css";
import "../styles/offworld.css";
import "./flipSpike.css";

const params = new URLSearchParams(location.search);
const missionId: MissionId = params.get("mission") === "curiosity" ? "curiosity" : params.get("mission") === "surveyor" ? "surveyor" : "pioneer";
const mission = EXPEDITION_MISSIONS.find(item => item.id === missionId)!;
const firstArtifact = getChronologicalArtifacts(missionId)[0].id;
const progress: MissionProgress = { discovered: [], completed: false };
const fixture = params.get("fixture") ?? "map-event";
const spreads = fixture === "all" ? [0, 1, 2, 3] : fixture === "sources-event" ? [1, 2] : [0, 2];
const isBaseline = params.get("baseline") === "true";
const start = Math.max(0, Math.min(spreads.length - 1, Number(params.get("start")) || 0)) * 2;
const phase = params.has("frame") ? Number(params.get("frame")) : null;
if (phase !== null && ![0, 25, 50, 75, 100].includes(phase)) throw new Error("Capture frame must be 0, 25, 50, 75 or 100.");

function App() {
  const root = useRef<HTMLDivElement>(null);
  const sourceRoot = useRef<HTMLDivElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [landed, setLanded] = useState(start);
  const [turnState, setTurnState] = useState("read");
  const [context, setContext] = useState<BookReadingContext>({ view: "contents", artifactId: firstArtifact, panel: "contents" });
  const reader = (spread: number, source = false) => <BookReader
    key={spread}
    mission={mission}
    progress={progress}
    page={Math.max(1, spread)}
    context={spread === 0 ? context : { ...context, view: "reading" }}
    onContext={next => {
      // Preserve actual atlas/contents selection and dossier behavior. Page
      // navigation belongs to the isolated adapter until production integration.
      if (spread === 0 && next.view === "contents") setContext(next);
    }}
    onPage={() => {}}
    onExplore={() => { location.href = "/"; }}
    onLibrary={() => { location.href = "/"; }}
    suspended={source ? spreads[landed / 2] !== spread : spread === 0 && landed !== 0 && turnState === "read"}
  />;

  useLayoutEffect(() => {
    if (isBaseline) return;
    // The original Stage 3 reader remains responsible for all viewport fitting
    // and the one whole-book transform. The engine lives in its existing box.
    const scaler = root.current!.querySelector<HTMLElement>(".reader-book-scaler")!;
    setPortalTarget(scaler);
  }, []);

  useLayoutEffect(() => {
    if (!portalTarget || !sourceRoot.current) return;
    const scaler = portalTarget;
    const primary = scaler.querySelector<HTMLElement>(":scope > .chronological-spread,:scope > .reader-spread,:scope > .light-time")!;
    const rest = [...sourceRoot.current.querySelectorAll<HTMLElement>(".reader-book-scaler")].map(node =>
      node.querySelector<HTMLElement>(":scope > .chronological-spread,:scope > .reader-spread,:scope > .light-time")!);
    const nodes = [primary, ...rest];
    const adapter = mountHTMLSpike({
      scaler, sources: spreads.map((spread, index) => ({ spread, element: nodes[index] })),
      start, frame: phase, benchmark: Math.min(100, Math.max(0, Number(params.get("benchmark")) || 0)),
      onLand: setLanded, onState: setTurnState,
    });
    return () => adapter.dispose();
  }, [portalTarget]);

  return <div className="spike-root" ref={root}>
    {reader(isBaseline ? spreads[start / 2] : spreads[0])}
    {portalTarget && createPortal(<div className="spike-staging" ref={sourceRoot}>
      {spreads.slice(1).map(spread => reader(spread, true))}
    </div>, portalTarget)}
  </div>;
}

// Production keeps its original StrictMode. This separate entry exercises one
// adapter lifetime; repeated teardown must be audited explicitly before shipping.
createRoot(document.getElementById("root")!).render(<App />);
