declare module "page-flip/dist/js/page-flip.module.js" {
  export class PageFlip {
    constructor(element: HTMLElement, settings: Record<string, unknown>);
    on(event: string, callback: (event: { data: number | string }) => void): this;
    off(event: string): void;
    loadFromHTML(elements: HTMLElement[]): void;
    getCurrentPageIndex(): number;
    getState(): string;
    getSettings(): Record<string, unknown>;
    getFlipController(): {
      showCorner(point: { x: number; y: number }): void;
      fold(point: { x: number; y: number }): void;
      stopMove(): void;
    };
    getRender(): {
      startAnimation(frames: Array<() => void>, duration: number, end: () => void): void;
      finishAnimation(): void;
      drawFrame(): void;
    };
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    startUserTouch(point: { x: number; y: number }): void;
    userMove(point: { x: number; y: number }, touch: boolean): void;
    userStop(point: { x: number; y: number }, swipe?: boolean): void;
    destroy(): void;
  }
}
