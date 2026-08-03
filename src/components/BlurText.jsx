import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const linearEasing = (value) => value;

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  const keyframes = {};

  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });

  return keyframes;
};

export default function BlurText({
  as: Tag = "p",
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = linearEasing,
  onAnimationComplete,
  stepDuration = 0.35,
  triggerEvent = "",
}) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return undefined;
    }

    if (triggerEvent) {
      const handleTriggeredReveal = (event) => {
        setInView(event.detail?.active !== false);
      };

      window.addEventListener(triggerEvent, handleTriggeredReveal);
      const savedTriggerState = window.__blurTextTriggerState?.[triggerEvent];
      if (typeof savedTriggerState === "boolean") {
        setInView(savedTriggerState);
      }
      return () => window.removeEventListener(triggerEvent, handleTriggeredReveal);
    }

    let revealFrame = 0;
    const isVisiblyRevealed = () => {
      let current = element;
      while (current && current !== document.body) {
        if (Number.parseFloat(window.getComputedStyle(current).opacity) < 0.18) return false;
        current = current.parentElement;
      }
      return true;
    };

    const revealWhenVisible = () => {
      if (isVisiblyRevealed()) {
        setInView(true);
        return;
      }
      revealFrame = window.requestAnimationFrame(revealWhenVisible);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(element);
        revealWhenVisible();
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(revealFrame);
    };
  }, [threshold, rootMargin, triggerEvent]);

  const defaultFrom = useMemo(
    () => ({
      filter: "blur(10px)",
      opacity: 0,
      y: direction === "top" ? -50 : 50,
    }),
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const animateKeyframes = useMemo(
    () => buildKeyframes(fromSnapshot, toSnapshots),
    [fromSnapshot, toSnapshots],
  );
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from(
    { length: stepCount },
    (_, index) => (stepCount === 1 ? 0 : index / (stepCount - 1)),
  );

  return (
    <Tag ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
      {elements.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
          initial={fromSnapshot}
          animate={inView ? animateKeyframes : fromSnapshot}
          transition={{
            duration: totalDuration,
            times,
            delay: (index * delay) / 1000,
            ease: easing,
          }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {segment === " " ? "\u00A0" : segment}
          {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
        </motion.span>
      ))}
    </Tag>
  );
}
