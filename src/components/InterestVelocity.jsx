import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import "./InterestVelocity.css";

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    let mounted = true;
    const updateWidth = () => {
      if (mounted && ref.current) setWidth(ref.current.offsetWidth);
    };
    const observer = new ResizeObserver(updateWidth);

    updateWidth();
    observer.observe(element);
    document.fonts?.ready.then(updateWidth);

    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, [ref]);

  return width;
}

function wrap(min, max, value) {
  const range = max - min;
  if (!range) return min;
  return ((((value - min) % range) + range) % range) + min;
}

export default function InterestVelocity({
  text = "",
  highlightWords = [],
  highlightClass = "is-interest",
  velocity = -32,
  direction = "right",
  damping = 50,
  stiffness = 400,
  numCopies = 4,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  fontSize = "clamp(1.5rem, 4vw, 3.2rem)",
}) {
  const baseX = useMotionValue(0);
  const rootRef = useRef(null);
  const activeRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const copyRef = useRef(null);
  const copyWidth = useElementWidth(copyRef);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping.input,
    velocityMapping.output,
    { clamp: false },
  );
  const words = useMemo(
    () => text.split(",").map((word) => word.trim()).filter(Boolean),
    [text],
  );

  const x = useTransform(baseX, (value) => (
    copyWidth === 0 ? "0px" : `${wrap(-copyWidth, 0, value)}px`
  ));

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;
    const observer = new IntersectionObserver(
      ([entry]) => { activeRef.current = entry.isIntersecting && !document.hidden; },
      { rootMargin: "200px 0px" },
    );
    const onVisibilityChange = () => {
      activeRef.current = !document.hidden && root.getBoundingClientRect().bottom >= -200 && root.getBoundingClientRect().top <= window.innerHeight + 200;
    };
    const onMotionChange = (event) => { reducedMotionRef.current = event.matches; };
    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener?.("change", onMotionChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener?.("change", onMotionChange);
    };
  }, []);

  useAnimationFrame((_time, delta) => {
    if (!activeRef.current || reducedMotionRef.current) return;
    const factor = Math.min(6, Math.abs(velocityFactor.get()));
    const safeDelta = Math.min(Math.max(delta, 0), 50);
    // Keep the row's direction independent from scroll direction. Scrolling
    // only changes its speed, so reversing the page scroll cannot make this
    // row turn around and follow the Let's Connect marquee.
    const directionFactor = direction === "right" ? 1 : -1;
    const moveBy = directionFactor * Math.abs(velocity) * (safeDelta / 1000) * (1 + factor);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <section
      ref={rootRef}
      className="interest-velocity"
      style={{ "--interest-velocity-size": fontSize }}
      aria-label="Interests"
    >
      <div className="interest-velocity__viewport" aria-hidden="true">
        <motion.div className="interest-velocity__track" style={{ x }}>
          {Array.from({ length: numCopies }, (_, copyIndex) => (
            <span
              ref={copyIndex === 0 ? copyRef : null}
              className="interest-velocity__copy"
              key={copyIndex}
            >
              {words.map((word, wordIndex) => {
                const highlighted = highlightWords.some((highlight) => word.startsWith(highlight));
                return (
                  <span
                    className={`interest-velocity__word${highlighted ? ` ${highlightClass}` : ""}`}
                    key={`${copyIndex}-${word}-${wordIndex}`}
                  >
                    {word}
                  </span>
                );
              })}
            </span>
          ))}
        </motion.div>
      </div>
      <span className="sr-only">{text}</span>
    </section>
  );
}
