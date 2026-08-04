import { useEffect, useRef } from "react";
import "./FluidGlassCursor.css";

export default function FluidGlassCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!cursor || !finePointer.matches) return undefined;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let hasPosition = false;
    let frame = 0;

    root.classList.add("has-fluid-glass-cursor");

    const renderPosition = () => {
      frame = 0;
      const easing = reducedMotion ? 1 : 0.42;
      currentX += (targetX - currentX) * easing;
      currentY += (targetY - currentY) * easing;
      cursor.style.setProperty("--cursor-x", `${currentX}px`);
      cursor.style.setProperty("--cursor-y", `${currentY}px`);

      if (Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08) {
        frame = window.requestAnimationFrame(renderPosition);
      }
    };

    const requestPositionRender = () => {
      if (!frame) frame = window.requestAnimationFrame(renderPosition);
    };

    const hideCursor = () => {
      cursor.dataset.visible = "false";
      cursor.dataset.header = "false";
      cursor.dataset.pressed = "false";
      cursor.dataset.glassActive = "false";
      hasPosition = false;
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") {
        hideCursor();
        return;
      }

      targetX = event.clientX;
      targetY = event.clientY;
      if (!hasPosition) {
        currentX = targetX;
        currentY = targetY;
        hasPosition = true;
      }
      const target = event.target instanceof Element ? event.target : null;
      cursor.dataset.header = target?.closest(".site-header") ? "true" : "false";
      cursor.dataset.glassActive = target?.closest(".project-masonry__media") ? "true" : "false";
      cursor.dataset.visible = "true";
      requestPositionRender();
    };

    const handlePointerDown = () => {
      cursor.dataset.pressed = "true";
    };

    const handlePointerUp = () => {
      cursor.dataset.pressed = "false";
    };

    const handleWindowMouseOut = (event) => {
      if (!event.relatedTarget) hideCursor();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("mouseout", handleWindowMouseOut);
    window.addEventListener("blur", hideCursor);

    return () => {
      window.cancelAnimationFrame(frame);
      root.classList.remove("has-fluid-glass-cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("mouseout", handleWindowMouseOut);
      window.removeEventListener("blur", hideCursor);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fluid-glass-cursor"
      data-visible="false"
      data-header="false"
      data-pressed="false"
      data-glass-active="false"
      aria-hidden="true"
    >
      <span className="fluid-glass-cursor__dot" />
    </div>
  );
}
