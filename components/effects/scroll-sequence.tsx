"use client";

import { useEffect, useRef, type ReactNode } from "react";

const FRAME_COUNT = 150;
const CACHE_LIMIT = 14;
const LOAD_LIMIT = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function frameUrl(index: number) {
  return `/assets/frames/frame_${String(index + 1).padStart(3, "0")}.png`;
}

export default function ScrollSequence({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!stage || !hero || !canvas || !context) return;

    const frames = new Map<number, ImageBitmap>();
    const loading = new Set<number>();
    const controllers = new Map<number, AbortController>();
    let queue: number[] = [];
    let queued = new Set<number>();
    let activeLoads = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let targetFrame = 0;
    let currentFrame = 0;
    let lastQueuedCenter = -1;
    let direction = 1;
    let animationFrame = 0;
    let disposed = false;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = bounds.width;
      const nextHeight = bounds.height;
      const nextDpr = Math.min(2, window.devicePixelRatio || 1);
      if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;
      width = nextWidth;
      height = nextHeight;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const touchFrame = (index: number) => {
      const bitmap = frames.get(index);
      if (!bitmap) return undefined;
      frames.delete(index);
      frames.set(index, bitmap);
      return bitmap;
    };

    const trimCache = () => {
      const protectedFrames = new Set([
        Math.floor(targetFrame),
        Math.ceil(targetFrame),
        Math.floor(currentFrame),
        Math.ceil(currentFrame),
      ]);

      while (frames.size > CACHE_LIMIT) {
        const oldest = [...frames.keys()].find((index) => !protectedFrames.has(index));
        const index = oldest ?? frames.keys().next().value;
        if (index === undefined) break;
        frames.get(index)?.close();
        frames.delete(index);
      }
    };

    const pumpQueue = () => {
      while (!disposed && activeLoads < LOAD_LIMIT && queue.length > 0) {
        const index = queue.shift();
        if (index === undefined) break;
        queued.delete(index);
        if (frames.has(index) || loading.has(index)) continue;

        const controller = new AbortController();
        controllers.set(index, controller);
        loading.add(index);
        activeLoads += 1;

        void fetch(frameUrl(index), { signal: controller.signal, cache: "force-cache" })
          .then((response) => {
            if (!response.ok) throw new Error(`Frame request failed: ${response.status}`);
            return response.blob();
          })
          .then((blob) => createImageBitmap(blob))
          .then((bitmap) => {
            if (disposed) {
              bitmap.close();
              return;
            }
            frames.set(index, bitmap);
            trimCache();
            render();
          })
          .catch(() => undefined)
          .finally(() => {
            controllers.delete(index);
            loading.delete(index);
            activeLoads -= 1;
            pumpQueue();
          });
      }
    };

    const prioritizeFrames = (center: number) => {
      if (center !== lastQueuedCenter) {
        if (lastQueuedCenter >= 0) direction = center >= lastQueuedCenter ? 1 : -1;
        lastQueuedCenter = center;
      }

      const order = [Math.floor(targetFrame), Math.ceil(targetFrame)];
      for (let offset = 1; offset <= 10; offset += 1) {
        order.push(center + direction * offset, center - direction * offset);
      }

      queue = [...new Set(order)]
        .filter((index) => index >= 0 && index < FRAME_COUNT)
        .filter((index) => !frames.has(index) && !loading.has(index));
      queued = new Set(queue);
      pumpQueue();
    };

    const drawBitmap = (bitmap: ImageBitmap, alpha = 1) => {
      const scale = Math.max(width / bitmap.width, height / bitmap.height);
      const drawWidth = bitmap.width * scale;
      const drawHeight = bitmap.height * scale;
      context.globalAlpha = alpha;
      context.drawImage(bitmap, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
      context.globalAlpha = 1;
    };

    const closestFrame = (index: number) => {
      let closest: number | undefined;
      let distance = Number.POSITIVE_INFINITY;
      for (const candidate of frames.keys()) {
        const candidateDistance = Math.abs(candidate - index);
        if (candidateDistance < distance) {
          closest = candidate;
          distance = candidateDistance;
        }
      }
      return closest === undefined ? undefined : touchFrame(closest);
    };

    const render = () => {
      if (!width || !height) return;
      context.globalAlpha = 1;
      context.fillStyle = "#f7f7f5";
      context.fillRect(0, 0, width, height);

      const lowerIndex = Math.floor(currentFrame);
      const upperIndex = Math.min(FRAME_COUNT - 1, lowerIndex + 1);
      const fraction = currentFrame - lowerIndex;
      const lowerBitmap = touchFrame(lowerIndex);
      const upperBitmap = touchFrame(upperIndex);

      if (lowerBitmap) {
        drawBitmap(lowerBitmap);
        if (upperBitmap && upperIndex !== lowerIndex && fraction > 0) {
          drawBitmap(upperBitmap, fraction);
        }
      } else if (upperBitmap) {
        drawBitmap(upperBitmap);
      } else {
        const fallback = closestFrame(Math.round(currentFrame));
        if (fallback) drawBitmap(fallback);
      }
    };

    const refresh = () => {
      resizeCanvas();
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      const scrollDistance = Math.max(1, stage.offsetHeight - hero.offsetHeight);
      const progress = clamp((window.scrollY - stageTop) / scrollDistance, 0, 1);
      targetFrame = progress * (FRAME_COUNT - 1);
      prioritizeFrames(Math.round(targetFrame));

      if (reducedMotion || document.visibilityState === "hidden") {
        currentFrame = targetFrame;
      } else {
        currentFrame += (targetFrame - currentFrame) * 0.16;
        if (Math.abs(targetFrame - currentFrame) < 0.01) currentFrame = targetFrame;
      }

      render();
      trimCache();
    };

    const update = () => {
      animationFrame = 0;
      if (disposed) return;
      refresh();
      animationFrame = window.requestAnimationFrame(update);
    };

    const handleScroll = () => refresh();
    const handleResize = () => {
      resizeCanvas();
      refresh();
    };
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    motionPreference.addEventListener("change", handleMotionPreference);
    handleResize();
    animationFrame = window.requestAnimationFrame(update);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      motionPreference.removeEventListener("change", handleMotionPreference);
      resizeObserver.disconnect();
      for (const controller of controllers.values()) controller.abort();
      for (const bitmap of frames.values()) bitmap.close();
      frames.clear();
    };
  }, []);

  return (
    <div className="sequence-stage" ref={stageRef}>
      <main className="hero" ref={heroRef}>
        <canvas className="sequence-canvas" ref={canvasRef} aria-hidden="true" />
        {children}
      </main>
    </div>
  );
}