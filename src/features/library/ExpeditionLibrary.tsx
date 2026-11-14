import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BOOKS, type BookDefinition } from "../../data/books";
import type { ExpeditionProgress, MissionId } from "../../types/expedition";
import { useReducedMotion } from "../../hooks/useReducedMotion";

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
      <span className="volume-binding" aria-hidden="true" />
      <span className="volume-foil" aria-hidden="true" />
      <span className="volume-cover-copy">
        <span className="ow-eyebrow">OFF-WORLD / EXPEDITION {book.number}</span>
        <span className="volume-name">{book.volume}</span>
        <span className="volume-spacecraft">{book.spacecraft}</span>
      </span>
      <img
        className="volume-art"
        src={book.cover}
        alt=""
        width="300"
        height="220"
      />
      <span className="volume-foot">
        <span>{book.title}</span>
        <span>AN EXPEDITION JOURNAL</span>
      </span>
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
  const [offsets, setOffsets] = useState<Record<string, number>>({});
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
    const measure = () => setOffsets(Object.fromEntries(
      Array.from(element.querySelectorAll<HTMLElement>('.library-option')).map(node => [
        node.dataset.book!, element.clientWidth / 2 - node.offsetLeft - node.offsetWidth / 2,
      ]),
    ));
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
      <header className="ow-header">
        <Brand />
        <p>Three volumes · One expedition</p>
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
            style={{ '--focus-x': `${offsets[item.id] ?? 0}px` } as CSSProperties}
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
              {selected === item.id && (
                <span className="volume-selected">SELECTED</span>
              )}
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
      </div>
      {book && (
        <section
          className="library-invitation"
          key={book.id}
          aria-live="polite"
        >
          <div>
            <p className="ow-eyebrow">YOUR NEXT EXPEDITION / {book.volume}</p>
            <h2>{book.title}</h2>
            <p>{book.spacecraft} · Real equipment. Lasting discoveries.</p>
          </div>
          <button
            className="ow-button ow-primary"
            disabled={phase === 'focusing' || phase === 'opening'}
            onClick={() => reduced ? onOpen(book.id) : setPhase('opening')}
          >
            {phase === 'opening' ? 'Opening journal…' : `Open ${book.volume}`}
            <ArrowRight size={20} />
          </button>
        </section>
      )}
      <footer className="library-footer">
        <p>Three playable missions · Your progress stays on this device.</p>
        {selected ? (
          <button className="ow-button" onClick={() => choose(null)}>
            <ArrowLeft size={16} /> View all volumes
          </button>
        ) : (
          <p>Choose a book to begin.</p>
        )}
      </footer>
      <p className="sr-only" role="status">{phase === 'focusing' ? `Centring ${book?.volume}.` : phase === 'focused' ? `${book?.volume} is ready to open. Use the arrow keys to choose another volume, or Escape to return to the shelf.` : phase === 'opening' ? 'Opening the expedition atlas. Press Escape to cancel.' : ''}</p>
    </main>
  );
}
