import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Compass } from "lucide-react";
import { getChronologicalArtifacts } from "../../data/chronologicalArtifacts";
import { getBook } from "../../data/books";
import { ModalFrame } from "../../components/ModalFrame";
import { CurvedContentsTimelinePage } from "./CurvedContentsTimelinePage";
import { ArtifactDossierPage } from "./ArtifactDossierPage";
import type { BookReadingContext, MissionId } from "../../types/expedition";

const InteractivePlanetAtlas = lazy(() => import('./InteractivePlanetAtlas').then(module => ({ default: module.InteractivePlanetAtlas })));

export function OpenedExpeditionJournal({ volumeId, context, onContext, onExplore, onLibrary, suspended = false }: {
  volumeId: MissionId;
  context: BookReadingContext;
  onContext: (context: BookReadingContext) => void;
  onExplore: () => void;
  onLibrary: () => void;
  suspended?: boolean;
}) {
  const artifacts = getChronologicalArtifacts(volumeId);
  const artifact = artifacts.find(item => item.id === context.artifactId) ?? artifacts[0];
  const book = getBook(volumeId);
  const heading = useRef<HTMLHeadingElement>(null);
  const returning = useRef(false);
  const previousPanel = useRef(context.panel);
  const [focusRequest, setFocusRequest] = useState(0);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 800px)').matches);
  const panel = context.panel === 'dossier' ? 'atlas' : context.panel;
  useEffect(() => {
    const media = window.matchMedia('(max-width: 800px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const closingDossier = previousPanel.current === 'dossier';
    previousPanel.current = context.panel;
    if (!mobile) return;
    if (returning.current && panel === 'contents') {
      document.getElementById(`contents-${artifact.id}`)?.focus();
      returning.current = false;
    } else if (panel === 'atlas' && context.panel !== 'dossier' && !closingDossier) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.closest('.planet-atlas-page')?.scrollIntoView({ block: 'start' });
    }
  }, [mobile, panel, artifact.id, context.panel]);
  const select = (artifactId: string) => {
    setFocusRequest(value => value + 1);
    onContext({ view: 'contents', artifactId, panel: 'atlas' });
  };
  const back = () => {
    returning.current = true;
    onContext({ ...context, artifactId: artifact.id, panel: 'contents' });
  };
  const closeDossier = () => onContext({ ...context, artifactId: artifact.id, panel: 'atlas' });

  return <>
    <p className="archive-announcement sr-only" role="status" aria-atomic="true">Selected record: {artifact.title}. Atlas and field summary updated.</p>
    <section className="chronological-spread planetary-journal" data-panel={panel} aria-label="Planetary atlas and chronological mission contents">
      <div className="archive-binding" aria-hidden="true"><i /><i /><i /></div>
      <article className="archive-page planet-atlas-page" aria-labelledby="atlas-page-heading">
        <div className="archive-running"><Compass size={15} aria-hidden="true" /><span>Off-world / Interactive field atlas</span><span>{book.volume}</span></div>
        <button className="archive-mobile-back" onClick={back}><ArrowLeft size={15} aria-hidden="true" />Back to timeline</button>
        <header className="planet-atlas-heading">
          <h2 id="atlas-page-heading" ref={heading} tabIndex={-1}>{volumeId === 'surveyor' ? 'The Moon, a little closer.' : volumeId === 'curiosity' ? 'A world of discoveries.' : 'Beyond the familiar.'}</h2>
          <p>{volumeId === 'pioneer' ? 'Follow the context of a remarkable journey.' : 'Turn the world. Find the place. Follow the evidence.'}</p>
        </header>
        {(!mobile || panel === 'atlas') && <Suspense fallback={<div className="planet-atlas-loading" role="status">Preparing your interactive atlas…</div>}>
          <InteractivePlanetAtlas artifact={artifact} artifacts={artifacts} onSelect={select} suspended={suspended || context.panel === 'dossier'} focusRequest={focusRequest} />
        </Suspense>}
        <section className="atlas-mission-summary" id="selected-mission-summary" aria-labelledby="selected-mission-title">
          <h3 id="selected-mission-title">{artifact.title}</h3>
          <p>{artifact.purpose}</p>
          <div className="atlas-summary-actions">
            <button id="artifact-open-dossier" className="ow-button atlas-dossier-action" onClick={() => onContext({ ...context, artifactId: artifact.id, panel: 'dossier' })}><BookOpen size={15} />Open artifact dossier</button>
            <button id="artifact-launch" className="ow-button archive-launch" onClick={onExplore}>Enter 3D simulation <ArrowRight size={15} /></button>
          </div>
        </section>
        <footer className="archive-page-footer"><span>p. 01 — {volumeId === 'pioneer' ? 'Space atlas' : 'Planetary atlas'}</span><span>History, located.</span></footer>
      </article>
      <CurvedContentsTimelinePage volumeId={volumeId} artifacts={artifacts} selectedId={artifact.id} onSelect={select} onLibrary={onLibrary} controlledId="selected-mission-summary" folio="02" />
    </section>
    {context.panel === 'dossier' && <ModalFrame titleId="artifact-heading" onClose={closeDossier} closeLabel="Close artifact dossier" className={`atlas-dossier-dialog dossier-${volumeId}`}>
      <ArtifactDossierPage artifact={artifact} recordNumber={artifacts.indexOf(artifact) + 1} onBack={closeDossier} focusOnOpen />
    </ModalFrame>}
  </>;
}
