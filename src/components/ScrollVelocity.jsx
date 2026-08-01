import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import "./ScrollVelocity.css";

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const updateWidth = () => setWidth(element.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

const wrap = (min, max, value) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

function VelocityRow({ children, baseVelocity, numCopies, damping, stiffness, velocityMapping, variant }) {
  const rowRef = useRef(null);
  const copyRef = useRef(null);
  const baseX = useMotionValue(0);
  const copyWidth = useElementWidth(copyRef);
  const isInView = useInView(rowRef, { margin: "180px 0px" });
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping.input,
    velocityMapping.output,
    { clamp: false },
  );
  const direction = useRef(1);

  const x = useTransform(baseX, (value) =>
    copyWidth === 0 ? "0px" : `${wrap(-copyWidth, 0, value)}px`,
  );

  useAnimationFrame((_, delta) => {
    if (!isInView || reducedMotion || copyWidth === 0) return;

    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    if (factor > 0) direction.current = 1;

    const baseMove = direction.current * baseVelocity * (delta / 1000);
    baseX.set(baseX.get() + baseMove * (1 + Math.abs(factor)));
  });

  return (
    <div ref={rowRef} className={`scroll-velocity__row is-${variant}`} aria-hidden="true">
      <motion.div className="scroll-velocity__track" style={{ x }}>
        {Array.from({ length: numCopies }, (_, index) => (
          <span ref={index === 0 ? copyRef : null} className="scroll-velocity__copy" key={index}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({
  texts = [],
  velocity = 30,
  damping = 50,
  stiffness = 300,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 2.4] },
}) {
  return (
    <div className="scroll-velocity">
      <div className="sr-only">{texts.join(". ")}</div>
      {texts.map((text, index) => (
        <VelocityRow
          key={text}
          baseVelocity={index % 2 === 0 ? velocity : -velocity}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          variant={index === 0 ? "primary" : "secondary"}
        >
          {text}
        </VelocityRow>
      ))}
    </div>
  );
}
