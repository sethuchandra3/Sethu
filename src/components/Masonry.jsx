import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./Masonry.css";

gsap.registerPlugin(useGSAP);

const COLUMN_QUERIES = [
  "(min-width: 700px)",
];
const COLUMN_VALUES = [2];

function useMedia(queries, values, defaultValue) {
  const getValue = () => {
    if (typeof window === "undefined") return defaultValue;
    const matchIndex = queries.findIndex((query) => window.matchMedia(query).matches);
    return values[matchIndex] ?? defaultValue;
  };

  const [value, setValue] = useState(getValue);

  useEffect(() => {
    const mediaQueries = queries.map((query) => window.matchMedia(query));
    const updateValue = () => setValue(getValue());

    mediaQueries.forEach((query) => query.addEventListener("change", updateValue));
    return () => mediaQueries.forEach((query) => query.removeEventListener("change", updateValue));
  }, [queries, values, defaultValue]);

  return value;
}

function useMeasure() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

const preloadImages = (urls) =>
  Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const image = new Image();
          image.src = src;
          image.onload = image.onerror = resolve;
        }),
    ),
  );

export default function Masonry({
  items,
  ease = "power3.out",
  duration = 0.65,
  stagger = 0.07,
  animateFrom = "bottom",
  scaleOnHover = true,
  hoverScale = 0.975,
  blurToFocus = true,
}) {
  const columns = useMedia(COLUMN_QUERIES, COLUMN_VALUES, 1);
  const [containerRef, width] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    let active = true;
    preloadImages(items.map((item) => item.img)).then(() => {
      if (active) setImagesReady(true);
    });
    return () => {
      active = false;
    };
  }, [items]);

  const { grid, height } = useMemo(() => {
    if (!width) return { grid: [], height: 0 };

    const gap = width >= 700 ? 14 : 12;
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);

    const nextGrid = items.map((item) => {
      const column = columnHeights.indexOf(Math.min(...columnHeights));
      const itemHeight = item.height;
      const x = column * (columnWidth + gap);
      const y = columnHeights[column];
      columnHeights[column] += itemHeight + gap;
      return { ...item, x, y, w: columnWidth, h: itemHeight };
    });

    return {
      grid: nextGrid,
      height: Math.max(...columnHeights, 0) - gap,
    };
  }, [columns, items, width]);

  useEffect(() => {
    if (!imagesReady || !height) return undefined;
    const frame = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("portfolio:layout-change"));
    });
    return () => cancelAnimationFrame(frame);
  }, [height, imagesReady]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !imagesReady || grid.length === 0) return undefined;

    const context = gsap.context(() => {
      grid.forEach((item, index) => {
        const element = container.querySelector(`[data-project-key="${item.id}"]`);
        if (!element) return;

        const destination = { x: item.x, y: item.y };

        if (!hasMounted.current) {
          const offsets = {
            top: { x: item.x, y: item.y - 120 },
            bottom: { x: item.x, y: item.y + 120 },
            left: { x: item.x - 120, y: item.y },
            right: { x: item.x + 120, y: item.y },
            center: { x: width / 2 - item.w / 2, y: height / 2 - item.h / 2 },
          };

          gsap.fromTo(
            element,
            {
              opacity: 0,
              ...(offsets[animateFrom] ?? offsets.bottom),
            },
            {
              opacity: 1,
              ...destination,
              duration: 0.8,
              ease: "power3.out",
              delay: index * stagger,
            },
          );
        } else {
          gsap.to(element, { ...destination, duration, ease, overwrite: "auto" });
        }
      });
    }, container);

    hasMounted.current = true;
    return () => context.revert();
  }, [animateFrom, duration, ease, grid, height, imagesReady, stagger, width]);

  const setHoverScale = (element, scale) => {
    if (!scaleOnHover) return;
    gsap.to(element, { scale, duration: 0.3, ease: "power2.out", overwrite: "auto" });
  };

  return (
    <div
      ref={containerRef}
      className="project-masonry"
      style={{ height: height ? `${height}px` : "420px" }}
      aria-label="Project gallery"
    >
      {grid.map((item) => {
        const ItemTag = item.href ? "a" : "article";

        return (
          <ItemTag
            key={item.id}
            data-project-key={item.id}
            data-cursor-label={item.cursorLabel || "View case study"}
            className="project-masonry__item"
            style={{ width: `${item.w}px`, height: `${item.h}px` }}
            href={item.href}
            target={item.href ? "_blank" : undefined}
            rel={item.href ? "noreferrer" : undefined}
            aria-label={item.href ? `${item.title}, visit website (opens in a new tab)` : undefined}
            onMouseEnter={(event) => {
              setHoverScale(event.currentTarget, hoverScale);
            }}
            onMouseLeave={(event) => {
              setHoverScale(event.currentTarget, 1);
            }}
          >
            <img src={item.img} alt="" loading="lazy" />
            <div className="project-masonry__scrim" aria-hidden="true" />
            <div className="project-masonry__content">
              <p>{item.category}</p>
              <h3>{item.title}</h3>
              <span>{item.description}</span>
            </div>
          </ItemTag>
        );
      })}
    </div>
  );
}
