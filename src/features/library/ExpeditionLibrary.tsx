import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BOOKS, type BookDefinition } from "../../data/books";
import { EXPEDITION_MISSIONS } from "../../data/expeditionMissions";
import type { ExpeditionProgress, MissionId } from "../../types/expedition";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import GlitterWrap from "../../components/GlitterWrap";

export function Brand() {
  return (
    <span className="ow-brand">
      Off-world<small>AN EXPEDITION JOURNAL</small>
    </span>
  );
}
export function BookCover({ book }: { book: BookDefinition }) {
  return (
    <span
      className="volume-cover"
      style={{ "--volume-cover": book.theme } as CSSProperties}
    >
      <img
        className="volume-cover-art"
        src={book.cover}
        alt={`Cover of ${book.volume}: ${book.title}`}
        width="723"
        height="1024"
      />
    </span>
  );
}
export function ExpeditionLibrary({
  progress,
  onOpen,
  initialSelection,
  suspended = false,
}: {
  progress: ExpeditionProgress;
  onOpen: (id: MissionId) => void;
  initialSelection?: MissionId;
  suspended?: boolean;
}) {
  const [selected, setSelected] = useState<MissionId | null>(
    initialSelection ?? null,
  );
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const shelf = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'browsing' | 'focusing' | 'focused' | 'opening'>(initialSelection ? 'focused' : 'browsing');
  const [stageLayout, setStageLayout] = useState<{
    offsets: Record<string, number>;
    panelLeft: number;
    panelWidth: number;
  }>({ offsets: {}, panelLeft: 480, panelWidth: 460 });
  const openCallback = useRef(onOpen);
  openCallback.current = onOpen;
  const reduced = useReducedMotion();
  const choose = (id: MissionId | null) => {
    if (id === selected && phase !== 'opening') return;
    setSelected(id);
    setPhase(id ? (reduced ? 'focused' : 'focusing') : 'browsing');
    if (!id && selected) {
      const previous = BOOKS.findIndex(item => item.id === selected);
      requestAnimationFrame(() => buttons.current[previous]?.focus({ preventScroll: true }));
    }
  };
  useLayoutEffect(() => {
    const element = shelf.current;
    if (!element) return;
    const measure = () => {
      const nodes = Array.from(element.querySelectorAll<HTMLElement>('.library-option'));
      const width = element.clientWidth;
      const isWide = width >= 760;
      const sampleBookWidth = nodes[0]?.offsetWidth || 300;
      const gap = 52;
      const panelWidth = Math.min(480, Math.max(320, Math.round(width * 0.45)));
      const stageWidth = sampleBookWidth + gap + panelWidth;
      const stageStart = (width - stageWidth) / 2;
      const offsets = Object.fromEntries(
        nodes.map(node => [
          node.dataset.book!,
          isWide
            ? stageStart + node.offsetWidth / 2 - (node.offsetLeft + node.offsetWidth / 2)
            : width / 2 - node.offsetLeft - node.offsetWidth / 2,
        ]),
      );
      setStageLayout({
        offsets,
        panelLeft: stageStart + sampleBookWidth + gap,
        panelWidth,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (phase !== 'focusing') return;
    const timer = window.setTimeout(() => setPhase('focused'), reduced ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [phase, selected, reduced]);
  useEffect(() => {
    if (phase !== 'opening' || !selected) return;
    if (suspended) { setPhase('focused'); return; }
    const timer = window.setTimeout(() => openCallback.current(selected), reduced ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [phase, selected, reduced, suspended]);
  const book = BOOKS.find((item) => item.id === selected);
  const selectedMission = EXPEDITION_MISSIONS.find((item) => item.id === selected);
  return (
    <main
      className={`ow-shell library cinematic-library ${selected ? "library-selected" : ""}`}
      data-theme={selected ?? "library"}
      data-phase={phase}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && selected && !suspended) { event.preventDefault(); choose(null); }
      }}
    >
      <div className="library-environment" aria-hidden="true"><div className="library-environment-image" /><div className="library-environment-light" /></div>
      <div className="library-starfield" aria-hidden="true">
        <GlitterWrap
          particleCount={180}
          density={35}
          trailAmount={0}
          speed={reduced ? 0 : 4}
          glitterIntensity={reduced ? 0 : 3}
          color1="#ffffff"
          color2="#ffffff"
          color3="#ffffff"
        />
      </div>
      <header className="ow-header">
        <Brand />
      </header>
      <section className="ow-intro">
        <p className="ow-eyebrow">THE EXPEDITION LIBRARY</p>
        <h1>Every object has a story.</h1>
        <p>
          Choose a volume. Follow the evidence left behind, and discover what
          space exploration teaches us.
        </p>
      </section>
      <div
        ref={shelf}
        className="library-books"
        aria-label="Choose an expedition book"
      >
        {BOOKS.map((item, index) => (
          <div
            key={item.id}
            data-book={item.id}
            className={`library-option ${selected === item.id ? "is-selected" : ""}`}
            style={{ '--focus-x': `${stageLayout.offsets[item.id] ?? 0}px` } as CSSProperties}
          >
            <button
              ref={(node) => {
                buttons.current[index] = node;
              }}
              className="volume-button"
              aria-pressed={selected === item.id}
              aria-label={`Select ${item.volume}`}
              tabIndex={selected && selected !== item.id ? -1 : 0}
              disabled={phase === 'opening'}
              onClick={() => choose(item.id)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 2
                      : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
                choose(BOOKS[next].id);
                requestAnimationFrame(() => buttons.current[next]?.focus({ preventScroll: true }));
              }}
            >
              <BookCover book={item} />
            </button>
            <p>
              {item.number} · {item.subtitle}
              {progress[item.id].completed && (
                <span className="library-complete">
                  <Check size={14} /> Expedition complete
                </span>
              )}
            </p>
          </div>
        ))}

        {book && selectedMission && (
          <section
            className="library-invitation library-intro-stage"
            key={book.id}
            aria-live="polite"
            style={
              {
                "--panel-left": `${stageLayout.panelLeft}px`,
                "--panel-width": `${stageLayout.panelWidth}px`,
              } as CSSProperties
            }
          >
            <p className="ow-eyebrow">OPEN A NEW CHAPTER</p>
            <h2>Some journeys leave more than footprints.</h2>
            <p className="library-intro-summary">{selectedMission.introduction}</p>
            <div className="library-intro-actions">
              <button
                className="ow-button ow-primary"
                disabled={phase === 'opening'}
                onClick={() => (reduced ? onOpen(book.id) : setPhase('opening'))}
              >
                {phase === 'opening' ? 'Opening journal…' : 'Begin reading'}
                <ArrowRight size={20} />
              </button>
            </div>
            <p className="ow-muted">
              Historical records guide an imagined future expedition.
            </p>
          </section>
        )}
      </div>
      {selected && (
        <footer className="library-footer">
          <button className="ow-button" onClick={() => choose(null)}>
            <ArrowLeft size={16} /> View all volumes
          </button>
        </footer>
      )}
      <p className="sr-only" role="status">{phase === 'focusing' ? `Centring ${book?.volume}.` : phase === 'focused' ? `${book?.volume} is ready to open. Use the arrow keys to choose another volume, or Escape to return to the shelf.` : phase === 'opening' ? 'Opening the expedition atlas. Press Escape to cancel.' : ''}</p>
    </main>
  );
}
