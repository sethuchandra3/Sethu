import { useEffect, useRef } from "react";
import "./FluidGlassCursor.css";

export default function FluidGlassCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!cursor) return undefined;

    const root = document.documentElement;
    let targetX = -100;
    let targetY = -100;
    let hasPosition = false;
    let frame = 0;
    let listening = false;

    const renderPosition = () => {
      frame = 0;
      cursor.style.setProperty("--cursor-x", `${targetX}px`);
      cursor.style.setProperty("--cursor-y", `${targetY}px`);
      if (hasPosition) {
        syncCursorMode(document.elementFromPoint(targetX, targetY));
      }
    };

    const requestPositionRender = () => {
      if (!frame) frame = window.requestAnimationFrame(renderPosition);
    };

    const hideCursor = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      cursor.dataset.visible = "false";
      cursor.dataset.header = "false";
      cursor.dataset.pressed = "false";
      cursor.dataset.glassActive = "false";
      hasPosition = false;
    };

    const syncCursorMode = target => {
      const projectMedia = target?.closest(".project-masonry__media");
      const projectGallery = projectMedia?.closest(".projects-editorial-gallery");
      cursor.dataset.header = target?.closest(".site-header") ? "true" : "false";
      cursor.dataset.glassActive = projectMedia && projectGallery?.dataset.glassReady === "true" ? "true" : "false";
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") {
        hideCursor();
        return;
      }

      const coalescedEvents = event.getCoalescedEvents?.();
      const latestEvent = coalescedEvents?.length
        ? coalescedEvents[coalescedEvents.length - 1]
        : event;
      targetX = latestEvent.clientX;
      targetY = latestEvent.clientY;
      if (!hasPosition) {
        hasPosition = true;
      }
      // Pointer capture can keep event.target pinned to a clicked tab even
      // after the pointer has moved away. Hit-test the live coordinates so the
      // normal cursor and FluidGlass state never remain stuck on stale DOM.
      syncCursorMode(document.elementFromPoint(targetX, targetY));
      cursor.dataset.visible = "true";
      requestPositionRender();
    };

    const handleGlassReadinessChange = () => {
      if (!hasPosition) return;
      syncCursorMode(document.elementFromPoint(targetX, targetY));
    };

    const glassObserver = new MutationObserver(handleGlassReadinessChange);

    const handlePointerDown = () => {
      cursor.dataset.pressed = "true";
    };

    const handlePointerUp = () => {
      cursor.dataset.pressed = "false";
      handleGlassReadinessChange();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") hideCursor();
      else handleGlassReadinessChange();
    };

    const handleWindowMouseOut = (event) => {
      if (!event.relatedTarget) hideCursor();
    };

    const stopListening = () => {
      glassObserver.disconnect();
      if (!listening) return;
      listening = false;
      window.cancelAnimationFrame(frame);
      frame = 0;
      hideCursor();
      root.classList.remove("has-fluid-glass-cursor");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", hideCursor);
      window.removeEventListener("mouseout", handleWindowMouseOut);
      window.removeEventListener("blur", hideCursor);
      window.removeEventListener("focus", handleGlassReadinessChange);
      window.removeEventListener("pageshow", handleGlassReadinessChange);
      window.removeEventListener("scroll", handleGlassReadinessChange);
      window.removeEventListener("resize", handleGlassReadinessChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

    const startListening = () => {
      if (listening || !finePointer.matches) return;
      listening = true;
      root.classList.add("has-fluid-glass-cursor");
      glassObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-glass-ready"],
        subtree: true,
      });
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerdown", handlePointerDown, { passive: true });
      window.addEventListener("pointerup", handlePointerUp, { passive: true });
      window.addEventListener("pointercancel", hideCursor, { passive: true });
      window.addEventListener("mouseout", handleWindowMouseOut);
      window.addEventListener("blur", hideCursor);
      window.addEventListener("focus", handleGlassReadinessChange);
      window.addEventListener("pageshow", handleGlassReadinessChange);
      window.addEventListener("scroll", handleGlassReadinessChange, { passive: true });
      window.addEventListener("resize", handleGlassReadinessChange, { passive: true });
      document.addEventListener("visibilitychange", handleVisibilityChange);
    };

    const handleCapabilityChange = () => {
      if (finePointer.matches) startListening();
      else stopListening();
    };

    handleCapabilityChange();
    finePointer.addEventListener?.("change", handleCapabilityChange);

    return () => {
      finePointer.removeEventListener?.("change", handleCapabilityChange);
      stopListening();
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
