import { useEffect, useRef } from "react";
import { getChronologicalArtifacts } from "../../data/chronologicalArtifacts";
import { CurvedContentsTimelinePage } from "./CurvedContentsTimelinePage";
import { ArtifactDossierPage } from "./ArtifactDossierPage";
import type { BookReadingContext, MissionId } from "../../types/expedition";

export function ChronologicalContentsSpread({ volumeId, context, onContext, onExplore, onLibrary }: {
  volumeId: MissionId;
  context: BookReadingContext;
  onContext: (context: BookReadingContext) => void;
  onExplore: () => void;
  onLibrary: () => void;
}) {
  const artifacts = getChronologicalArtifacts(volumeId);
  // Revalidate against the current dataset when restoring a saved/retired record.
  const artifact = artifacts.find((item) => item.id === context.artifactId) ?? artifacts[0];
  const index = artifacts.indexOf(artifact);
  const returningToContents = useRef(false);
  useEffect(() => {
    if (returningToContents.current && context.panel === 'contents') {
      document.getElementById(`contents-${artifact.id}`)?.focus();
      returningToContents.current = false;
    }
  }, [context.panel, artifact.id]);
  return <>
    <p className="archive-announcement sr-only" role="status" aria-atomic="true">Selected record: {artifact.title}. Scientific dossier ready.</p>
    <section className="chronological-spread" data-panel={context.panel} aria-label="Chronological contents and scientific dossier">
      <div className="archive-binding" aria-hidden="true"><i /><i /><i /></div>
      <CurvedContentsTimelinePage volumeId={volumeId} artifacts={artifacts} selectedId={artifact.id} onLibrary={onLibrary}
        onSelect={(artifactId) => onContext({ view: 'contents', artifactId, panel: 'dossier' })} />
      <ArtifactDossierPage artifact={artifact} recordNumber={index + 1} onExplore={onExplore}
        focusOnOpen={context.panel === 'dossier'} onBack={() => {
          returningToContents.current = true;
          onContext({ ...context, artifactId: artifact.id, panel: 'contents' });
        }} />
    </section>
  </>;
}
