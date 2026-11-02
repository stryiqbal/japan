"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";

type SheetId = "covers" | "spines" | "fix" | "fix2";
type Crop = { sheet: SheetId; box: [number, number, number, number] };
type Film = {
  id: string;
  title: string;
  romaji: string;
  kanji: string;
  year: number;
  genre: string;
  minutes: number;
  synopsis: string;
  spine: Crop;
  cover: Crop;
};

const SHEETS: Record<SheetId, { url: string; width: number; height: number }> = {
  covers: {
    url: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010644_837e04ca-2418-45c1-b8e0-0233265c4cd5.png&w=1744&q=85",
    width: 1744,
    height: 2336,
  },
  spines: {
    url: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010738_a3e47ead-18f2-4974-9468-06d16a25edc5.png&w=2688&q=85",
    width: 2688,
    height: 1152,
  },
  fix: {
    url: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010831_3ebb874b-93dc-433e-87ed-6299aba720f0.png&w=1520&q=85",
    width: 1520,
    height: 2688,
  },
  fix2: {
    url: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_092020_f96bc094-db7b-46de-9298-074a24e0a3b8.png&w=1520&q=85",
    width: 1520,
    height: 2688,
  },
};

const FILMS: Film[] = [
  {
    id: "valley", title: "The Silent Valley", romaji: "SHIZUKANA TANI", kanji: "静かな谷", year: 1958, genre: "Drama", minutes: 104,
    synopsis: "A schoolteacher returns to the mountain village that exiled her father, and finds the valley has kept every one of its secrets.",
    spine: { sheet: "spines", box: [266, 31, 189, 1089] }, cover: { sheet: "covers", box: [497, 72, 344, 659] },
  },
  {
    id: "bluehour", title: "The Blue Hour", romaji: "AO NO TOKI", kanji: "青の刻", year: 1962, genre: "Romance", minutes: 97,
    synopsis: "Over one long evening in a harbour town, a widow and a stranger trade small lies until the light runs out.",
    spine: { sheet: "spines", box: [492, 31, 189, 1089] }, cover: { sheet: "covers", box: [914, 72, 342, 659] },
  },
  {
    id: "river", title: "River of Salt", romaji: "SHIO NO KAWA", kanji: "塩の川", year: 1964, genre: "Drama", minutes: 121,
    synopsis: "Two brothers drag a salt barge downriver to a city that no longer wants anything they carry.",
    spine: { sheet: "fix", box: [197, 54, 324, 2566] }, cover: { sheet: "covers", box: [1332, 72, 344, 659] },
  },
  {
    id: "summer", title: "The Last Summer", romaji: "SAIGO NO NATSU", kanji: "最後の夏", year: 1966, genre: "Drama", minutes: 109,
    synopsis: "The summer before the dam floods their village, three friends set fire to everything they cannot take with them.",
    spine: { sheet: "spines", box: [937, 31, 188, 1089] }, cover: { sheet: "covers", box: [74, 813, 344, 676] },
  },
  {
    id: "green", title: "The Green Road", romaji: "MIDORI NO MICHI", kanji: "緑の道", year: 1969, genre: "Mystery", minutes: 101,
    synopsis: "A surveyor mapping a forest road keeps finding the same footprints, always one day ahead of him.",
    spine: { sheet: "spines", box: [1157, 31, 185, 1090] }, cover: { sheet: "covers", box: [497, 815, 344, 674] },
  },
  {
    id: "noon", title: "Noon in Ashes", romaji: "HAI NO SHOGO", kanji: "灰の正午", year: 1971, genre: "Western", minutes: 112,
    synopsis: "A rider crosses a white desert to settle an old debt, and learns too late who sent him.",
    spine: { sheet: "spines", box: [44, 32, 184, 1088] }, cover: { sheet: "covers", box: [74, 72, 347, 659] },
  },
  {
    id: "observer", title: "The Observer", romaji: "KANSATSUSHA", kanji: "観察者", year: 1973, genre: "Thriller", minutes: 96,
    synopsis: "A night watchman begins to suspect that the building he guards has started watching him back.",
    spine: { sheet: "fix2", box: [371, 15, 349, 2655] }, cover: { sheet: "covers", box: [915, 815, 342, 675] },
  },
  {
    id: "birds", title: "The Fallen Birds", romaji: "OCHITA TORI", kanji: "落ちた鳥", year: 1975, genre: "Drama", minutes: 118,
    synopsis: "When the birds stop singing over a frontier town, the mayor's daughter is the only one who goes looking for the reason.",
    spine: { sheet: "spines", box: [1573, 31, 183, 1089] }, cover: { sheet: "covers", box: [1331, 815, 345, 675] },
  },
  {
    id: "storm", title: "Light in the Storm", romaji: "ARASHI NO HI", kanji: "嵐の灯", year: 1978, genre: "Drama", minutes: 127,
    synopsis: "A lighthouse keeper and his son wait out a three-day storm with a shipwrecked sailor who will not give his name.",
    spine: { sheet: "fix2", box: [808, 15, 347, 2656] }, cover: { sheet: "covers", box: [74, 1571, 345, 681] },
  },
  {
    id: "tide", title: "The Long Tide", romaji: "NAGAI SHIO", kanji: "長い潮", year: 1981, genre: "Drama", minutes: 99,
    synopsis: "A fisherman's wife counts the tides on the harbour wall while her husband's boat fails to come home.",
    spine: { sheet: "spines", box: [2012, 31, 188, 1089] }, cover: { sheet: "covers", box: [496, 1577, 343, 678] },
  },
  {
    id: "war", title: "A Quiet War", romaji: "SHIZUKANA SENSO", kanji: "静かな戦争", year: 1985, genre: "Comedy", minutes: 103,
    synopsis: "Two neighbours fight a silent war over a garden wall for thirty years, and neither will say how it began.",
    spine: { sheet: "spines", box: [2236, 31, 189, 1089] }, cover: { sheet: "covers", box: [913, 1579, 343, 676] },
  },
  {
    id: "door", title: "Red Door", romaji: "AKAI TOBIRA", kanji: "赤い扉", year: 1989, genre: "Thriller", minutes: 114,
    synopsis: "A projectionist follows a reel of unknown film through the corridors of a cinema on its final night.",
    spine: { sheet: "spines", box: [2462, 31, 188, 1089] }, cover: { sheet: "covers", box: [1331, 1579, 344, 677] },
  },
];

