import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./CursorDot.css";

gsap.registerPlugin(useGSAP);

const INTERACTIVE_SELECTOR =
  'a, button, input, textarea, select, [role="button"], [tabindex]:not([tabindex="-1"])';

export default function CursorDot() {
  const cursorRef = useRef(null);

  useGSAP(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!cursor || !finePointer.matches) return undefined;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("has-dot-cursor");
    gsap.set(cursor, { x: -100, y: -100 });

    const xTo = gsap.quickTo(cursor, "x", {
      duration: reducedMotion ? 0 : 0.16,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: reducedMotion ? 0 : 0.16,
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
      const suppressed = Boolean(target?.closest("[data-cursor-label]"));
      cursor.dataset.visible = suppressed ? "false" : "true";
      cursor.dataset.interactive = target?.closest(INTERACTIVE_SELECTOR) ? "true" : "false";
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
      root.classList.remove("has-dot-cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("mouseout", handleWindowMouseOut);
      window.removeEventListener("blur", hideCursor);
    };
  }, { scope: cursorRef });

  return (
    <div
      ref={cursorRef}
      className="cursor-dot"
      data-visible="false"
      data-interactive="false"
      data-pressed="false"
      aria-hidden="true"
    >
      <span className="cursor-dot__core" />
    </div>
  );
}
