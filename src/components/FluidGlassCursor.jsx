import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./FluidGlassCursor.css";

gsap.registerPlugin(useGSAP);

export default function FluidGlassCursor() {
  const cursorRef = useRef(null);

  useGSAP(
    () => {
      const cursor = cursorRef.current;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (!cursor || !finePointer.matches) return undefined;

      const root = document.documentElement;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      root.classList.add("has-fluid-glass-cursor");
      gsap.set(cursor, { x: -100, y: -100 });

      const xTo = gsap.quickTo(cursor, "x", {
        duration: reducedMotion ? 0 : 0.18,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(cursor, "y", {
        duration: reducedMotion ? 0 : 0.18,
        ease: "power3.out",
      });

      const hideCursor = () => {
        cursor.dataset.visible = "false";
        cursor.dataset.pressed = "false";
      };

      const handlePointerMove = (event) => {
        if (event.pointerType === "touch") {
          hideCursor();
          return;
        }

        const target = event.target instanceof Element ? event.target : null;
        const overProject = Boolean(target?.closest(".project-masonry__item[data-cursor-label]"));
        cursor.dataset.visible = "true";
        cursor.dataset.project = overProject ? "true" : "false";
        xTo(event.clientX);
        yTo(event.clientY);
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
        root.classList.remove("has-fluid-glass-cursor");
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("mouseout", handleWindowMouseOut);
        window.removeEventListener("blur", hideCursor);
      };
    },
    { scope: cursorRef },
  );

  return (
    <div
      ref={cursorRef}
      className="fluid-glass-cursor"
      data-visible="false"
      data-project="false"
      data-pressed="false"
      aria-hidden="true"
    >
      <span className="fluid-glass-cursor__lens">
        <span className="fluid-glass-cursor__label">View</span>
      </span>
    </div>
  );
}
