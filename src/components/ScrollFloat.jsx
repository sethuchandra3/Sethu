import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollFloat({
  as: Tag = "h2",
  id,
  children,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "top 88%",
  scrollEnd = "top 42%",
  stagger = 0.045,
  once = false,
  preserveShape = false,
}) {
  const containerRef = useRef(null);
  const characters = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return [...text].map((character, index) =>
      character === "\n" ? (
        <br key={`line-break-${index}`} />
      ) : (
        <span className="scroll-float__char" key={`${character}-${index}`}>
          {character === " " ? "\u00A0" : character}
        </span>
      ),
    );
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

      const scrollTrigger = once
        ? {
            trigger: element,
            start: scrollStart,
            once: true,
            toggleActions: "play none none none",
            invalidateOnRefresh: true,
            refreshPriority: -10,
          }
        : {
            trigger: element,
            start: scrollStart,
            end: scrollEnd,
            scrub: 0.8,
            invalidateOnRefresh: true,
            refreshPriority: -10,
          };

      gsap.fromTo(
        characterElements,
        {
          willChange: "opacity, transform",
          opacity: 0,
          yPercent: preserveShape ? (once ? 52 : 72) : once ? 72 : 120,
          scaleY: preserveShape ? 1 : once ? 1.55 : 2.3,
          scaleX: preserveShape ? 1 : once ? 0.84 : 0.7,
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
          scrollTrigger,
        }
      );
    }, containerRef);

    return () => context.revert();
  }, [animationDuration, ease, once, preserveShape, scrollEnd, scrollStart, stagger]);

  return (
    <Tag id={id} ref={containerRef} className={`scroll-float ${containerClassName}`.trim()}>
      <span className={`scroll-float__text ${textClassName}`.trim()}>{characters}</span>
    </Tag>
  );
}
