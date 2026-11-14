import { useEffect, useRef } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ExternalLink, FileText } from "lucide-react";
import { getPlayableMission, type ChronologicalArtifact } from "../../data/chronologicalArtifacts";
import { ArtifactAtlasPreview } from "./ArtifactAtlasPreview";

export function ArtifactDossierPage({ artifact, recordNumber, onExplore, onBack, focusOnOpen, launchId = 'artifact-launch' }: {
  artifact: ChronologicalArtifact;
  recordNumber: number;
  onExplore: () => void;
  onBack: () => void;
  focusOnOpen: boolean;
  launchId?: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const notes = useRef<HTMLDivElement>(null);
  useEffect(() => {
    notes.current?.scrollTo(0, 0);
    if (focusOnOpen && window.matchMedia('(max-width: 800px)').matches) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start' });
    }
  }, [artifact.id, focusOnOpen]);
  const fields = [
    ['What is this equipment?', artifact.overview],
    ['Why was it sent here?', artifact.purpose],
    ['How did it work?', artifact.operation],
    ['What did we learn?', artifact.scientificContribution],
    ['What happened to it?', artifact.currentStatus],
  ];
  return <article className="archive-page artifact-dossier" id="artifact-dossier" aria-labelledby="artifact-heading">
    <div className="archive-running"><FileText size={14} aria-hidden="true" /><span>Scientific artifact dossier</span><span>R{String(recordNumber).padStart(2, '0')}</span></div>
    <button className="archive-mobile-back" onClick={onBack}><ArrowLeft size={15} aria-hidden="true" />Back to contents</button>
    <header className="artifact-heading">
      <div className="artifact-provenance">Documented history <span>NASA source record</span></div>
      <h2 ref={heading} id="artifact-heading" tabIndex={-1}>{artifact.title}</h2>
      <p>{artifact.organisation} <span> / </span> {artifact.dateLabel}</p>
      <span className="artifact-classification">{artifact.classification}</span>
    </header>
    <ArtifactAtlasPreview artifact={artifact} />
    <div className="artifact-notes-label"><span>Five scientific field notes</span><span>Scroll to explore <ArrowDown size={11} aria-hidden="true" /></span></div>
    <div className="artifact-field-notes" ref={notes} role="region" aria-label={`${artifact.title}: five scientific field notes`} tabIndex={0}>
      {fields.map(([question, answer], index) => <section key={question}>
        <span className="field-note-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div><h3>{question}</h3><p>{answer}</p></div>
      </section>)}
      <div className="artifact-sources" id="artifact-sources">
        <h3>Follow the evidence</h3>
        {artifact.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.title} (opens in a new tab)`}>
          <span>{source.title}<small>{source.credit}</small></span><ExternalLink size={13} aria-hidden="true" />
        </a>)}
      </div>
    </div>
    <div className="artifact-actions">
      {getPlayableMission(artifact) ? <button id={launchId} className="ow-button archive-launch" onClick={onExplore}>Enter 3D field investigation <ArrowRight size={17} aria-hidden="true" /></button>
        : <button className="ow-button archive-source-action" onClick={() => {
          const firstSource = notes.current?.querySelector<HTMLAnchorElement>('.artifact-sources a');
          firstSource?.focus();
          firstSource?.scrollIntoView({ block: 'nearest' });
        }}>View historical sources <ExternalLink size={15} aria-hidden="true" /></button>}
    </div>
    <footer className="archive-page-footer"><span>p. 02 — Field dossier</span><span>Off-world / Evidence archive</span></footer>
  </article>;
}
