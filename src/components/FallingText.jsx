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
    let playbackFrame = 0;
    let targetRate = 1;
    let currentRate = 1;
    let mounted = true;

    const startFalling = () => {
      if (hasTriggered) return;
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
      textElement.getAnimations().forEach((animation) => animation.pause());
      setEffectStarted(true);
    };

    const triggerAtPageBottom = () => {
      const scrollingElement = document.scrollingElement || document.documentElement;
      const maxScroll = Math.max(0, scrollingElement.scrollHeight - scrollingElement.clientHeight);
      const currentScroll = scrollingElement.scrollTop;
      if (currentScroll >= maxScroll - 24) startFalling();
    };

    const requestBottomCheck = () => {
      if (bottomFrame) return;
      bottomFrame = window.requestAnimationFrame(() => {
        bottomFrame = 0;
        triggerAtPageBottom();
      });
    };

    const updatePlaybackRate = () => {
      targetRate += (1 - targetRate) * 0.065;
      currentRate += (targetRate - currentRate) * 0.2;
      const [marqueeAnimation] = textElement.getAnimations();
      if (marqueeAnimation && !hasTriggered) marqueeAnimation.playbackRate = currentRate;
      playbackFrame = window.requestAnimationFrame(updatePlaybackRate);
    };

    playbackFrame = window.requestAnimationFrame(updatePlaybackRate);

    const movementTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom bottom",
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetRate = 1 + Math.min(3.5, Math.abs(self.getVelocity()) / 720);
        if (self.progress >= 0.998) startFalling();
        requestBottomCheck();
      },
    });

    const refreshAfterLayout = () => {
      if (!mounted || hasTriggered) return;
      ScrollTrigger.refresh();
      requestBottomCheck();
    };
    const refreshFrame = window.requestAnimationFrame(refreshAfterLayout);
    document.fonts?.ready.then(refreshAfterLayout);
    window.addEventListener("scroll", requestBottomCheck, { passive: true });
    window.addEventListener("scrollend", requestBottomCheck, { passive: true });
    window.addEventListener("resize", requestBottomCheck);
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
      window.cancelAnimationFrame(playbackFrame);
      window.removeEventListener("scroll", requestBottomCheck);
      window.removeEventListener("scrollend", requestBottomCheck);
      window.removeEventListener("resize", requestBottomCheck);
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
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.margin = "0";
      element.style.transform = "translate(-50%, -50%)";
      return { element, body };
    });

    World.add(engine.world, [...boundaries, ...wordBodies.map(({ body }) => body)]);
    const releaseTimers = [];
    if (trigger === "bottom" || trigger === "bottom-hover") {
      wordBodies.forEach(({ body }, index) => {
        const timer = window.setTimeout(() => {
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
      const halfWidth = dragState.element.offsetWidth / 2;
      const halfHeight = dragState.element.offsetHeight / 2;
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
    let previousTime = 0;

    const syncElements = (time) => {
      const frameDuration = previousTime ? Math.min(time - previousTime, 16.6) : 16.6;
      previousTime = time;
      Engine.update(engine, frameDuration);
      wordBodies.forEach(({ element, body }) => {
        element.style.left = `${body.position.x}px`;
        element.style.top = `${body.position.y}px`;
        element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      animationFrame = window.requestAnimationFrame(syncElements);
    };
    animationFrame = window.requestAnimationFrame(syncElements);

    return () => {
      endDrag();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      window.cancelAnimationFrame(animationFrame);
      releaseTimers.forEach((timer) => window.clearTimeout(timer));
      World.clear(engine.world, false);
      Engine.clear(engine);
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
