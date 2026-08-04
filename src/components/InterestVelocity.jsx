import { useLayoutEffect, useMemo, useRef, useState } from "react";
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
  damping = 50,
  stiffness = 400,
  numCopies = 4,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  fontSize = "clamp(1.5rem, 4vw, 3.2rem)",
}) {
  const baseX = useMotionValue(0);
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

  useAnimationFrame((_time, delta) => {
    const factor = Math.min(6, Math.abs(velocityFactor.get()));
    const safeDelta = Math.min(Math.max(delta, 0), 50);
    const moveBy = velocity * (safeDelta / 1000) * (1 + factor);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <section
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
