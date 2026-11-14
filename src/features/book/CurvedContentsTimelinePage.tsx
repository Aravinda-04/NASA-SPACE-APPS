import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Compass, X } from "lucide-react";
import { getBook } from "../../data/books";
import { getPlayableMission, type ChronologicalArtifact } from "../../data/chronologicalArtifacts";
import { createContentsTrajectory } from "../../utils/contentsTrajectory";
import type { MissionId } from "../../types/expedition";

export function CurvedContentsTimelinePage({ volumeId, artifacts, selectedId, onSelect, onLibrary }: {
  volumeId: MissionId;
  artifacts: ChronologicalArtifact[];
  selectedId: string;
  onSelect: (id: string) => void;
  onLibrary: () => void;
}) {
  const book = getBook(volumeId);
  const { nodes, path } = createContentsTrajectory(artifacts.length);
  const selectedIndex = Math.max(0, artifacts.findIndex((item) => item.id === selectedId));
  const pathRef = useRef<SVGPathElement>(null);
  const [fraction, setFraction] = useState(0);
  // Measure actual Bézier arc lengths: an index fraction is not an arc-length fraction.
  useLayoutEffect(() => {
    const element = pathRef.current;
    const target = nodes[selectedIndex];
    if (!element || !target) return;
    const length = element.getTotalLength();
    if (!length) { setFraction(0); return; }
    let low = 0, high = length;
    for (let step = 0; step < 24; step++) {
      const middle = (low + high) / 2;
      if (element.getPointAtLength(middle).y < target.y) low = middle;
      else high = middle;
    }
    setFraction(selectedIndex === artifacts.length - 1 ? 1 : (low + high) / (2 * length));
  }, [path, selectedIndex, artifacts.length]);

  return <article className="archive-page archive-index" aria-labelledby="contents-heading">
    <div className="archive-running"><Compass size={15} aria-hidden="true" /><span>Astro-archaeology expedition manual</span><span>Archive index</span></div>
    <header className="archive-index-heading">
      <span className="archive-volume">Contents: Volume {['I', 'II', 'III'][Number(book.number) - 1]} — {book.volume}</span>
      <h2 id="contents-heading">A trail of discoveries.</h2>
      <p>A chronological registry of spacecraft, instruments &amp; scientific legacies.</p>
    </header>
    <p className="archive-instruction" id="contents-description">Select a record to open its scientific dossier.<br />Dates refer to the event named in each entry.</p>
    <div className="contents-timeline" style={{ '--record-count': artifacts.length } as CSSProperties}>
      <svg className="contents-trajectory" viewBox="0 0 520 560" preserveAspectRatio="none" aria-hidden="true">
        <path d={path} className="contents-track" />
        <path ref={pathRef} d={path} className="contents-dashes" />
        <path d={path} className="contents-active-path" pathLength="1" strokeDasharray="1 1" strokeDashoffset={1 - fraction} />
        {nodes.map((node, index) => <path key={index} d={`M ${node.x + 22} ${node.y} H 132`} className="contents-leader" />)}
      </svg>
      <ol className="contents-records" aria-describedby="contents-description">
        {artifacts.map((artifact, index) => {
          const selected = artifact.id === selectedId;
          return <li key={artifact.id}>
            <button id={`contents-${artifact.id}`} className={`contents-record ${selected ? 'is-selected' : ''}`}
              aria-pressed={selected} aria-controls="artifact-dossier" onClick={() => onSelect(artifact.id)}
              onKeyDown={(event) => {
                const next = event.key === 'ArrowDown' ? Math.min(index + 1, artifacts.length - 1)
                  : event.key === 'ArrowUp' ? Math.max(index - 1, 0)
                  : event.key === 'Home' ? 0 : event.key === 'End' ? artifacts.length - 1 : null;
                if (next !== null) {
                  event.preventDefault();
                  document.getElementById(`contents-${artifacts[next].id}`)?.focus();
                }
              }}>
              <span className="contents-compass" style={{ '--node-x': `${nodes[index].x / 5.2}%` } as CSSProperties} aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </span>
              <span className="contents-record-copy">
                <span className="contents-record-date">{artifact.dateLabel}<span className="contents-dotted-rule" /><span aria-label={`Record ${index + 1}`}>R{String(index + 1).padStart(2, '0')}</span></span>
                <strong>{artifact.title}<ArrowRight size={15} aria-hidden="true" /></strong>
                <span className="contents-synopsis">{artifact.synopsis}</span>
                {getPlayableMission(artifact) && <span className="contents-playable">3D expedition</span>}
              </span>
            </button>
          </li>;
        })}
      </ol>
    </div>
    <footer className="archive-page-footer"><span>p. 01 — Table of contents<br />{book.volume} / Volume {book.number}</span><button onClick={onLibrary}><X size={13} aria-hidden="true" />Close book</button></footer>
  </article>;
}
