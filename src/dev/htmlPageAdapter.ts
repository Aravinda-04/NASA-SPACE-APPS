import { PageFlip } from "page-flip/dist/js/page-flip.module.js";
import { BOOK_HEIGHT, BOOK_WIDTH, PAGE_WIDTH, releaseCompletes, toBookPoint, turnMargin, type Point } from "./flipGeometry";
import { inspectLandedGeometry } from "./auditGeometry";

const INTERACTIVE = 'a,button,input,select,textarea,summary,details,label,canvas,[role="button"],[role="slider"],[contenteditable],.interactive-planet-atlas,.contents-records,.science-controls,.signal-scrubber';

// 2.0.7's renderer has no stop method. Capture only its own recursive RAF chain,
// leaving React, the map, and all other animation scheduling untouched.
function animationScope(observe: (time: number, cost: number) => void) {
  const native = window.requestAnimationFrame.bind(window);
  const pending = new Set<number>();
  let disposed = false;
  function run<T>(action: () => T): T {
    const previous = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      const id = native(time => {
        pending.delete(id);
        if (!disposed) {
          const started = performance.now();
          run(() => callback(time));
          observe(time, performance.now() - started);
        }
      });
      pending.add(id);
      return id;
    };
    try { return action(); } finally { window.requestAnimationFrame = previous; }
  }
  return { run, stop() { disposed = true; pending.forEach(cancelAnimationFrame); pending.clear(); }, pending };
}

interface Source { spread: number; element: HTMLElement }
interface Options {
  scaler: HTMLElement;
  sources: Source[];
  start: number;
  frame: number | null;
  benchmark: number;
  onLand: (page: number) => void;
  onState: (state: string) => void;
}

