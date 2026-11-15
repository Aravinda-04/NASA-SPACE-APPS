import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { getBook } from "../../data/books";
import { Brand } from "../library/ExpeditionLibrary";
import { STORY_MEDIA } from "../../data/bookStories";
import { BookInvestigation } from "../science/BookInvestigation";
import { OpenedExpeditionJournal } from "./OpenedExpeditionJournal";
import { getChronologicalArtifacts } from "../../data/chronologicalArtifacts";
import "./book.css";
import type {
  BookReadingContext,
  ExpeditionMission,
  MissionProgress,
} from "../../types/expedition";

export function BookReader({
  mission,
  progress,
  page,
  onPage,
  onExplore,
  onLibrary,
  context: savedContext,
  onContext,
  restoreMissionFocus = false,
  suspended = false,
}: {
  mission: ExpeditionMission;
  progress: MissionProgress;
  page: number;
  onPage: (page: number) => void;
  onExplore: (targetId?: string) => void;
  onLibrary: () => void;
  context?: BookReadingContext;
  onContext: (context: BookReadingContext) => void;
  restoreMissionFocus?: boolean;
  suspended?: boolean;
}) {
  const book = getBook(mission.id);
  const media = STORY_MEDIA[book.id];
  const heading = useRef<HTMLHeadingElement>(null);
  const context = savedContext ?? { view: 'contents', artifactId: getChronologicalArtifacts(mission.id)[0].id, panel: 'contents' };
  const isContents = context.view === 'contents';
  const explore = (targetId?: string) => {
    if (isContents) onContext({ ...context, panel: 'atlas' });
    onExplore(targetId);
  };
  const goPage = (next: number) => {
    onContext({ ...context, view: 'reading' });
    onPage(next);
  };
  const goTimeline = () => onContext({ ...context, view: 'contents', panel: 'contents' });
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest("main")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [page, isContents]);
  useEffect(() => {
    if (restoreMissionFocus) {
      const target = document.getElementById('artifact-launch') ?? document.getElementById('artifact-open-dossier') ?? document.querySelector<HTMLElement>('.reader-pagination .ow-primary');
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'nearest' });
    }
  }, []);
  // Lock html and body to 100dvh with zero scrolling
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origHtmlHeight = document.documentElement.style.height;
    const origBodyOverflow = document.body.style.overflow;
    const origBodyHeight = document.body.style.height;

    document.documentElement.style.height = "100dvh";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    document.body.style.overflow = "hidden";

    if (
      window.location.search.includes("audit_debug=true") ||
      (window as any).__AUDIT_DEBUG__
    ) {
      document.body.setAttribute("data-audit-debug", "true");
    }

    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.documentElement.style.height = origHtmlHeight;
      document.body.style.overflow = origBodyOverflow;
      document.body.style.height = origBodyHeight;
    };
  }, []);

  // Fixed logical spread dimensions and stage scaling
  const stageRef = useRef<HTMLDivElement>(null);
  const [bookScale, setBookScale] = useState(1);
  const LOGICAL_WIDTH = 1240;
  const LOGICAL_HEIGHT = 660;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateScale = () => {
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      if (stageWidth === 0 || stageHeight === 0) return;

      const scaleX = stageWidth / LOGICAL_WIDTH;
      const scaleY = stageHeight / LOGICAL_HEIGHT;
      const newScale = Math.min(scaleX, scaleY);
      setBookScale(newScale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const scalerRef = useRef<HTMLDivElement>(null);

  const fitContent = useCallback(() => {
    const scaler = scalerRef.current;
    if (!scaler) return;

    const pages = scaler.querySelectorAll<HTMLElement>(
      ".reader-page, .archive-page, .science-copy, .science-interaction"
    );

    pages.forEach((pageEl) => {
      // Clean up any residual transform
      pageEl.style.removeProperty("transform");
      pageEl.style.removeProperty("transform-origin");
    });
  }, []);

  useLayoutEffect(() => {
    fitContent();
  }, [page, isContents, bookScale, fitContent]);

  useEffect(() => {
    const handleToggle = () => {
      requestAnimationFrame(fitContent);
    };

    window.addEventListener("resize", fitContent);
    document.addEventListener("toggle", handleToggle, true);

    return () => {
      window.removeEventListener("resize", fitContent);
      document.removeEventListener("toggle", handleToggle, true);
    };
  }, [fitContent]);
  const labels = [
    "",
    "Mission story",
    "Scientific investigation",
    "Field briefing",
  ];
  const activePage = Math.max(1, page);
  return (
    <main
      className={`ow-shell reader ${isContents ? 'reader-with-contents' : ''}`}
      data-theme={mission.id}
      onKeyDown={(event) => {
        if (
          (event.target as HTMLElement).closest(
            "input,select,textarea,summary",
          ) ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        if (isContents || event.defaultPrevented || (event.target as HTMLElement).closest('button,a,.artifact-field-notes,[role="slider"]') || (event.target as HTMLElement).isContentEditable) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          if (activePage <= 1) goTimeline();
          else goPage(activePage - 1);
        }
        if (event.key === "ArrowRight" && activePage < 3) {
          event.preventDefault();
          goPage(activePage + 1);
        }
      }}
    >
      <header className="ow-header">
        <Brand />
        <p>
          {book.volume} / {isContents ? 'Chronological contents' : labels[activePage]}
        </p>
        {isContents ? (
          <button className="ow-button" onClick={onLibrary}>
            <ArrowLeft size={16} /> Expedition Library
          </button>
        ) : activePage === 3 && (
          <button className="ow-button" onClick={goTimeline}>
            <ArrowLeft size={16} /> Back to timeline
          </button>
        )}
      </header>
      <section className={`ow-intro ${isContents ? 'reader-contents-intro' : ''}`}>
        <p className="ow-eyebrow">
          {book.number} / {book.volume} · {isContents ? 'EXPEDITION ARCHIVE' : 'FIELD NOTES'}
        </p>
        <h1 ref={heading} tabIndex={-1}>
          {isContents ? `${book.volume} / The archive opens here.` : book.title}
        </h1>
      </section>
      <div className="reader-book-stage" ref={stageRef}>
        <div ref={scalerRef} className="reader-book-scaler" style={{
          "--book-scale": bookScale,
          "--logical-w": `${LOGICAL_WIDTH}px`,
          "--logical-h": `${LOGICAL_HEIGHT}px`,
        } as React.CSSProperties}>
      {isContents ? <OpenedExpeditionJournal volumeId={mission.id} context={context} onContext={onContext} onExplore={explore} onLibrary={onLibrary} suspended={suspended} /> : activePage === 2 ? (
        <BookInvestigation key={mission.id} missionId={mission.id} suspended={suspended} />
      ) : (
        <section className="reader-spread" key={activePage}>
          <article className="reader-page">
            <p className="ow-eyebrow">{mission.name}</p>
            <h2>
              {activePage === 1
                ? "An object becomes evidence."
                : "Your expedition starts here."}
            </h2>
            <p>
              {activePage === 1
                ? mission.introduction
                : mission.arrival}
            </p>
            <blockquote>
              <span className="ow-eyebrow">YOUR INVESTIGATION</span>
              <p>{mission.question}</p>
            </blockquote>
            <dl className="reader-facts">
              <div>
                <dt>Mission</dt>
                <dd>{mission.name}</dd>
              </div>
              <div>
                <dt>Historical status</dt>
                <dd>{mission.statusLabel}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{mission.coordinatesLabel}</dd>
              </div>
            </dl>
          </article>
          <article className="reader-page">
            {activePage === 1 ? (
              <figure>
                <img className="reader-photo" src={media.src} alt={media.alt} />
                <figcaption className="ow-caption">
                  {media.caption}{" "}
                  <a href={media.source} target="_blank" rel="noreferrer">
                    View original ↗
                  </a>
                </figcaption>
              </figure>
            ) : (
              <>
                <div className="reader-art">
                  <img
                    src={book.schematic}
                    width="300"
                    height="220"
                    alt={`Schematic illustration of ${mission.name}; not to scale`}
                  />
                </div>
                <p className="ow-caption">
                  Original schematic reconstruction · not a photograph.
                </p>
              </>
            )}
            <h3>Look a little closer.</h3>
            <ul className="reader-records">
              {mission.discoveries.map((item) => (
                <li key={item.id}>
                  {progress.discovered.includes(item.id) ? (
                    <Check size={16} />
                  ) : (
                    <span aria-hidden="true">○</span>
                  )}
                  {item.title}
                </li>
              ))}
            </ul>
            <details className="reader-sources">
              <summary>
                Historical sources · {mission.sources.length} records
              </summary>
              <div className="reader-sources-list">
              {mission.sources.map((source) => (
                <p key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title} <ExternalLink size={12} />
                  </a>
                  <small>{source.credit}</small>
                </p>
              ))}
              </div>
            </details>
            <p className="ow-caption">{mission.sceneNote}</p>
          </article>
        </section>
      )}
        </div>
      </div>
      <nav className="reader-pagination" aria-label={`${book.volume} pages`}>
        <button
          className="ow-button"
          disabled={isContents}
          onClick={() => activePage <= 1 ? goTimeline() : goPage(activePage - 1)}
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        <span>
          {isContents ? 'Atlas / Chronological contents' : `${activePage} / 3 · ${labels[activePage]}`}
        </span>
        {(isContents || activePage < 3) && (
          <button
            className="ow-button ow-primary"
            onClick={isContents ? () => goPage(page >= 1 ? page : 1) : () => goPage(activePage + 1)}
          >
            {isContents ? 'Continue reading' : "Next page"}
            <ArrowRight size={16} />
          </button>
        )}
      </nav>
    </main>
  );
}
