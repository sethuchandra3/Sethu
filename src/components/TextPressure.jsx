import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import robotoFlexUrl from "@fontsource-variable/roboto-flex/files/roboto-flex-latin-full-normal.woff2?url";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const RESTING_WEIGHT = 620;
const RESTING_WIDTH = 86;
const MIN_PRESSURE_WEIGHT = 280;
const MAX_PRESSURE_WEIGHT = 980;

export default function TextPressure({ text, id, className = "" }) {
  const titleRef = useRef(null);
  const lettersRef = useRef([]);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return undefined;

    const letters = lettersRef.current.filter(Boolean);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0 };
    const easedPointer = { x: 0, y: 0 };
    const scrollPointer = { x: 0, y: 0 };
    const easedScrollPointer = { x: 0, y: 0 };
    let letterMetrics = [];
    let hoverStrength = 0;
    let targetHoverStrength = 0;
    let scrollStrength = 0;
    let targetScrollStrength = 0;
    let frameId = 0;
    let resizeFrameId = 0;
    let disposed = false;
    let pressureTrigger;

    const centerPointer = (immediate = false) => {
      const rect = title.getBoundingClientRect();
      pointer.x = rect.left + rect.width / 2;
      pointer.y = rect.top + rect.height / 2;

      if (immediate) {
        easedPointer.x = pointer.x;
        easedPointer.y = pointer.y;
        scrollPointer.x = pointer.x;
        scrollPointer.y = pointer.y;
        easedScrollPointer.x = pointer.x;
        easedScrollPointer.y = pointer.y;
      }
    };

    const resetLetter = (letter) => {
      letter.style.fontVariationSettings = `'opsz' 144, 'wght' ${RESTING_WEIGHT}, 'wdth' ${RESTING_WIDTH}, 'slnt' 0`;
    };

    const measureLetters = () => {
      hoverStrength = 0;
      targetHoverStrength = 0;
      scrollStrength = 0;
      targetScrollStrength = 0;

      letters.forEach((letter) => {
        letter.style.width = "auto";
        resetLetter(letter);
      });

      const titleRect = title.getBoundingClientRect();
      letterMetrics = letters.map((letter) => {
        const rect = letter.getBoundingClientRect();

        return {
          centerX: rect.left - titleRect.left + rect.width / 2,
          centerY: rect.top - titleRect.top + rect.height / 2,
          width: rect.width,
        };
      });

      letters.forEach((letter, index) => {
        letter.style.width = `${letterMetrics[index].width}px`;
      });

      centerPointer(true);
    };

    const animate = () => {
      easedPointer.x += (pointer.x - easedPointer.x) / 8;
      easedPointer.y += (pointer.y - easedPointer.y) / 8;
      easedScrollPointer.x += (scrollPointer.x - easedScrollPointer.x) / 6;
      easedScrollPointer.y += (scrollPointer.y - easedScrollPointer.y) / 6;
      hoverStrength += (targetHoverStrength - hoverStrength) / 7;
      scrollStrength += (targetScrollStrength - scrollStrength) / 7;

      const titleRect = title.getBoundingClientRect();
      const maxDistance = Math.max(titleRect.width * 0.38, 150);
      const useHoverPressure = hoverStrength >= scrollStrength;
      const activePointer = useHoverPressure ? easedPointer : easedScrollPointer;
      const activeStrength = reducedMotion
        ? 0
        : clamp(Math.max(hoverStrength, scrollStrength), 0, 1.15);

      letters.forEach((letter, index) => {
        const metric = letterMetrics[index];
        if (!metric) return;

        const centerX = titleRect.left + metric.centerX;
        const centerY = titleRect.top + metric.centerY;
        const distance = Math.hypot(activePointer.x - centerX, activePointer.y - centerY);
        const proximity = Math.pow(clamp(1 - distance / maxDistance, 0, 1), 1.18);
        const pressureWeight = MIN_PRESSURE_WEIGHT + proximity * (MAX_PRESSURE_WEIGHT - MIN_PRESSURE_WEIGHT);
        const pressureWidth = 64 + proximity * 68;
        const horizontalOffset = clamp((activePointer.x - centerX) / maxDistance, -1, 1);
        const weight = Math.round(
          RESTING_WEIGHT + (pressureWeight - RESTING_WEIGHT) * activeStrength,
        );
        const width = Math.round(
          RESTING_WIDTH + (pressureWidth - RESTING_WIDTH) * activeStrength,
        );
        const slant = Math.round(horizontalOffset * -7 * activeStrength * 10) / 10;
        letter.style.fontVariationSettings = `'opsz' 144, 'wght' ${weight}, 'wdth' ${width}, 'slnt' ${slant}`;
      });

      if (
        targetHoverStrength === 0 &&
        targetScrollStrength === 0 &&
        hoverStrength < 0.002 &&
        scrollStrength < 0.002
      ) {
        hoverStrength = 0;
        scrollStrength = 0;
        letters.forEach(resetLetter);
        frameId = 0;
        return;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    const ensureAnimation = () => {
      if (!frameId) frameId = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      const rect = title.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      pointer.x = event.clientX;
      pointer.y = event.clientY;
      targetHoverStrength = isInside ? 1.15 : 0;

      if (!isInside) centerPointer(false);
      ensureAnimation();
    };

    const handleWindowBlur = () => {
      targetHoverStrength = 0;
      centerPointer(false);
      ensureAnimation();
    };

    const handleResize = () => {
      window.cancelAnimationFrame(resizeFrameId);
      resizeFrameId = window.requestAnimationFrame(measureLetters);
    };

    const start = () => {
      measureLetters();
      const section = title.closest(".experiences-section") || title;
      pressureTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top 90%",
        end: "top 20%",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = clamp(self.progress, 0, 1);
          const rect = title.getBoundingClientRect();
          targetScrollStrength = Math.sin(progress * Math.PI) * 1.08;
          scrollPointer.x = rect.left + rect.width * (0.06 + progress * 0.88);
          scrollPointer.y = rect.top + rect.height / 2;
          ensureAnimation();
        },
        onLeave: () => {
          targetScrollStrength = 0;
          ensureAnimation();
        },
        onLeaveBack: () => {
          targetScrollStrength = 0;
          ensureAnimation();
        },
      });
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("blur", handleWindowBlur);
      window.addEventListener("resize", handleResize);

      document.fonts?.ready.then(() => {
        if (!disposed) {
          measureLetters();
          ScrollTrigger.refresh();
        }
      });
    };

    start();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(resizeFrameId);
      pressureTrigger?.kill();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("resize", handleResize);
    };
  }, [text]);

  return (
    <>
      <style>{`
        @font-face {
          font-family: "Roboto Flex Portfolio";
          src: url("${robotoFlexUrl}") format("woff2-variations");
          font-style: oblique 0deg 10deg;
          font-weight: 100 1000;
          font-stretch: 25% 151%;
          font-display: swap;
        }
      `}</style>
      <h2 ref={titleRef} id={id} className={className} aria-label={text}>
        {[...text].map((character, index) => (
          <span
            key={`${character}-${index}`}
            ref={(element) => {
              lettersRef.current[index] = element;
            }}
            className="text-pressure-letter"
            data-char={character}
            aria-hidden="true"
          >
            {character === " " ? "\u00A0" : character}
          </span>
        ))}
      </h2>
    </>
  );
}