const DECADES = ["ALL / すべて", "1950s", "1960s", "1970s", "1980s"];
const BLOB_POSITIONS = [[150, 330, 0], [340, 600, 120], [250, 120, 220], [90, 760, 300], [400, 250, 360], [260, 860, 420], [230, 470, 180]] as const;
const LOOP_SIZE = FILMS.length * 3;

function wrapIndex(value: number, length: number) {
  return ((value % length) + length) % length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function cropStyle(crop: Crop): CSSProperties {
  const sheet = SHEETS[crop.sheet];
  const [x, y, width, height] = crop.box;
  return {
    backgroundImage: `url("${sheet.url}")`,
    backgroundPosition: `${(x / (sheet.width - width)) * 100}% ${(y / (sheet.height - height)) * 100}%`,
    backgroundSize: `${(sheet.width / width) * 100}% ${(sheet.height / height) * 100}%`,
  };
}

function coverImageGeometry(crop: Crop) {
  const sheet = SHEETS[crop.sheet];
  const [x, y, width, height] = crop.box;
  return {
    x: -(x * 474) / width,
    y: -(y * 900) / height,
    width: (sheet.width * 474) / width,
    height: (sheet.height * 900) / height,
    href: sheet.url,
  };
}

function decadeIndex(year: number) {
  if (year < 1960) return 1;
  if (year < 1970) return 2;
  if (year < 1980) return 3;
  return 4;
}

export default function FilmographyShelf() {
  const shelfRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tapeRefs = useRef(new Map<number, HTMLButtonElement>());
  const playRef = useRef<HTMLButtonElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const captionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blobRefs = useRef<(SVGCircleElement | null)[]>([]);
  const positionRef = useRef(17);
  const targetRef = useRef(17);
  const activeRef = useRef(5);
  const hoverRef = useRef(-1);
  const openRef = useRef(false);
  const reducedRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0, currentX: 0, currentY: 0, visible: false, mode: "default" });
  const dragRef = useRef<{ startX: number; startTarget: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const tiltRef = useRef({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(5);
  const [isOpen, setIsOpen] = useState(false);

  const film = FILMS[activeIndex];

  const openDetail = () => {
    if (openRef.current) return;
    openRef.current = true;
    pointerRef.current.visible = true;
    playRef.current?.style.setProperty("--play-scale", "0");
    setIsOpen(true);
  };

  const closeDetail = () => {
    const detail = detailRef.current;
    if (!detail || !openRef.current) return;
    const virtual = wrapIndex(Math.round(positionRef.current), LOOP_SIZE);
    const cover = tapeRefs.current.get(virtual)?.querySelector<HTMLElement>(".film-cover-face");
    const rect = cover?.getBoundingClientRect();
    if (!rect) {
      openRef.current = false;
      setIsOpen(false);
      return;
    }
    const inset = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round 3px)`;
    const animation = detail.animate(
      [{ clipPath: "inset(0 0 0 0 round 0px)", transform: "rotate(0deg)" }, { clipPath: inset, transform: "rotate(-4.5deg)" }],
      { duration: reducedRef.current ? 1 : 850, easing: "cubic-bezier(.76,0,.18,1)", fill: "both" },
    );
    animation.onfinish = () => {
      openRef.current = false;
      setIsOpen(false);
    };
  };

  useEffect(() => {
    const section = shelfRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const preloaded: HTMLImageElement[] = [];
    Object.values(SHEETS).forEach(({ url }) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.src = url;
      preloaded.push(image);
    });

    const updateGeometry = () => {
      const height = window.matchMedia("(max-width: 767px)").matches
        ? Math.min(window.innerWidth * 0.6, window.innerHeight * 0.4)
        : Math.min(window.innerHeight * 0.46, window.innerWidth * 0.31);
      const spineWidth = height * 142 / 840;
      const coverWidth = height * 474 / 900;
      const gap = height * 0.03;
      section.style.setProperty("--H", `${height}px`);
      section.style.setProperty("--ws", `${spineWidth}px`);
      section.style.setProperty("--d", `${coverWidth}px`);
      section.style.setProperty("--gap", `${gap}px`);
      section.style.setProperty("--tab-top", `${window.innerHeight / 2 - height / 2 - 86}px`);
      section.style.setProperty("--shelf-top", `${window.innerHeight / 2 - height / 2 - 40}px`);
      section.style.setProperty("--caption-top", `${window.innerHeight / 2 + height / 2 + 30}px`);
      section.style.setProperty("--arrow-top", `${window.innerHeight / 2 + height / 2 + 40}px`);
      section.style.setProperty("--play-top", `${window.innerHeight / 2 + height * 0.36}px`);
      section.style.setProperty("--play-left", `${window.innerWidth / 2 - coverWidth / 2 - 6}px`);
    };

    const setTabIndicator = () => {
      const tab = tabRefs.current[decadeIndex(FILMS[activeRef.current].year)];
      const indicator = indicatorRef.current;
      if (!tab || !indicator) return;
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    };

    updateGeometry();
    setTabIndicator();
    const resizeObserver = new ResizeObserver(() => {
      updateGeometry();
      setTabIndicator();
    });
    resizeObserver.observe(section);

    let lastTime = 0;
    let frameId = 0;
    let wheelTimeout = 0;

    const frame = (now: number) => {
      if (!lastTime) lastTime = now;
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const position = positionRef.current;
      let target = targetRef.current;

      if (!openRef.current) {
        const spring = dragRef.current ? 18 : (reducedRef.current ? 1 : 5.2);
        const factor = 1 - Math.exp(-spring * dt);
        let nextPosition = position + (target - position) * factor;
        if (reducedRef.current) nextPosition = target;
        if (Math.abs(target - nextPosition) < 1e-4) nextPosition = target;

        if (Math.abs(nextPosition) > LOOP_SIZE * 4) {
          const loops = Math.trunc(nextPosition / LOOP_SIZE);
          nextPosition -= loops * LOOP_SIZE;
          target -= loops * LOOP_SIZE;
          targetRef.current = target;
        }
        positionRef.current = nextPosition;

        const currentFilm = wrapIndex(Math.round(nextPosition), FILMS.length);
        if (currentFilm !== activeRef.current) {
          activeRef.current = currentFilm;
          setActiveIndex(currentFilm);
          setTabIndicator();
        }

        const computed = getComputedStyle(section);
        const height = parseFloat(computed.getPropertyValue("--H")) || 400;
        const spineWidth = parseFloat(computed.getPropertyValue("--ws")) || height * 142 / 840;
        const coverWidth = parseFloat(computed.getPropertyValue("--d")) || height * 474 / 900;
        const gap = parseFloat(computed.getPropertyValue("--gap")) || height * 0.03;
        const bounds = section.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = bounds.top + bounds.height / 2;
        const pointer = pointerRef.current;
        const settled = Math.abs(targetRef.current - nextPosition) < 0.3;
        const playScale = smoothstep(Math.max(0, 1 - Math.abs(targetRef.current - nextPosition) * 3));
        const play = playRef.current;
        if (play) {
          play.style.setProperty("--play-scale", String(openRef.current ? 0 : playScale));
          play.style.visibility = playScale > 0.02 && !openRef.current ? "visible" : "hidden";
          play.style.pointerEvents = playScale > 0.1 && !openRef.current ? "auto" : "none";
        }
        const onCover = pointer.visible && !openRef.current && settled && Math.abs(pointer.x - centerX) < 0.55 * coverWidth && Math.abs(pointer.y - centerY) < 0.55 * height;
        const tiltTargetY = onCover ? clamp((pointer.x - centerX) / (0.55 * coverWidth), -1, 1) * 9 : ((pointer.x - centerX) / window.innerWidth) * 5;
        const tiltTargetX = onCover ? -clamp((pointer.y - centerY) / (height / 2), -1, 1) * 6 : 0;
        const tiltFactor = 1 - Math.exp(-7 * dt);
        tiltRef.current.x += (tiltTargetX - tiltRef.current.x) * tiltFactor;
        tiltRef.current.y += (tiltTargetY - tiltRef.current.y) * tiltFactor;
        const tapes = tapeRefs.current;

        tapes.forEach((element, virtualIndex) => {
          const relative = ((virtualIndex - nextPosition + LOOP_SIZE / 2) % LOOP_SIZE + LOOP_SIZE) % LOOP_SIZE - LOOP_SIZE / 2;
          const absoluteRelative = Math.abs(relative);
          const bend = absoluteRelative < 1 ? (relative + Math.sin(Math.PI * relative) / Math.PI) / 2 : Math.sign(relative) * 0.5;
          const openness = smoothstep(1 - absoluteRelative);
          const x = relative * (spineWidth + gap) + (coverWidth - spineWidth + 1.6 * gap) * bend;
          const oldLift = parseFloat(element.dataset.lift || "0");
          const liftTarget = hoverRef.current === virtualIndex && absoluteRelative > 0.5 ? 1 : 0;
          const lift = reducedRef.current ? liftTarget : oldLift + (liftTarget - oldLift) * (1 - Math.exp(-12 * dt));
          element.dataset.lift = String(lift);
          element.style.transform = `translate3d(${x}px, ${-openness * 0.025 * height - lift * 0.045 * height}px, ${openness * 0.2 * height}px) rotateZ(${-4.5 * openness}deg) rotateX(${tiltRef.current.x * openness}deg) rotateY(${-90 * openness + tiltRef.current.y * openness}deg)`;
          element.style.zIndex = String(Math.round(100 - absoluteRelative * 4));
          element.style.visibility = Math.abs(x) > window.innerWidth / 2 + 1.5 * coverWidth ? "hidden" : "visible";
          element.style.setProperty("--spine-shade", String(openness * 0.55));
          element.style.setProperty("--cover-shade", String((1 - openness) * 0.5));
          element.style.setProperty("--active-scale", String(openness));
        });

        if (pointer.visible && onCover) {
          pointer.currentX += (pointer.x - pointer.currentX) * (1 - Math.exp(-16 * dt));
          pointer.currentY += (pointer.y - pointer.currentY) * (1 - Math.exp(-16 * dt));
        }
      }

      frameId = window.requestAnimationFrame(frame);
    };

    frameId = window.requestAnimationFrame(frame);

    const handleWheel = (event: WheelEvent) => {
      if (openRef.current) return;

      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      const isHorizontalIntent = absX > absY && absX > 4;

      if (!isHorizontalIntent) return;

      event.preventDefault();
      const delta = event.deltaX;
      const height = parseFloat(getComputedStyle(section).getPropertyValue("--H")) || 400;
      const step = height * 142 / 840 + height * 0.03;
      targetRef.current += delta / step * 0.5;
      window.clearTimeout(wheelTimeout);
      wheelTimeout = window.setTimeout(() => {
        targetRef.current = Math.round(targetRef.current);
      }, 160);
    };
    section.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(wheelTimeout);
      section.removeEventListener("wheel", handleWheel);
      resizeObserver.disconnect();
      preloaded.forEach((image) => { image.onload = null; image.onerror = null; });
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = preference.matches;
    const update = (event: MediaQueryListEvent) => { reducedRef.current = event.matches; };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previousOverflow; };
  }, [isOpen]);

  useEffect(() => {
    const indicator = indicatorRef.current;
    const activeTab = tabRefs.current[decadeIndex(film.year)];
    if (!indicator || !activeTab) return;
    indicator.style.width = `${activeTab.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
  }, [film.year]);

  useEffect(() => {
    captionRefs.current.forEach((element, index) => {
      if (!element) return;
      element.animate(
        [{ transform: "translateY(105%)" }, { transform: "translateY(0%)" }],
        { duration: reducedRef.current ? 1 : 650, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both", delay: reducedRef.current ? 0 : index * 45 },
      );
    });
  }, [activeIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const detail = detailRef.current;
    if (!detail) return;
    const reduced = reducedRef.current;
    const virtual = wrapIndex(Math.round(positionRef.current), LOOP_SIZE);
    const cover = tapeRefs.current.get(virtual)?.querySelector<HTMLElement>(".film-cover-face");
    const rect = cover?.getBoundingClientRect();
    const duration = reduced ? 1 : 1050;
    if (rect) {
      const inset = `inset(${rect.top}px ${window.innerWidth - rect.right}px ${window.innerHeight - rect.bottom}px ${rect.left}px round 3px)`;
      detail.animate(
        [{ clipPath: inset, transform: "rotate(-4.5deg)" }, { clipPath: "inset(0 0 0 0 round 0px)", transform: "rotate(0deg)" }],
        { duration, easing: "cubic-bezier(.76,0,.18,1)", fill: "both" },
      );
    }
    detail.querySelectorAll<HTMLElement>("[data-detail-line]").forEach((line, index) => {
      line.animate(
        [{ transform: "translateY(110%)" }, { transform: "translateY(0%)" }],
        { duration: reduced ? 1 : 900, delay: reduced ? 0 : 620 + index * 75, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
      );
    });

    let animationFrame = 0;
    let startTime: number | undefined;
    const bleed = (now: number) => {
      if (startTime === undefined) startTime = now - (reduced ? 2400 : 0);
      const elapsed = now - startTime - (reduced ? 0 : 520);
      BLOB_POSITIONS.forEach(([, , delay], index) => {
        const progress = clamp((elapsed - delay) / 1250, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        blobRefs.current[index]?.setAttribute("r", String(eased * 720));
      });
      if (elapsed < 2200 && !reducedRef.current) animationFrame = requestAnimationFrame(bleed);
    };
    animationFrame = requestAnimationFrame(bleed);
    return () => cancelAnimationFrame(animationFrame);
  }, [isOpen, activeIndex]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest(".film-control")) return;
    dragRef.current = { startX: event.clientX, startTarget: targetRef.current, moved: false };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const pointer = pointerRef.current;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.visible = true;
    const drag = dragRef.current;
    if (!drag || openRef.current) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 5 && !drag.moved) {
      drag.moved = true;
      sectionPointerCapture(event.currentTarget, event.pointerId);
    }
    if (!drag.moved) return;
    const section = shelfRef.current;
    const height = section ? parseFloat(getComputedStyle(section).getPropertyValue("--H")) || 400 : 400;
    targetRef.current = drag.startTarget - delta / (height * 142 / 840 + height * 0.03);
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (drag?.moved) {
      targetRef.current = Math.round(targetRef.current);
      suppressClickRef.current = true;
      window.setTimeout(() => { suppressClickRef.current = false; }, 80);
    }
    dragRef.current = null;
  };

  const handlePointerLeave = () => {
    pointerRef.current.visible = false;
    hoverRef.current = -1;
  };

  const openAt = (virtualIndex: number) => {
    if (suppressClickRef.current) return;
    const r = ((virtualIndex - positionRef.current + LOOP_SIZE / 2) % LOOP_SIZE + LOOP_SIZE) % LOOP_SIZE - LOOP_SIZE / 2;
    if (Math.abs(r) < 0.5) openDetail();
    else targetRef.current = Math.round(targetRef.current + r);
  };

  const jumpTo = (index: number) => {
    const current = targetRef.current;
    let next = index;
    const alternatives = [index - FILMS.length, index + FILMS.length];
    alternatives.forEach((candidate) => {
      if (Math.abs(candidate - current) < Math.abs(next - current)) next = candidate;
    });
    targetRef.current = next;
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && openRef.current) {
      event.preventDefault();
      closeDetail();
      return;
    }
    if (openRef.current) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      targetRef.current = Math.round(targetRef.current) - 1;
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      targetRef.current = Math.round(targetRef.current) + 1;
    } else if (event.key === "Enter" && event.target === shelfRef.current) {
      event.preventDefault();
      openDetail();
    }
  };

  const onWebWheel = (event: React.WheelEvent<HTMLElement>) => {
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);
    const isHorizontalIntent = absX > absY && absX > 4;
    if (isHorizontalIntent) {
      event.preventDefault();
    }
  };

  const activeDecade = decadeIndex(film.year);

  return (
    <section
      className="filmography"
      data-open={isOpen}
      ref={shelfRef}
      aria-label="Filmography shelf"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={onKeyDown}
      onWheel={onWebWheel}
    >
      <svg className="film-paper-grain" viewBox="0 0 220 220" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="film-paper-grain-filter"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch" /><feColorMatrix values=".45 0 0 0 .45 .42 0 0 0 .42 .38 0 0 0 .38 0 0 0 .22 0" /></filter>
          <pattern id="film-paper-grain-pattern" width="220" height="220" patternUnits="userSpaceOnUse"><rect width="220" height="220" filter="url(#film-paper-grain-filter)" /></pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#film-paper-grain-pattern)" />
      </svg>
      <header className="film-topbar" aria-hidden="true">
        <div className="film-logo" aria-label="Leon Vasari">
          <span className="center film-logo-kanji">莱昂·瓦萨里</span>
        </div>
      </header>

      <nav className="film-decades" aria-label="Decades">
        <span className="film-decade-indicator" ref={indicatorRef} />
        {DECADES.map((label, index) => (
          <button
            className={`film-decade film-control ${index === activeDecade ? "is-active" : ""}`}
            data-cursor-button
            key={label}
            ref={(element) => { tabRefs.current[index] = element; }}
            type="button"
            onClick={() => jumpTo(index === 0 ? 0 : FILMS.findIndex((entry) => decadeIndex(entry.year) === index))}
          >
            {label}
          </button>
        ))}
      </nav>

      <div
        className="film-shelf"
        onPointerEnter={() => { pointerRef.current.visible = true; }}
      >
        <div className="film-stage" ref={stageRef}>
          {Array.from({ length: LOOP_SIZE }, (_, virtualIndex) => {
            const entry = FILMS[virtualIndex % FILMS.length];
            return (
              <button
                aria-label={`Open ${entry.title}`}
                className={`film-tape ${virtualIndex % FILMS.length === activeIndex ? "is-current" : ""}`}
                data-film={entry.id}
                data-lift="0"
                data-virtual={virtualIndex}
                key={`${entry.id}-${virtualIndex}`}
                ref={(element) => {
                  if (element) tapeRefs.current.set(virtualIndex, element);
                  else tapeRefs.current.delete(virtualIndex);
                }}
                type="button"
                onPointerEnter={() => { hoverRef.current = virtualIndex; }}
                onPointerLeave={() => { if (hoverRef.current === virtualIndex) hoverRef.current = -1; }}
                onClick={() => openAt(virtualIndex)}
              >
                <span className="film-face film-spine-face" style={cropStyle(entry.spine)}><span className="film-face-shade" /></span>
                <span className="film-face film-cover-face" style={cropStyle(entry.cover)}><span className="film-face-shade" /></span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="film-caption" aria-live="polite">
        <div className="film-caption-mask film-caption-title-mask"><span ref={(node) => { captionRefs.current[0] = node; }}>{film.title}</span></div>
        <div className="film-caption-mask film-caption-subtitle-mask"><span ref={(node) => { captionRefs.current[1] = node; }}>{film.romaji} / {film.kanji}</span></div>
        <div className="film-caption-mask film-caption-year-mask"><span ref={(node) => { captionRefs.current[2] = node; }}>{film.year}</span></div>
      </div>

      <button className="film-arrow film-arrow-left film-control" data-cursor-button type="button" aria-label="Previous film" onClick={() => { targetRef.current = Math.round(targetRef.current) - 1; }}>
        <svg viewBox="0 0 18 10" aria-hidden="true"><path d="M5 1 1 5l4 4M2 5h15" /></svg>
      </button>
      <button className="film-arrow film-arrow-right film-control" data-cursor-button type="button" aria-label="Next film" onClick={() => { targetRef.current = Math.round(targetRef.current) + 1; }}>
        <svg viewBox="0 0 18 10" aria-hidden="true"><path d="m13 1 4 4-4 4m3-4H1" /></svg>
      </button>
      <button className="film-play film-control" data-cursor-button ref={playRef} type="button" aria-label="Open film" onClick={openDetail}>
        <svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1v12l10-6z" /></svg>
      </button>

      {isOpen && (
        <div className="film-detail" ref={detailRef} role="dialog" aria-modal="true" aria-label={film.title}>
          <button className="film-label film-detail-close film-control" data-cursor-button type="button" onClick={closeDetail}>CLOSE / 閉じる</button>
          <div className="film-detail-grid">
            <div className="film-detail-copy">
              <div className="film-detail-mask"><span data-detail-line className="film-detail-subtitle">{film.romaji} / {film.kanji}</span></div>
              <div className="film-detail-mask"><h2 data-detail-line>{film.title}</h2></div>
              <div className="film-detail-mask"><span data-detail-line className="film-detail-meta">{film.year} / {film.genre.toUpperCase()} / {film.minutes} MIN</span></div>
              <div className="film-detail-mask"><p data-detail-line className="film-detail-synopsis">{film.synopsis}</p></div>
              <div className="film-detail-mask"><p data-detail-line className="film-detail-credit">Written and directed by Leon Vasari. 監督作品</p></div>
              <div className="film-detail-mask"><button data-detail-line className="film-watch film-control" data-cursor-button type="button">WATCH THE FILM / 映画を見る</button></div>
            </div>
            <svg className="film-poster" viewBox="0 0 474 900" role="img" aria-label={`${film.title} poster`}>
              <defs>
                <clipPath id={`poster-clip-${film.id}`}><rect width="474" height="900" /></clipPath>
                <filter id={`poster-ink-filter-${film.id}`} x="-200" y="-200" width="874" height="1300" colorInterpolationFilters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="7" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <mask id={`poster-ink-mask-${film.id}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="1300">
                  <rect x="-200" y="-200" width="874" height="1300" fill="black" />
                  <g filter={`url(#poster-ink-filter-${film.id})`} fill="white">
                    {BLOB_POSITIONS.map(([cx, cy], index) => <circle key={index} ref={(node) => { blobRefs.current[index] = node; }} cx={cx} cy={cy} r="0" />)}
                  </g>
                </mask>
              </defs>
              <image {...coverImageGeometry(film.cover)} preserveAspectRatio="none" clipPath={`url(#poster-clip-${film.id})`} mask={`url(#poster-ink-mask-${film.id})`} />
            </svg>
          </div>
        </div>
      )}
      <div className="film-probe" aria-hidden="true" />
    </section>
  );
}

function sectionPointerCapture(section: HTMLElement, pointerId: number) {
  try { section.setPointerCapture(pointerId); } catch {}
}