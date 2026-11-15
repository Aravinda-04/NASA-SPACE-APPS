// Logical coordinates belong to the unmodified Stage 3 book, never the viewport.
export const BOOK_WIDTH = 1240;
export const BOOK_HEIGHT = 660;
export const PAGE_WIDTH = BOOK_WIDTH / 2;

export interface Point { x: number; y: number }
export interface Rect { left: number; top: number; width: number; height: number }

export function toBookPoint(client: Point, rect: Rect): Point {
  return {
    x: (client.x - rect.left) * BOOK_WIDTH / rect.width,
    y: (client.y - rect.top) * BOOK_HEIGHT / rect.height,
  };
}

export function turnMargin(point: Point, page: number, count: number) {
  if (point.y < 0 || point.y > BOOK_HEIGHT || point.x < 0 || point.x > BOOK_WIDTH) return null;
  const direction = point.x < BOOK_WIDTH / 2 ? -1 : 1;
  if ((direction < 0 && page === 0) || (direction > 0 && page >= count - 2)) return null;
  const distance = direction < 0 ? point.x : BOOK_WIDTH - point.x;
  const corner = point.y < 48 || point.y > BOOK_HEIGHT - 48;
  return distance <= (corner ? 48 : 22) ? { direction, corner } : null;
}

export function releaseCompletes(direction: number, point: Point, velocity: number) {
  // Velocity is signed in book pixels/ms; movement away from a turn cannot commit it.
  const pastSpine = direction > 0 ? point.x < PAGE_WIDTH : point.x > PAGE_WIDTH;
  return pastSpine || -direction * velocity > 0.65;
}
