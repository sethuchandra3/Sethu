import { useEffect, useMemo, useRef, useState } from "react";
import Matter from "matter-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./FallingText.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function FallingText({
  className = "",
  text = "",
  highlightWords = [],
  highlightClass = "highlighted",
  trigger = "auto",
  backgroundColor = "transparent",
  wireframes = false,
  gravity = 1,
  fontSize = "1rem",
  direction = "right",
  bottomHoverDelay = 700,
  dropStagger = 55,
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const capturedRectsRef = useRef(null);
  const capturedWordsRef = useRef(null);
  const [effectStarted, setEffectStarted] = useState(false);
  const [bottomReady, setBottomReady] = useState(false);

  const words = useMemo(
    () => text.split(",").map((word) => word.trim()).filter(Boolean),
    [text],
  );

  useEffect(() => {
    if (trigger === "auto") setEffectStarted(true);

    if (trigger !== "scroll" || !containerRef.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEffectStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [trigger]);

  useEffect(() => {
    if (trigger !== "bottom-hover" || effectStarted) return undefined;

    let frame = 0;
    let readyTimer = 0;

    const updateBottomState = () => {
      frame = 0;
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;

      if (!atBottom) {
        window.clearTimeout(readyTimer);
        readyTimer = 0;
        setBottomReady(false);
        return;
      }

      if (!readyTimer && !bottomReady) {
        readyTimer = window.setTimeout(() => {
          readyTimer = 0;
          setBottomReady(true);
        }, bottomHoverDelay);
      }
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateBottomState);
    };

    updateBottomState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(readyTimer);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [bottomHoverDelay, bottomReady, effectStarted, trigger]);

  useGSAP(() => {
    if (trigger !== "bottom" || effectStarted || !containerRef.current || !textRef.current) {
      return undefined;
    }

    const container = containerRef.current;
    const textElement = textRef.current;
    const section = container.closest(".connect-section") || container;
    const pageEnd = section.querySelector("[data-page-end-trigger]");
    let hasTriggered = false;
    let bottomFrame = 0;
    let fallTimer = 0;
    let marqueeFrame = 0;
    const idleRate = 0.78;
    const basePixelsPerSecond = 28;
    const directionFactor = direction === "right" ? 1 : -1;
    let targetRate = idleRate;
    let currentRate = idleRate;
    let copyWidth = 0;
    let marqueeX = 0;
    let previousFrameTime = performance.now();
    let mounted = true;

    const normalizeMarqueeX = () => {
      if (!copyWidth) return;
      if (!Number.isFinite(marqueeX)) {
        marqueeX = directionFactor > 0 ? -copyWidth : 0;
      }
      while (marqueeX >= 0) marqueeX -= copyWidth;
      while (marqueeX < -copyWidth) marqueeX += copyWidth;
    };

    const renderMarquee = () => {
      if (!hasTriggered) {
        textElement.style.transform = `translate3d(${marqueeX}px, 0, 0)`;
      }
    };

    const measureMarquee = () => {
      const firstSet = textElement.querySelector(".falling-text__set:not(.is-clone)");
      const nextWidth = firstSet?.getBoundingClientRect().width || 0;
      if (!nextWidth) return;
      const wasUnmeasured = copyWidth === 0;
      copyWidth = nextWidth;
      if (wasUnmeasured) marqueeX = directionFactor > 0 ? -copyWidth : 0;
      normalizeMarqueeX();
      renderMarquee();
    };

    const startFalling = () => {
      if (hasTriggered) return;
      window.clearTimeout(fallTimer);
      fallTimer = 0;
      hasTriggered = true;
      const containerRect = container.getBoundingClientRect();
      const candidates = [...textElement.querySelectorAll(".falling-text__word")];
      const visibleWords = candidates.filter((word) => {
        const rect = word.getBoundingClientRect();
        return (
          rect.right >= containerRect.left + 4 &&
          rect.left <= containerRect.right - 4 &&
          rect.bottom >= containerRect.top &&
          rect.top <= containerRect.bottom
        );
      });
      if (!visibleWords.length) {
        visibleWords.push(...candidates.filter((word) => !word.hasAttribute("data-marquee-clone")));
      }
      capturedWordsRef.current = visibleWords;
      capturedRectsRef.current = visibleWords.map((word) => word.getBoundingClientRect());
      setEffectStarted(true);
    };

    const triggerAtPageBottom = () => {
      const scrollingElement = document.scrollingElement || document.documentElement;
      const maxScroll = Math.max(0, scrollingElement.scrollHeight - scrollingElement.clientHeight);
      const currentScroll = scrollingElement.scrollTop;
      const atBottom = currentScroll >= maxScroll - 12;

      if (!atBottom) {
        window.clearTimeout(fallTimer);
        fallTimer = 0;
        return;
      }

      if (!fallTimer && !hasTriggered) {
        fallTimer = window.setTimeout(startFalling, 1100);
      }
    };

    const requestBottomCheck = () => {
      if (bottomFrame) return;
      bottomFrame = window.requestAnimationFrame(() => {
        bottomFrame = 0;
        triggerAtPageBottom();
      });
    };

    const updateMarquee = (time) => {
      marqueeFrame = 0;
      const elapsed = (time - previousFrameTime) / 1000;
      const deltaSeconds = Number.isFinite(elapsed) ? Math.min(Math.max(elapsed, 0), 0.05) : 0;
      previousFrameTime = time;
      if (!Number.isFinite(targetRate)) targetRate = idleRate;
      if (!Number.isFinite(currentRate)) currentRate = idleRate;
      targetRate += (idleRate - targetRate) * 0.045;
      currentRate += (targetRate - currentRate) * 0.18;
      if (!hasTriggered && copyWidth) {
        marqueeX += directionFactor * basePixelsPerSecond * currentRate * deltaSeconds;
        normalizeMarqueeX();
        renderMarquee();
      }
      marqueeFrame = window.requestAnimationFrame(updateMarquee);
    };

    const restartMarquee = () => {
      window.cancelAnimationFrame(marqueeFrame);
      marqueeFrame = 0;
      if (document.hidden || !mounted || hasTriggered) return;
      previousFrameTime = performance.now();
      measureMarquee();
      marqueeFrame = window.requestAnimationFrame(updateMarquee);
      requestBottomCheck();
    };

    const handleVisibilityChange = () => restartMarquee();

    measureMarquee();
    marqueeFrame = window.requestAnimationFrame(updateMarquee);

    const movementTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!hasTriggered) {
          const measuredVelocity = self.getVelocity();
          const safeVelocity = Number.isFinite(measuredVelocity) ? measuredVelocity : 0;
          const speedBoost = Math.min(5, Math.abs(safeVelocity) / 260);
          targetRate = idleRate + speedBoost * 1.25;
        }
        requestBottomCheck();
      },
    });

    const refreshAfterLayout = () => {
      if (!mounted || hasTriggered) return;
      measureMarquee();
      ScrollTrigger.refresh();
      requestBottomCheck();
    };
    const handleResize = () => {
      measureMarquee();
      requestBottomCheck();
    };
    const refreshFrame = window.requestAnimationFrame(refreshAfterLayout);
    document.fonts?.ready.then(refreshAfterLayout);
    window.addEventListener("scrollend", requestBottomCheck, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("focus", restartMarquee);
    window.addEventListener("pageshow", restartMarquee);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("portfolio:layout-change", refreshAfterLayout);
    const pageEndObserver = pageEnd
      ? new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) requestBottomCheck();
        },
        { threshold: 0 },
      )
      : null;
    pageEndObserver?.observe(pageEnd);
    requestBottomCheck();

    return () => {
      mounted = false;
      window.cancelAnimationFrame(refreshFrame);
      window.cancelAnimationFrame(bottomFrame);
      window.cancelAnimationFrame(marqueeFrame);
      window.clearTimeout(fallTimer);
      window.removeEventListener("scrollend", requestBottomCheck);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", restartMarquee);
      window.removeEventListener("pageshow", restartMarquee);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("portfolio:layout-change", refreshAfterLayout);
      pageEndObserver?.disconnect();
      movementTrigger.kill();
    };
  }, {
    dependencies: [direction, effectStarted, trigger],
    scope: containerRef,
    revertOnUpdate: true,
  });

  useEffect(() => {
    if (!effectStarted || !containerRef.current || !textRef.current) return undefined;

    const container = containerRef.current;
    const textElement = textRef.current;
    const containerRect = container.getBoundingClientRect();
    if (containerRect.width <= 0 || containerRect.height <= 0) return undefined;

    const { Engine, World, Bodies, Body } = Matter;
    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const boundaryOptions = { isStatic: true, render: { visible: wireframes } };
    const width = containerRect.width;
    const height = containerRect.height;
    const boundaries = [
      Bodies.rectangle(width / 2, height + 10, width + 80, 60, boundaryOptions),
      Bodies.rectangle(-10, height / 2, 60, height + 80, boundaryOptions),
      Bodies.rectangle(width + 10, height / 2, 60, height + 80, boundaryOptions),
      Bodies.rectangle(width / 2, -10, width + 80, 60, boundaryOptions),
    ];

    const allWordElements = [...textElement.querySelectorAll(".falling-text__word")];
    const wordElements = capturedWordsRef.current?.length
      ? capturedWordsRef.current
      : allWordElements.filter((element) => !element.hasAttribute("data-marquee-clone"));
    const capturedRects = capturedRectsRef.current;
    textElement.style.animation = "none";
    textElement.style.transform = "none";
    allWordElements.forEach((element) => {
      element.style.visibility = wordElements.includes(element) ? "visible" : "hidden";
    });

    const wordBodies = wordElements.map((element, index) => {
      const rect = capturedRects?.[index] || element.getBoundingClientRect();
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const spread = (index * 0.61803398875) % 1;
      const usesBottomLayout = trigger === "bottom" || trigger === "bottom-hover";
      const usesCapturedLayout = Boolean(capturedRects?.[index]);
      const sourceX = usesCapturedLayout
        ? rect.left - containerRect.left + halfWidth
        : usesBottomLayout
        ? halfWidth + 6 + Math.max(0, width - rect.width - 12) * spread
        : rect.left - containerRect.left + halfWidth;
      const sourceY = usesCapturedLayout
        ? rect.top - containerRect.top + halfHeight
        : usesBottomLayout
        ? halfHeight + 8 + (index % 3) * 7
        : rect.top - containerRect.top + halfHeight;
      const x = Math.min(width - halfWidth - 4, Math.max(halfWidth + 4, sourceX));
      const y = Math.min(height - halfHeight - 4, Math.max(halfHeight + 4, sourceY));
      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        isStatic: usesBottomLayout,
        restitution: 0.46,
        frictionAir: 0.035,
        friction: 0.34,
        chamfer: { radius: Math.min(rect.height / 2, 28) },
        render: { fillStyle: backgroundColor },
      });

      if (!usesBottomLayout) {
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 2.4, y: 0 });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.024);
      }
      element.style.position = "absolute";
      element.style.margin = "0";
      element.style.left = "0";
      element.style.top = "0";
      element.style.transform = `translate3d(${x - rect.width / 2}px, ${y - rect.height / 2}px, 0)`;
      element.style.willChange = "transform";
      return { element, body, width: rect.width, height: rect.height };
    });

    World.add(engine.world, [...boundaries, ...wordBodies.map(({ body }) => body)]);
    const releaseTimers = [];
    if (trigger === "bottom" || trigger === "bottom-hover") {
      wordBodies.forEach(({ body, element }, index) => {
        const timer = window.setTimeout(() => {
          if (element.hasAttribute("data-dragging")) return;
          Body.setStatic(body, false);
          Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 1.8,
            y: 0.15 + index * 0.018,
          });
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.018);
        }, index * dropStagger);
        releaseTimers.push(timer);
      });
    }
    let dragState = null;

    const pointerPosition = (event) => {
      const rect = container.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const endDrag = (event) => {
      if (!dragState || (event && event.pointerId !== dragState.pointerId)) return;
      const { element, body, velocityX, velocityY } = dragState;
      Body.setStatic(body, false);
      Body.setVelocity(body, {
        x: Math.max(-8, Math.min(8, velocityX * 0.32)),
        y: Math.max(-8, Math.min(8, velocityY * 0.32)),
      });
      element.removeAttribute("data-dragging");
      if (event && container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      dragState = null;
    };

    const onPointerDown = (event) => {
      const element = event.target instanceof Element
        ? event.target.closest(".falling-text__word")
        : null;
      const entry = wordBodies.find((candidate) => candidate.element === element);
      if (!entry) return;

      const pointer = pointerPosition(event);
      Body.setVelocity(entry.body, { x: 0, y: 0 });
      Body.setAngularVelocity(entry.body, 0);
      Body.setStatic(entry.body, true);
      entry.element.setAttribute("data-dragging", "true");
      container.setPointerCapture(event.pointerId);
      dragState = {
        ...entry,
        pointerId: event.pointerId,
        offsetX: entry.body.position.x - pointer.x,
        offsetY: entry.body.position.y - pointer.y,
        lastX: pointer.x,
        lastY: pointer.y,
        lastTime: event.timeStamp,
        velocityX: 0,
        velocityY: 0,
      };
      event.preventDefault();
    };

    const onPointerMove = (event) => {
      if (!dragState || event.pointerId !== dragState.pointerId) return;
      const pointer = pointerPosition(event);
      const halfWidth = dragState.width / 2;
      const halfHeight = dragState.height / 2;
      const nextX = Math.max(halfWidth + 4, Math.min(width - halfWidth - 4, pointer.x + dragState.offsetX));
      const nextY = Math.max(halfHeight + 4, Math.min(height - halfHeight - 4, pointer.y + dragState.offsetY));
      const elapsed = Math.max(8, event.timeStamp - dragState.lastTime);
      dragState.velocityX = ((pointer.x - dragState.lastX) / elapsed) * 16.6;
      dragState.velocityY = ((pointer.y - dragState.lastY) / elapsed) * 16.6;
      dragState.lastX = pointer.x;
      dragState.lastY = pointer.y;
      dragState.lastTime = event.timeStamp;
      Body.setPosition(dragState.body, { x: nextX, y: nextY });
      event.preventDefault();
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    let animationFrame = 0;
    let resetFrame = 0;
    let resetRequested = false;
    let previousTime = 0;

    const resetAfterLeavingFooter = () => {
      resetFrame = 0;
      if (resetRequested || (trigger !== "bottom" && trigger !== "bottom-hover")) return;

      const scrollingElement = document.scrollingElement || document.documentElement;
      const maxScroll = Math.max(0, scrollingElement.scrollHeight - scrollingElement.clientHeight);
      const resetDistance = Math.max(220, window.innerHeight * 0.28);
      if (scrollingElement.scrollTop < maxScroll - resetDistance) {
        resetRequested = true;
        setEffectStarted(false);
      }
    };

    const requestFooterReset = () => {
      if (!resetFrame) resetFrame = window.requestAnimationFrame(resetAfterLeavingFooter);
    };

    const syncElements = (time) => {
      animationFrame = 0;
      const frameDuration = previousTime ? Math.min(time - previousTime, 16.6) : 16.6;
      previousTime = time;
      Engine.update(engine, frameDuration);
      wordBodies.forEach(({ element, body, width: bodyWidth, height: bodyHeight }) => {
        element.style.transform = `translate3d(${body.position.x - bodyWidth / 2}px, ${body.position.y - bodyHeight / 2}px, 0) rotate(${body.angle}rad)`;
      });
      animationFrame = window.requestAnimationFrame(syncElements);
    };

    const restartPhysics = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (document.hidden) return;
      previousTime = 0;
      animationFrame = window.requestAnimationFrame(syncElements);
    };

    const handlePhysicsVisibility = () => restartPhysics();

    animationFrame = window.requestAnimationFrame(syncElements);
    window.addEventListener("scroll", requestFooterReset, { passive: true });
    window.addEventListener("focus", restartPhysics);
    window.addEventListener("pageshow", restartPhysics);
    document.addEventListener("visibilitychange", handlePhysicsVisibility);

    return () => {
      endDrag();
      window.removeEventListener("scroll", requestFooterReset);
      window.removeEventListener("focus", restartPhysics);
      window.removeEventListener("pageshow", restartPhysics);
      document.removeEventListener("visibilitychange", handlePhysicsVisibility);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(resetFrame);
      releaseTimers.forEach((timer) => window.clearTimeout(timer));
      World.clear(engine.world, false);
      Engine.clear(engine);
      textElement.style.removeProperty("animation");
      textElement.style.removeProperty("transform");
      allWordElements.forEach((element) => {
        element.removeAttribute("data-dragging");
        element.style.removeProperty("visibility");
        element.style.removeProperty("position");
        element.style.removeProperty("margin");
        element.style.removeProperty("left");
        element.style.removeProperty("top");
        element.style.removeProperty("transform");
        element.style.removeProperty("will-change");
      });
      capturedWordsRef.current = null;
      capturedRectsRef.current = null;
    };
  }, [backgroundColor, dropStagger, effectStarted, gravity, trigger, wireframes]);

  const startEffect = () => {
    const isBottomHover = trigger === "bottom-hover";
    if (
      effectStarted ||
      !textRef.current ||
      !["click", "hover", "bottom-hover"].includes(trigger) ||
      (isBottomHover && !bottomReady)
    ) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const candidates = [...textRef.current.querySelectorAll(".falling-text__word")];
    const visibleWords = isBottomHover
      ? candidates.filter((word) => !word.hasAttribute("data-marquee-clone"))
      : containerRect
        ? candidates.filter((word) => {
          const rect = word.getBoundingClientRect();
          return rect.left >= containerRect.left + 4 && rect.right <= containerRect.right - 4;
        })
        : candidates.filter((word) => !word.hasAttribute("data-marquee-clone"));
    capturedWordsRef.current = visibleWords;
    capturedRectsRef.current = visibleWords.map((word) => word.getBoundingClientRect());
    setEffectStarted(true);
  };

  return (
    <div
      ref={containerRef}
      className={`falling-text-container is-${direction}${trigger === "bottom" ? " is-scroll-driven" : ""}${bottomReady ? " is-bottom-ready" : ""}${effectStarted ? " is-falling" : ""} ${className}`.trim()}
      onClick={trigger === "click" ? startEffect : undefined}
      onMouseEnter={["hover", "bottom-hover"].includes(trigger) ? startEffect : undefined}
      onPointerEnter={["hover", "bottom-hover"].includes(trigger) ? startEffect : undefined}
      onPointerMove={trigger === "bottom-hover" ? startEffect : undefined}
      style={{ "--falling-text-size": fontSize }}
    >
      <div ref={textRef} className="falling-text-target">
        {[false, true].map((isClone) => (
          <span className={`falling-text__set${isClone ? " is-clone" : ""}`} aria-hidden={isClone} key={String(isClone)}>
            {words.map((word, index) => {
              const highlighted = highlightWords.some((highlight) => word.startsWith(highlight));
              return (
                <span
                  className={`falling-text__word${highlighted ? ` ${highlightClass}` : ""}`}
                  data-marquee-clone={isClone ? "" : undefined}
                  key={`${word}-${index}`}
                >
                  {word}
                </span>
              );
            })}
          </span>
        ))}
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}
