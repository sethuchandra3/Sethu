import { useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}) {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    if (typeof children !== "string") return children;

    const text = children;
    return text.split(/(\s+)/).map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      return (
        <span className="scroll-reveal__word" key={`${word}-${index}`}>
          {word}
        </span>
      );
    });
  }, [children]);

  useGSAP(() => {
    const element = containerRef.current;
    if (!element) return;

    const scroller = scrollContainerRef?.current || window;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = element.querySelectorAll(".scroll-reveal__word");

    if (reduceMotion) {
      gsap.set(element, { rotation: 0 });
      gsap.set(words, {
        opacity: 1,
        filter: "blur(0px)",
      });
      return;
    }

    gsap.set(element, { transformOrigin: "0% 50%", rotation: baseRotation });
    gsap.set(words, {
      opacity: baseOpacity,
      filter: enableBlur ? `blur(${blurStrength}px)` : "blur(0px)",
      willChange: enableBlur ? "opacity, filter" : "opacity",
    });

    gsap.to(element, {
      rotation: 0,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        scroller,
        start: "top bottom",
        end: rotationEnd,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    gsap.to(words, {
      opacity: 1,
      ease: "none",
      stagger: 0.05,
      scrollTrigger: {
        trigger: element,
        scroller,
        start: "top bottom-=20%",
        end: wordAnimationEnd,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    if (enableBlur) {
      gsap.to(words, {
        filter: "blur(0px)",
        ease: "none",
        stagger: 0.05,
        scrollTrigger: {
          trigger: element,
          scroller,
          start: "top bottom-=20%",
          end: wordAnimationEnd,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }

    let disposed = false;
    let refreshFrame = 0;
    const scheduleRefresh = () => {
      window.cancelAnimationFrame(refreshFrame);
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = window.requestAnimationFrame(() => {
          if (disposed) return;
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
      });
    };

    const resizeObserver = new ResizeObserver(scheduleRefresh);
    resizeObserver.observe(element);
    window.addEventListener("load", scheduleRefresh, { once: true });
    window.addEventListener("portfolio:layout-change", scheduleRefresh);
    document.fonts?.ready.then(() => {
      if (!disposed) scheduleRefresh();
    });
    scheduleRefresh();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(refreshFrame);
      resizeObserver.disconnect();
      window.removeEventListener("load", scheduleRefresh);
      window.removeEventListener("portfolio:layout-change", scheduleRefresh);
    };
  }, {
    dependencies: [
      scrollContainerRef,
      enableBlur,
      baseRotation,
      baseOpacity,
      rotationEnd,
      wordAnimationEnd,
      blurStrength,
    ],
    scope: containerRef,
    revertOnUpdate: true,
  });

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`.trim()}>
      <div className={`scroll-reveal-text ${textClassName}`.trim()}>{splitText}</div>
    </div>
  );
}
