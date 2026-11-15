// @ts-nocheck
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "../../styles/carousel.css";

export type CarouselBookId = "moon" | "mars" | "outer-space";

export interface BookStateItem {
  coverImageUrl?: string;
  completed?: boolean;
}

export interface BookCarouselProps {
  onOpenBook?: (bookId: CarouselBookId) => void;
  bookState?: Partial<Record<CarouselBookId, BookStateItem>>;
  initialBookId?: CarouselBookId;
  onSelectionChange?: (bookId: CarouselBookId) => void;
}

/* ==========================================================================
   SVG ARTWORK PRESENTATION ATTRIBUTES & VECTOR SCHEMATICS (FALLBACK LINE ART)
   ========================================================================== */
const SVG_ART_PROPS: React.SVGProps<SVGSVGElement> = {
  className: "holo-art",
  viewBox: "0 0 240 160",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

// Schematic 01: Surveyor 3 camera & Apollo 12 lunar lander
export function SurveyorArtwork() {
  return (
    <svg {...SVG_ART_PROPS}>
      <circle cx="120" cy="82" r="68" opacity="0.28" />
      <path d="M0 130 Q120 110 240 130" />
      <rect x="72" y="90" width="26" height="14" />
      <path d="M85 90 V58 M70 56 L98 50 L104 60 L76 66 Z" />
      <path d="M78 104 L56 128 M92 104 L114 128 M85 104 V128" />
      <ellipse cx="56" cy="129" rx="7" ry="2" />
      <ellipse cx="114" cy="129" rx="7" ry="2" />
      <ellipse cx="85" cy="130" rx="7" ry="2" />
      <path d="M150 114 V104 L158 96 H182 L190 104 V114 Z" />
      <rect x="158" y="76" width="24" height="20" rx="4" />
      <path d="M170 76 V64 M150 114 L138 130 M190 114 L202 130" />
      <path d="M132 130 H144 M196 130 H208" />
    </svg>
  );
}

// Schematic 02: Curiosity rover & sky crane
export function CuriosityArtwork() {
  return (
    <svg {...SVG_ART_PROPS}>
      <path
        d="M0 136 H240 M0 128 Q40 118 80 128 T160 126 T240 128"
        opacity="0.6"
      />
      <path d="M150 26 Q175 4 200 26 Q187 32 175 26 Q162 32 150 26" />
      <path d="M150 26 L175 52 M175 26 V52 M200 26 L175 52" />
      <path d="M165 52 H185 L180 60 H170 Z" />
      <path
        d="M175 60 Q150 70 118 74"
        strokeDasharray="3 4"
        opacity="0.7"
      />
      <rect x="84" y="92" width="60" height="18" rx="3" />
      <path d="M132 92 V72 M126 64 H140 V72 H126 Z M84 100 L66 110 L60 120" />
      <g>
        <circle cx="90" cy="124" r="9" />
        <circle cx="116" cy="124" r="9" />
        <circle cx="142" cy="124" r="9" />
      </g>
      <g opacity="0.45">
        <circle cx="98" cy="119" r="8" />
        <circle cx="124" cy="119" r="8" />
        <circle cx="150" cy="119" r="8" />
      </g>
      <path d="M90 124 L116 110 L142 124" opacity="0.8" />
    </svg>
  );
}

// Schematic 03: Pioneer 10 deep-space trajectory
export function PioneerArtwork() {
  return (
    <svg {...SVG_ART_PROPS}>
      <circle cx="120" cy="80" r="70" opacity="0.2" />
      <ellipse
        cx="112"
        cy="76"
        rx="26"
        ry="40"
        transform="rotate(-24 112 76)"
      />
      <path d="M112 76 L146 48 M140 44 L152 52" />
      <path d="M112 76 L196 112 M170 100 L180 90 M184 106 L194 96" />
      <path d="M112 76 L48 42 M52 36 L60 48" />
      <circle cx="34" cy="130" r="11" />
      <path
        d="M45 128 Q120 148 176 118 T230 40"
        strokeDasharray="3 4"
      />
      <circle cx="176" cy="122" r="7" opacity="0.8" />
      <path d="M222 48 L230 40 L231 51" />
    </svg>
  );
}

/* ==========================================================================
   EXPEDITION BOOK DATA & 3D ORBIT MATHEMATICS
   ========================================================================== */
export const CAROUSEL_BOOKS = [
  {
    id: "moon" as CarouselBookId,
    label: "VOL I: MOON",
    header: "OFF-WORLD / EXPEDITION 01",
    title: "Moon",
    subtitle: "Surveyor 3 / Apollo 12",
    footer: "THE CAMERA THAT CAME BACK",
    caption: "01 · Returned equipment",
    Art: SurveyorArtwork,
  },
  {
    id: "mars" as CarouselBookId,
    label: "VOL II: MARS",
    header: "OFF-WORLD / EXPEDITION 02",
    title: "Mars",
    subtitle: "Curiosity",
    footer: "THE JOURNEY TO THE SURFACE",
    caption: "02 · A landing in stages",
    Art: CuriosityArtwork,
  },
  {
    id: "outer-space" as CarouselBookId,
    label: "VOL III: OUTER SPACE",
    header: "OFF-WORLD / EXPEDITION 03",
    title: "Outer Space",
    subtitle: "Pioneer 10",
    footer: "A MESSAGE FROM HUMANITY",
    caption: "03 · A signal through space",
    Art: PioneerArtwork,
  },
];

const BOOK_COUNT = CAROUSEL_BOOKS.length;
const DEGREES_PER_SLOT = 360 / BOOK_COUNT;

const normalizeIndex = (index: number, count: number) =>
  ((index % count) + count) % count;

const shortestDelta = (from: number, to: number, count: number) => {
  const half = Math.floor(count / 2);
  return normalizeIndex(to - from + half, count) - half;
};

/* ==========================================================================
   BOOK COVER FACE COMPONENT
   ========================================================================== */
function BookCoverFace({
  book,
  coverImageUrl,
}: {
  book: (typeof CAROUSEL_BOOKS)[0];
  coverImageUrl?: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="holo-face" aria-hidden="true">
      {coverImageUrl && !hasError ? (
        <img
          className="holo-face__image"
          src={coverImageUrl}
          alt=""
          draggable={false}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="holo-face__cover">
          <p className="holo-face__header">{book.header}</p>
          <h3 className="holo-face__title">{book.title}</h3>
          <p className="holo-face__subtitle">{book.subtitle}</p>
          <div className="holo-face__art">
            <book.Art />
          </div>
          <p className="holo-face__footer">{book.footer}</p>
          <p className="holo-face__series">AN EXPEDITION JOURNAL</p>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   NAVIGATION ARROW COMPONENT (V2 CHEVRON)
   ========================================================================== */
const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <polyline
      points={
        direction === "left" ? "15 5 8 12 15 19" : "9 5 16 12 9 19"
      }
    />
  </svg>
);

/* ==========================================================================
   LED BANNER DOT-MATRIX ENGINE & ASSETS
   ========================================================================== */
const LED_FONT={"A":[".###.","#...#","#...#","#####","#...#","#...#","#...#"],"B":["####.","#...#","#...#","####.","#...#","#...#","####."],"C":[".###.","#...#","#....","#....","#....","#...#",".###."],"D":["####.","#...#","#...#","#...#","#...#","#...#","####."],"E":["#####","#....","#....","####.","#....","#....","#####"],"F":["#####","#....","#....","####.","#....","#....","#...."],"G":[".###.","#...#","#....","#.###","#...#","#...#",".###."],"H":["#...#","#...#","#...#","#####","#...#","#...#","#...#"],"I":[".###.","..#..","..#..","..#..","..#..","..#..",".###."],"J":["..###","...#.","...#.","...#.","...#.","#..#.",".##.."],"K":["#...#","#..#.","#.#..","##...","#.#..","#..#.","#...#"],"L":["#....","#....","#....","#....","#....","#....","#####"],"M":["#...#","##.##","#.#.#","#.#.#","#...#","#...#","#...#"],"N":["#...#","##..#","#.#.#","#..##","#...#","#...#","#...#"],"O":[".###.","#...#","#...#","#...#","#...#","#...#",".###."],"P":["####.","#...#","#...#","####.","#....","#....","#...."],"Q":[".###.","#...#","#...#","#...#","#.#.#","#..#.",".##.#"],"R":["####.","#...#","#...#","####.","#.#..","#..#.","#...#"],"S":[".####","#....","#....",".###.","....#","....#","####."],"T":["#####","..#..","..#..","..#..","..#..","..#..","..#.."],"U":["#...#","#...#","#...#","#...#","#...#","#...#",".###."],"V":["#...#","#...#","#...#","#...#","#...#",".#.#.","..#.."],"W":["#...#","#...#","#...#","#.#.#","#.#.#","##.##","#...#"],"X":["#...#","#...#",".#.#.","..#..",".#.#.","#...#","#...#"],"Y":["#...#","#...#",".#.#.","..#..","..#..","..#..","..#.."],"Z":["#####","....#","...#.","..#..",".#...","#....","#####"],"0":[".###.","#...#","#..##","#.#.#","##..#","#...#",".###."],"1":["..#..",".##..","..#..","..#..","..#..","..#..",".###."],"2":[".###.","#...#","....#","...#.","..#..",".#...","#####"],"3":["#####","...#.","..#..","...#.","....#","#...#",".###."],"4":["...#.","..##.",".#.#.","#..#.","#####","...#.","...#."],"5":["#####","#....","####.","....#","....#","#...#",".###."],"6":["..##.",".#...","#....","####.","#...#","#...#",".###."],"7":["#####","....#","...#.","..#..",".#...",".#...",".#..."],"8":[".###.","#...#","#...#",".###.","#...#","#...#",".###."],"9":[".###.","#...#","#...#",".####","....#","...#.",".##.."]," ":["...","...","...","...","...","...","..."],":":[".",".","#",".","#",".","."],"-":[".....",".....",".....","#####",".....",".....","....."],".":[".",".",".",".",".",".","#"]};

/* ==========================================================================
   MAIN CAROUSEL COMPONENT (BookCarousel)
   ========================================================================== */
export function BookCarousel({
  onOpenBook,
  bookState,
  initialBookId = "moon",
  onSelectionChange,
}: BookCarouselProps) {
  const [rotationIndex, setRotationIndex] = useState(() =>
    Math.max(
      0,
      CAROUSEL_BOOKS.findIndex((b) => b.id === initialBookId),
    ),
  );

  const activeIndex = normalizeIndex(rotationIndex, BOOK_COUNT);
  const activeBook = CAROUSEL_BOOKS[activeIndex];

  const bookRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shouldFocusActive = useRef(false);

  const books = useMemo(
    () =>
      CAROUSEL_BOOKS.map((b) => ({
        ...b,
        completed: bookState?.[b.id]?.completed ?? false,
        coverImageUrl: bookState?.[b.id]?.coverImageUrl,
      })),
    [bookState],
  );

  const rotateTo = useCallback(
    (targetIndex: number, focus = false) => {
      const normalizedTarget = normalizeIndex(targetIndex, BOOK_COUNT);
      const delta = shortestDelta(activeIndex, normalizedTarget, BOOK_COUNT);

      if (focus) shouldFocusActive.current = true;

      if (delta === 0) {
        if (focus) {
          bookRefs.current[activeIndex]?.focus({ preventScroll: true });
        }
        shouldFocusActive.current = false;
        return;
      }

      setRotationIndex((prev) => prev + delta);
      onSelectionChange?.(CAROUSEL_BOOKS[normalizedTarget].id);
    },
    [activeIndex, onSelectionChange],
  );

  useEffect(() => {
    if (shouldFocusActive.current) {
      shouldFocusActive.current = false;
      bookRefs.current[activeIndex]?.focus({ preventScroll: true });
    }
  }, [activeIndex]);

  const handleOpenActive = useCallback(() => {
    onOpenBook?.(activeBook.id);
  }, [onOpenBook, activeBook.id]);

  const handleKeyDown = (event: React.KeyboardEvent, bookIndex: number) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        rotateTo(activeIndex + 1, true);
        break;
      case "ArrowLeft":
        event.preventDefault();
        rotateTo(activeIndex - 1, true);
        break;
      case "Home":
        event.preventDefault();
        rotateTo(0, true);
        break;
      case "End":
        event.preventDefault();
        rotateTo(BOOK_COUNT - 1, true);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (bookIndex === activeIndex) {
          handleOpenActive();
        } else {
          rotateTo(bookIndex, true);
        }
        break;
      default:
        break;
    }
  };

  return (
    <section className="holo-carousel" aria-label="Expedition library">
      <div className="holo-stage">
        <div className="holo-orbit" aria-hidden="true" />
        <button
          type="button"
          className="holo-nav holo-nav--prev"
          aria-label="Previous volume"
          onClick={() => rotateTo(activeIndex - 1)}
        >
          <Chevron direction="left" />
        </button>
        <div
          className="holo-books"
          role="radiogroup"
          aria-label="Expedition volumes"
        >
          {books.map((b, index) => {
            const relIndex =
              normalizeIndex(index - activeIndex + 1, BOOK_COUNT) - 1;
            const slot =
              relIndex === 0 ? "front" : relIndex === 1 ? "right" : "left";
            const isFront = relIndex === 0;
            const theta = (index - rotationIndex) * DEGREES_PER_SLOT;
            const ariaLabel = `${b.label}. ${b.title}: ${b.subtitle}${
              b.completed ? ". Expedition complete" : ""
            }`;

            return (
              <div
                key={b.id}
                ref={(el) => {
                  bookRefs.current[index] = el;
                }}
                className="holo-book"
                role="radio"
                aria-checked={isFront}
                aria-label={ariaLabel}
                tabIndex={isFront ? 0 : -1}
                data-slot={slot}
                data-book={b.id}
                data-active={isFront}
                data-completed={b.completed}
                style={
                  {
                    "--theta": `${theta}deg`,
                    "--n": index,
                  } as CSSProperties
                }
                onClick={() => (isFront ? handleOpenActive() : rotateTo(index))}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                <span className="holo-book__label" aria-hidden="true">
                  {b.label}
                </span>
                <span className="holo-book__badge" aria-hidden="true">
                  SELECTED
                </span>
                <div className="holo-book__body">
                  <span className="holo-book__spine" />
                  <span className="holo-book__pages" />
                  <span className="holo-book__back" />
                  <div className="holo-book__cover">
                    <BookCoverFace
                      book={b}
                      coverImageUrl={b.coverImageUrl}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="holo-nav holo-nav--next"
          aria-label="Next volume"
          onClick={() => rotateTo(activeIndex + 1)}
        >
          <Chevron direction="right" />
        </button>
      </div>
      <p className="holo-sr" role="status" aria-live="polite">
        {activeBook.label} selected
      </p>
    </section>
  );
}

export default BookCarousel;
