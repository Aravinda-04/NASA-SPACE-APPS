import type { BookId, MissionId } from "../types/expedition";

export interface BookDefinition {
  id: BookId;
  volume: string;
  number: string;
  spacecraft: string;
  title: string;
  subtitle: string;
  cover: string;
  schematic: string;
  theme: string;
}
export const BOOKS: BookDefinition[] = [
  {
    id: "surveyor",
    volume: "Moon",
    number: "01",
    spacecraft: "Surveyor 3 / Apollo 12",
    title: "The camera that came back",
    subtitle: "Returned equipment",
    cover: "/images/covers/moon.jpeg",
    schematic: "/images/covers/moon.svg",
    theme: "#454a48",
  },
  {
    id: "curiosity",
    volume: "Mars",
    number: "02",
    spacecraft: "Curiosity",
    title: "The journey to the surface",
    subtitle: "A landing in stages",
    cover: "/images/covers/mars.jpeg",
    schematic: "/images/covers/mars.svg",
    theme: "#783d2c",
  },
  {
    id: "pioneer",
    volume: "Outer Space",
    number: "03",
    spacecraft: "Pioneer 10",
    title: "A message from humanity",
    subtitle: "A signal through space",
    cover: "/images/covers/outer_space.jpeg",
    schematic: "/images/covers/outer-space.svg",
    theme: "#172b43",
  },
];
export const BOOK_BY_MISSION: Record<MissionId, BookId> = {
  surveyor: "surveyor",
  curiosity: "curiosity",
  pioneer: "pioneer",
  viking: "curiosity",
  ingenuity: "curiosity",
  near: "pioneer",
  dawn: "pioneer",
  kepler: "pioneer",
};

export const getBook = (id: MissionId) =>
  BOOKS.find((book) => book.id === BOOK_BY_MISSION[id])!;
