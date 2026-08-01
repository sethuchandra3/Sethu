import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import "./DecryptedText.css";

const DEFAULT_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

function makeRevealOrder(length, direction) {
  if (direction === "end") return Array.from({ length }, (_, index) => length - index - 1);
  if (direction === "center") {
    const middle = Math.floor((length - 1) / 2);
    return Array.from({ length }, (_, index) => {
      if (index === 0) return middle;
      const distance = Math.ceil(index / 2);
      return index % 2 ? middle + distance : middle - distance;
    }).filter((index) => index >= 0 && index < length);
  }
  return Array.from({ length }, (_, index) => index);
}

export default function DecryptedText({
  text = "",
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = DEFAULT_CHARACTERS,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  ...props
}) {
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const [displayText, setDisplayText] = useState(text);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const availableCharacters = useMemo(() => {
    if (!useOriginalCharsOnly) return [...characters];
    return [...new Set([...text].filter((character) => character !== " "))];
  }, [characters, text, useOriginalCharsOnly]);

  const scrambleText = useCallback(
    (revealed) =>
      [...text]
        .map((character, index) => {
          if (character === " " || revealed.has(index)) return character;
          return availableCharacters[Math.floor(Math.random() * availableCharacters.length)] || character;
        })
        .join(""),
    [availableCharacters, text]
  );

  const startAnimation = useCallback(() => {
    window.clearInterval(intervalRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayText(text);
      setRevealedIndices(new Set([...text].map((_, index) => index)));
      return;
    }

    const revealOrder = makeRevealOrder(text.length, revealDirection);
    let pointer = 0;
    let iteration = 0;
    let revealed = new Set();
    setRevealedIndices(revealed);
    setDisplayText(scrambleText(revealed));
    setIsAnimating(true);

    intervalRef.current = window.setInterval(() => {
      if (sequential && pointer < revealOrder.length) {
        revealed = new Set(revealed);
        revealed.add(revealOrder[pointer]);
        pointer += 1;
        setRevealedIndices(revealed);
        setDisplayText(scrambleText(revealed));
      } else if (!sequential && iteration < maxIterations) {
        setDisplayText(scrambleText(revealed));
        iteration += 1;
      } else {
        window.clearInterval(intervalRef.current);
        setDisplayText(text);
        setRevealedIndices(new Set([...text].map((_, index) => index)));
        setIsAnimating(false);
      }
    }, speed);
  }, [maxIterations, revealDirection, scrambleText, sequential, speed, text]);

  useEffect(() => {
    if (animateOn !== "view") return undefined;
    const element = containerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;
        startAnimation();
        observer.disconnect();
      },
      { threshold: 0.22 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animateOn, startAnimation]);

  useEffect(() => () => window.clearInterval(intervalRef.current), []);

  const hoverProps =
    animateOn === "hover"
      ? {
          onMouseEnter: startAnimation,
          onMouseLeave: () => {
            window.clearInterval(intervalRef.current);
            setDisplayText(text);
            setIsAnimating(false);
          },
        }
      : {};

  return (
    <motion.span
      ref={containerRef}
      className={`decrypted-text ${parentClassName}`.trim()}
      {...hoverProps}
      {...props}
    >
      <span className="decrypted-text__sr-only">{text}</span>
      <span aria-hidden="true">
        {[...displayText].map((character, index) => (
          <span
            className={
              revealedIndices.has(index) || !isAnimating ? className : encryptedClassName
            }
            key={index}
          >
            {character}
          </span>
        ))}
      </span>
    </motion.span>
  );
}
