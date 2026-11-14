import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BOOKS, type BookDefinition } from "../../data/books";
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
}: {
  progress: ExpeditionProgress;
  onOpen: (id: MissionId) => void;
  initialSelection?: MissionId;
}) {
  const [selected, setSelected] = useState<MissionId | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const shelf = useRef<HTMLDivElement>(null);
  const positions = useRef<Map<string, DOMRect>>(new Map());
  const reduced = useReducedMotion();
  const choose = (id: MissionId | null) => {
    positions.current = new Map(
      Array.from(
        shelf.current?.querySelectorAll<HTMLElement>(".library-option") ?? [],
      ).map((node) => [node.dataset.book!, node.getBoundingClientRect()]),
    );
    setSelected(id);
  };
  useLayoutEffect(() => {
    if (reduced) return;
    for (const node of shelf.current?.querySelectorAll<HTMLElement>(
      ".library-option",
    ) ?? []) {
      const before = positions.current.get(node.dataset.book!);
      if (!before) continue;
      const after = node.getBoundingClientRect(),
        transform = getComputedStyle(node).transform;
      node.animate(
        [
          {
            transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) ${transform === "none" ? "" : transform}`,
          },
          { transform },
        ],
        { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" },
      );
    }
    positions.current.clear();
  }, [selected, reduced]);

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        choose(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  const handleBackgroundClick = (event: React.MouseEvent) => {
    if (!selected) return;
    const target = event.target as HTMLElement;
    if (
      target.closest(".volume-button") ||
      target.closest(".library-invitation") ||
      target.closest(".library-footer") ||
      target.closest(".backpack-launcher")
    ) {
      return;
    }
    choose(null);
  };

  const book = BOOKS.find((item) => item.id === selected);
  return (
    <main
      className={`ow-shell library ${selected ? "library-selected" : ""}`}
      data-theme={selected ?? "library"}
      onClick={handleBackgroundClick}
    >
      <div className="library-starfield" aria-hidden="true">
        <GlitterWrap
          particleCount={180}
          density={35}
          trailAmount={0}
          color1="#ffffff"
          color2="#ffffff"
          color3="#ffffff"
        />
      </div>
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
          >
            <button
              ref={(node) => {
                buttons.current[index] = node;
              }}
              className="volume-button"
              aria-pressed={selected === item.id}
              aria-label={`Select ${item.volume}`}
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
                buttons.current[next]?.focus();
                choose(BOOKS[next].id);
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
            onClick={() => onOpen(book.id)}
          >
            Open {book.volume}
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
    </main>
  );
}
