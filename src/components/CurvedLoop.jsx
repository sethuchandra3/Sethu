import { useEffect, useId, useMemo, useRef, useState } from "react";
import "./CurvedLoop.css";

export default function CurvedLoop({
  id,
  marqueeText = "",
  speed = 1,
  className,
  curveAmount = 120,
  direction = "left",
  interactive = false,
  ariaLabel = marqueeText,
}) {
  const text = useMemo(() => `${marqueeText.trimEnd()}\u00A0`, [marqueeText]);
  const measureRef = useRef(null);
  const textPathRef = useRef(null);
  const [spacing, setSpacing] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const uid = useId().replaceAll(":", "");
  const pathId = `curve-${uid}`;
  const pathD = `M0,34 Q560,${34 + curveAmount} 1560,34`;
  const dragRef = useRef(false);
  const lastXRef = useRef(0);
  const directionRef = useRef(direction);
  const velocityRef = useRef(0);

  const repeatedText = spacing
    ? Array(Math.ceil(1900 / spacing) + 2).fill(text).join("")
    : text;

  useEffect(() => {
    if (!measureRef.current) return;
    setSpacing(measureRef.current.getComputedTextLength());
  }, [className, text]);

  useEffect(() => {
    if (!spacing || !textPathRef.current) return;
    textPathRef.current.setAttribute("startOffset", "0px");
  }, [spacing]);

  useEffect(() => {
    const element = textPathRef.current?.closest(".curved-loop");
    if (!spacing || !element) return undefined;
    let startTimer = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        textPathRef.current?.setAttribute("startOffset", "0px");
        startTimer = window.setTimeout(() => setHasEntered(true), 700);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => {
      window.clearTimeout(startTimer);
      observer.disconnect();
    };
  }, [spacing]);

  useEffect(() => {
    if (!spacing || !hasEntered) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    let frame = 0;
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const delta = directionRef.current === "right" ? speed : -speed;
        const current = Number.parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
        let next = current + delta;
        if (next <= -spacing) next += spacing;
        if (next > 0) next -= spacing;
        textPathRef.current.setAttribute("startOffset", `${next}px`);
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [hasEntered, spacing, speed]);

  const onPointerDown = (event) => {
    if (!interactive) return;
    dragRef.current = true;
    setDragging(true);
    lastXRef.current = event.clientX;
    velocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!interactive || !dragRef.current || !textPathRef.current || !spacing) return;
    const delta = event.clientX - lastXRef.current;
    lastXRef.current = event.clientX;
    velocityRef.current = delta;
    const current = Number.parseFloat(textPathRef.current.getAttribute("startOffset") || "0");
    let next = current + delta;
    if (next <= -spacing) next += spacing;
    if (next > 0) next -= spacing;
    textPathRef.current.setAttribute("startOffset", `${next}px`);
  };

  const endDrag = () => {
    if (!interactive) return;
    dragRef.current = false;
    setDragging(false);
    directionRef.current = velocityRef.current > 0 ? "right" : "left";
  };

  return (
    <div
      id={id}
      className="curved-loop"
      role="heading"
      aria-level="2"
      aria-label={ariaLabel}
      data-interactive={interactive ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      style={{ visibility: spacing ? "visible" : "hidden" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <svg className="curved-loop__svg" viewBox="0 0 1440 180" aria-hidden="true">
        <text ref={measureRef} className={className} style={{ visibility: "hidden" }}>
          {text}
        </text>
        <defs>
          <path id={pathId} d={pathD} fill="none" />
        </defs>
        {spacing > 0 && (
          <text className={className}>
            <textPath ref={textPathRef} href={`#${pathId}`}>
              {repeatedText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  );
}
