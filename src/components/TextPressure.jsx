import { useEffect, useRef } from "react";
import robotoFlexUrl from "@fontsource-variable/roboto-flex/files/roboto-flex-latin-full-normal.woff2?url";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const RESTING_WEIGHT = 620;
const MIN_HOVER_WEIGHT = 340;
const MAX_HOVER_WEIGHT = 940;

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
    let letterMetrics = [];
    let strength = 0;
    let targetStrength = 0;
    let frameId = 0;
    let resizeFrameId = 0;
    let disposed = false;

    const centerPointer = (immediate = false) => {
      const rect = title.getBoundingClientRect();
      pointer.x = rect.left + rect.width / 2;
      pointer.y = rect.top + rect.height / 2;

      if (immediate) {
        easedPointer.x = pointer.x;
        easedPointer.y = pointer.y;
      }
    };

    const resetLetter = (letter) => {
      letter.style.fontVariationSettings = `'opsz' 144, 'wght' ${RESTING_WEIGHT}, 'wdth' 86, 'slnt' 0`;
    };

    const measureLetters = () => {
      strength = 0;
      targetStrength = 0;

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
      strength += (targetStrength - strength) / 10;

      const titleRect = title.getBoundingClientRect();
      const maxDistance = Math.max(titleRect.width * 0.5, 180);

      letters.forEach((letter, index) => {
        const metric = letterMetrics[index];
        if (!metric) return;

        const centerX = titleRect.left + metric.centerX;
        const centerY = titleRect.top + metric.centerY;
        const distance = Math.hypot(easedPointer.x - centerX, easedPointer.y - centerY);
        const proximity = Math.pow(clamp(1 - distance / maxDistance, 0, 1), 1.35);
        const hoverWeight = MIN_HOVER_WEIGHT + proximity * (MAX_HOVER_WEIGHT - MIN_HOVER_WEIGHT);
        const activeStrength = reducedMotion ? 0 : strength;
        const weight = Math.round(
          RESTING_WEIGHT + (hoverWeight - RESTING_WEIGHT) * activeStrength,
        );
        letter.style.fontVariationSettings = `'opsz' 144, 'wght' ${weight}, 'wdth' 86, 'slnt' 0`;
      });

      frameId = window.requestAnimationFrame(animate);
    };

    const handlePointerEnter = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      targetStrength = 1;
    };

    const handlePointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const handlePointerLeave = () => {
      targetStrength = 0;
      centerPointer(false);
    };

    const handleResize = () => {
      window.cancelAnimationFrame(resizeFrameId);
      resizeFrameId = window.requestAnimationFrame(measureLetters);
    };

    const start = async () => {
      await document.fonts?.ready;
      if (disposed) return;

      measureLetters();
      title.addEventListener("pointerenter", handlePointerEnter);
      title.addEventListener("pointermove", handlePointerMove);
      title.addEventListener("pointerleave", handlePointerLeave);
      window.addEventListener("resize", handleResize);
      animate();
    };

    start();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(resizeFrameId);
      title.removeEventListener("pointerenter", handlePointerEnter);
      title.removeEventListener("pointermove", handlePointerMove);
      title.removeEventListener("pointerleave", handlePointerLeave);
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