export function mountHTMLSpike(options: Options) {
  const { scaler, sources } = options;
  const engineHost = document.createElement("div");
  engineHost.className = "spike-engine";
  engineHost.dataset.ready = "false";
  engineHost.dataset.specimen = sources.map(source => source.spread).join(",");
  const restores: Array<() => void> = [];
  const metrics = {
    engine: "page-flip 2.0.7 HTML soft pages",
    sourceSpreads: sources.map(source => source.spread),
    pages: [] as Array<{ sourceSpread: number; side: string; width: number; height: number; movedWidth: number; movedHeight: number }>,
    turns: 0, frameWorkMs: [] as number[], frameIntervalsMs: [] as number[],
    errors: [] as string[], listenerAudit: "not measured; teardown requires a browser lifecycle audit",
    usesAnimatedClipPath: true, usesAnimatedGradient: true, curvedMesh: false,
    capturePhase: options.frame, capturedDurationMs: 0,
  };
  const pages: HTMLElement[] = [];

  for (const source of sources) {
    const leaves = [...source.element.children].filter((node): node is HTMLElement =>
      node instanceof HTMLElement && node.matches(".archive-page,.reader-page,.science-copy,.science-interaction"));
    if (leaves.length !== 2) throw new Error(`Spread ${source.spread}: expected exactly two real page elements, found ${leaves.length}`);
    // Measure both columns before moving either; otherwise auto-placement can
    // temporarily move the remaining right column into the left grid track.
    const sourceSizes = leaves.map(leaf => ({ width: leaf.offsetWidth, height: leaf.offsetHeight }));
    leaves.forEach((leaf, side) => {
      const anchor = document.createComment("spike: restore real page here");
      leaf.before(anchor);
      const originalStyle = leaf.getAttribute("style");
      const originalVisibility = source.element.style.visibility;
      const host = document.createElement("div");
      host.className = "spike-leaf";
      host.dataset.density = "soft";
      host.dataset.sourceSpread = String(source.spread);
      host.dataset.side = side === 0 ? "left" : "right";
      // Clone only the empty styling shell. Never clone page content or canvas.
      const shell = source.element.cloneNode(false) as HTMLElement;
      shell.removeAttribute("id");
      shell.removeAttribute("aria-labelledby");
      shell.classList.add("spike-page-frame");
      shell.style.setProperty("--spike-offset", `${-side * PAGE_WIDTH}px`);
      const binding = source.element.querySelector(":scope > .archive-binding");
      if (binding) shell.append(binding.cloneNode(true));
      const measurement = { sourceSpread: source.spread, side: host.dataset.side!, ...sourceSizes[side], movedWidth: 0, movedHeight: 0 };
      leaf.style.gridColumn = String(side + 1);
      leaf.style.gridRow = "1";
      shell.append(leaf);
      host.append(shell);
      pages.push(host);
      engineHost.append(host);
      restores.push(() => {
        anchor.replaceWith(leaf);
        if (originalStyle === null) leaf.removeAttribute("style");
        else leaf.setAttribute("style", originalStyle);
        source.element.style.visibility = originalVisibility;
      });
      metrics.pages.push(measurement);
    });
    source.element.style.visibility = "hidden";
  }
  scaler.append(engineHost);
  pages.forEach((host, index) => {
    const leaf = host.querySelector<HTMLElement>(".archive-page,.reader-page,.science-copy,.science-interaction")!;
    metrics.pages[index].movedWidth = leaf.offsetWidth;
    metrics.pages[index].movedHeight = leaf.offsetHeight;
  });

  const scope = animationScope((time, cost) => {
    if (!activeTurn) return;
    metrics.frameWorkMs.push(cost);
    if (previousFrame !== null) metrics.frameIntervalsMs.push(time - previousFrame);
    previousFrame = time;
  });
  const engine = new PageFlip(engineHost, {
    width: PAGE_WIDTH, height: BOOK_HEIGHT, size: "fixed", startPage: options.start,
    autoSize: false, usePortrait: false, showCover: false, drawShadow: true,
    maxShadowOpacity: 0.32, flippingTime: 920, useMouseEvents: false,
    mobileScrollSupport: false, showPageCorners: true, clickEventForward: true,
    disableFlipByClick: false,
  });
  let disposed = false;
  let current = options.start;
  let requested = current;
  let state = "read";
  let previousFrame: number | null = null;
  let activeTurn = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let gesture: { id: number; start: Point; previous: Point; time: number; velocity: number; direction: number; moved: boolean; corner: boolean } | null = null;
  const abort = new AbortController();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let fade: Animation | null = null;
  let fading = false;
  let auditFrame = 0;

  function publish() {
    engineHost.dataset.currentPage = String(current);
    engineHost.dataset.turnState = state;
    if (state === "read") {
      cancelAnimationFrame(auditFrame);
      auditFrame = requestAnimationFrame(() => {
        if (!disposed && state === "read") engineHost.dataset.geometryAudit = JSON.stringify(inspectLandedGeometry(engineHost));
      });
    }
    const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    engineHost.dataset.report = JSON.stringify({ ...metrics,
      meanFrameWorkMs: mean(metrics.frameWorkMs), meanFrameIntervalMs: mean(metrics.frameIntervalsMs),
      pendingEngineAnimationFrames: scope.pending.size,
      liveCanvases: engineHost.querySelectorAll("canvas").length,
      current, state,
    });
    const nav = scaler.closest("main")?.querySelector(":scope > .reader-pagination");
    const previous = nav?.querySelector<HTMLButtonElement>("button:first-child");
    const next = nav?.querySelector<HTMLButtonElement>(".ow-primary");
    if (previous) previous.disabled = current === 0;
    if (next) {
      next.hidden = current >= pages.length - 2;
      // Existing button display styles override the browser's [hidden] rule.
      next.style.display = next.hidden ? "none" : "";
    }
  }

  function pump() {
    if (disposed || state !== "read" || fading || current === requested) return;
    if (reduced.matches) {
      // A single real DOM tree fades out, changes at zero opacity, then fades in.
      fading = true;
      state = "crossfade";
      options.onState(state);
      publish();
      fade = engineHost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: "forwards" });
      fade.finished.then(() => {
        if (disposed) return;
        const destination = requested > current ? current + 2 : current - 2;
        // Only the reduced-motion path may land without curl.
        (engine as unknown as { turnToPage(page: number): void }).turnToPage(destination);
        fade?.cancel();
        fade = engineHost.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 90 });
        return fade.finished;
      }).then(() => {
        if (disposed) return;
        fading = false;
        state = "read";
        options.onState(state);
        if (options.benchmark > metrics.turns) requested = current === 0 ? 2 : 0;
        publish();
        timer = setTimeout(pump, 120);
      }).catch(() => {});
      return;
    }
    if (requested > current) engine.flipNext("top");
    else engine.flipPrev("top");
  }

  function request(page: number) {
    requested = Math.max(0, Math.min(pages.length - 2, page - page % 2));
    pump();
  }

  engine.on("flip", event => {
    const landed = Number(event.data);
    if (landed !== current) metrics.turns++;
    current = landed;
    options.onLand(current);
    publish();
  });
  engine.on("changeState", event => {
    state = String(event.data);
    options.onState(state);
    if (state === "read") {
      activeTurn = false;
      previousFrame = null;
      if (options.benchmark > metrics.turns) requested = current === 0 ? 2 : 0;
      clearTimeout(timer);
      timer = setTimeout(pump, 120);
    } else if (state === "flipping" || state === "user_fold") activeTurn = true;
    publish();
  });
  engine.on("init", () => {
    if (disposed) return;
    engineHost.dataset.ready = "true";
    publish();
    if (options.benchmark) request(current === 0 ? 2 : 0);
    if (options.frame !== null) request(2);
  });
  scope.run(() => engine.loadFromHTML(pages));
  const render = engine.getRender();
  const originalDraw = render.drawFrame.bind(render);
  if (options.frame !== null) {
    // Deterministic capture hook, restricted to this isolated specimen.
    // These are geometric phases of the library's actual turn, not elapsed time.
    render.startAnimation = (frames, duration, end) => {
      const phase = options.frame! / 100;
      metrics.capturedDurationMs = duration;
      frames[Math.min(frames.length - 1, Math.round((frames.length - 1) * phase))]();
      if (phase === 1) end();
      originalDraw();
      publish();
    };
  }

  function point(event: PointerEvent) {
    return toBookPoint({ x: event.clientX, y: event.clientY }, engineHost.getBoundingClientRect());
  }
  function blocked(event: Event) {
    return event.target instanceof Element && !!event.target.closest(INTERACTIVE);
  }
  engineHost.addEventListener("pointerdown", event => {
    if (event.button !== 0 || blocked(event) || reduced.matches || (state !== "read" && state !== "fold_corner")) return;
    const start = point(event);
    const margin = turnMargin(start, current, pages.length);
    if (!margin) return;
    engine.getRender().finishAnimation();
    engineHost.setPointerCapture(event.pointerId);
    gesture = { id: event.pointerId, start, previous: start, time: performance.now(), velocity: 0, direction: margin.direction, moved: false, corner: margin.corner };
    engine.startUserTouch(margin.corner ? start : { x: start.x, y: 1 });
    event.preventDefault();
  }, { signal: abort.signal });
  engineHost.addEventListener("pointermove", event => {
    const position = point(event);
    if (gesture) {
      const now = performance.now();
      gesture.velocity = (position.x - gesture.previous.x) / Math.max(1, now - gesture.time);
      gesture.previous = position;
      gesture.time = now;
      gesture.moved ||= Math.hypot(position.x - gesture.start.x, position.y - gesture.start.y) > 5;
      engine.userMove(gesture.corner ? position : { x: position.x, y: 1 }, false);
    } else if (!reduced.matches && options.frame === null) {
      const margin = !blocked(event) && turnMargin(position, current, pages.length);
      engine.getFlipController().showCorner(margin && margin.corner ? position : { x: PAGE_WIDTH, y: BOOK_HEIGHT / 2 });
    }
  }, { signal: abort.signal });
  function release(event: PointerEvent) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const position = point(event);
    const stale = performance.now() - gesture.time > 100;
    const commit = event.type !== "pointercancel" && releaseCompletes(gesture.direction, position, stale ? 0 : gesture.velocity);
    if (gesture.moved) {
      requested = commit ? current + gesture.direction * 2 : current;
      // The public engine API commits by position. A velocity commitment moves
      // the fold just across the spine before its normal release animation.
      if (commit && ((gesture.direction > 0 && position.x >= PAGE_WIDTH) || (gesture.direction < 0 && position.x <= PAGE_WIDTH))) {
        engine.userMove({ x: PAGE_WIDTH - gesture.direction, y: gesture.corner ? position.y : 1 }, false);
      }
      if (event.type === "pointercancel") engine.getFlipController().fold(gesture.corner ? gesture.start : { x: gesture.start.x, y: 1 });
    } else requested = current + gesture.direction * 2;
    engine.userStop(position);
    if (engineHost.hasPointerCapture(event.pointerId)) engineHost.releasePointerCapture(event.pointerId);
    gesture = null;
    publish();
  }
  engineHost.addEventListener("pointerup", release, { signal: abort.signal });
  engineHost.addEventListener("pointercancel", release, { signal: abort.signal });
  engineHost.addEventListener("pointerleave", () => {
    if (!gesture && state === "fold_corner") engine.getFlipController().showCorner({ x: PAGE_WIDTH, y: BOOK_HEIGHT / 2 });
  }, { signal: abort.signal });
  engineHost.addEventListener("click", event => {
    if (!reduced.matches || blocked(event)) return;
    const position = toBookPoint({ x: event.clientX, y: event.clientY }, engineHost.getBoundingClientRect());
    const margin = turnMargin(position, current, pages.length);
    if (margin) request(current + margin.direction * 2);
  }, { signal: abort.signal });

  const main = scaler.closest("main")!;
  main.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>(".reader-pagination button");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    request(requested + (button.classList.contains("ow-primary") ? 2 : -2));
  }, { capture: true, signal: abort.signal });
  main.addEventListener("keydown", event => {
    if (blocked(event) || event.altKey || event.metaKey || event.ctrlKey || event.defaultPrevented) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    event.stopPropagation();
    request(requested + (event.key === "ArrowRight" ? 2 : -2));
  }, { signal: abort.signal });
  window.addEventListener("error", event => { metrics.errors.push(event.message); publish(); }, { signal: abort.signal });
  window.addEventListener("unhandledrejection", event => { metrics.errors.push(String(event.reason)); publish(); }, { signal: abort.signal });

  return {
    engineHost,
    dispose() {
      disposed = true;
      clearTimeout(timer);
      fade?.cancel();
      cancelAnimationFrame(auditFrame);
      abort.abort();
      scope.stop();
      engine.off("init"); engine.off("flip"); engine.off("changeState");
      restores.reverse().forEach(restore => restore());
      // UI.destroy only removes resize when useMouseEvents is true in 2.0.7.
      // No native mouse handlers were registered; enabling teardown is harmless.
      engine.getSettings().useMouseEvents = true;
      engine.destroy();
      engineHost.remove();
    },
  };
}
