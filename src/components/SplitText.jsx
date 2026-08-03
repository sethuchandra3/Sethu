import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(GSAPSplitText, useGSAP);

export default function SplitText({
  text,
  active = true,
  className = "",
  delay = 8,
  duration = 0.58,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 14 },
  to = { opacity: 1, y: 0 },
  startDelay = 0.34,
  textAlign = "left",
  tag = "p",
  onLetterAnimationComplete,
}) {
  const ref = useRef(null);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    let mounted = true;
    const markFontsLoaded = () => {
      if (mounted) setFontsLoaded(true);
    };

    if (document.fonts?.status === "loaded") markFontsLoaded();
    else document.fonts?.ready.then(markFontsLoaded);

    return () => {
      mounted = false;
    };
  }, []);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || !text || !fontsLoaded) return undefined;

      const split = new GSAPSplitText(element, {
        type: splitType,
        smartWrap: true,
        wordsClass: "split-word",
        charsClass: "split-char",
        linesClass: "split-line",
        reduceWhiteSpace: false,
      });

      const targets = splitType.includes("chars") && split.chars.length
        ? split.chars
        : splitType.includes("words") && split.words.length
          ? split.words
          : split.lines;

      if (!active) {
        gsap.set(targets, from);
      } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(targets, to);
      } else {
        gsap.fromTo(targets, from, {
          ...to,
          delay: startDelay,
          duration,
          ease,
          stagger: delay / 1000,
          force3D: true,
          willChange: "transform, opacity",
          onComplete: () => onCompleteRef.current?.(),
        });
      }

      return () => split.revert();
    },
    {
      dependencies: [
        active,
        text,
        delay,
        duration,
        ease,
        splitType,
        startDelay,
        fontsLoaded,
        JSON.stringify(from),
        JSON.stringify(to),
      ],
      scope: ref,
      revertOnUpdate: true,
    },
  );

  const Tag = tag || "p";
  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`.trim()}
      style={{ textAlign, overflow: "hidden", whiteSpace: "normal", overflowWrap: "break-word" }}
    >
      {text}
    </Tag>
  );
}
