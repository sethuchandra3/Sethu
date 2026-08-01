import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollFloat({
  id,
  children,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "top 88%",
  scrollEnd = "top 42%",
  stagger = 0.045,
}) {
  const containerRef = useRef(null);
  const characters = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return [...text].map((character, index) => (
      <span className="scroll-float__char" key={`${character}-${index}`}>
        {character === " " ? "\u00A0" : character}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const context = gsap.context(() => {
      const characterElements = element.querySelectorAll(".scroll-float__char");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(characterElements, { opacity: 1, clearProps: "transform" });
        return;
      }

      gsap.fromTo(
        characterElements,
        {
          willChange: "opacity, transform",
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: "50% 0%",
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger,
          scrollTrigger: {
            trigger: element,
            start: scrollStart,
            end: scrollEnd,
            scrub: 0.8,
            invalidateOnRefresh: true,
            refreshPriority: -10,
          },
        }
      );
    }, containerRef);

    return () => context.revert();
  }, [animationDuration, ease, scrollEnd, scrollStart, stagger]);

  return (
    <h2 id={id} ref={containerRef} className={`scroll-float ${containerClassName}`.trim()}>
      <span className={`scroll-float__text ${textClassName}`.trim()}>{characters}</span>
    </h2>
  );
}
