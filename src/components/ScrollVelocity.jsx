import { useEffect, useRef } from "react";
import "./ScrollVelocity.css";

function VelocityRow({ children, numCopies, velocity, scrollBoostVelocity, variant }) {
  const rowRef = useRef(null);
  const trackRef = useRef(null);
  const firstCopyRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    const track = trackRef.current;
    const firstCopy = firstCopyRef.current;
    if (!row || !track || !firstCopy) {
      return undefined;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const direction = velocity >= 0 ? -1 : 1;
    const baseSpeed = Math.max(1, Math.abs(velocity));
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let lastFrameTime = performance.now();
    let copyWidth = firstCopy.offsetWidth;
    let position = 0;
    let targetBoost = 0;
    let currentBoost = 0;
    let animationFrame = 0;
    let isActive = true;
    let reducedMotion = motionQuery.matches;

    const wrapPosition = value => {
      if (!copyWidth) return 0;
      return ((value % copyWidth) + copyWidth) % copyWidth;
    };

    const measure = () => {
      copyWidth = firstCopy.offsetWidth;
      position = wrapPosition(position);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isActive = entry.isIntersecting;
        lastFrameTime = performance.now();
      },
      { rootMargin: "200px 0px" },
    );
    const resizeObserver = new ResizeObserver(measure);
    intersectionObserver.observe(row);
    resizeObserver.observe(firstCopy);
    document.fonts?.ready.then(measure);

    const onVisibilityChange = () => {
      lastFrameTime = performance.now();
      if (!document.hidden) {
        const rect = row.getBoundingClientRect();
        isActive = rect.bottom >= -200 && rect.top <= window.innerHeight + 200;
      }
    };

    const onMotionChange = event => {
      reducedMotion = event.matches;
      if (reducedMotion) track.style.transform = "translate3d(0, 0, 0)";
      lastFrameTime = performance.now();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery.addEventListener?.("change", onMotionChange);

    const onScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      const elapsed = Math.max(16, now - lastScrollTime);
      lastScrollY = currentScrollY;
      lastScrollTime = now;

      const scrollVelocity = (Math.abs(delta) / elapsed) * 1000;
      const scrollFactor = Math.max(0, Math.min(5, scrollVelocity / 240));
      targetBoost = Math.max(targetBoost, scrollFactor * Math.abs(scrollBoostVelocity));
    };

    const tick = now => {
      const deltaSeconds = Math.min(Math.max((now - lastFrameTime) / 1000, 0), 0.05);
      lastFrameTime = now;

      if (isActive && !document.hidden && !reducedMotion && copyWidth > 0) {
        targetBoost += (0 - targetBoost) * 0.075;
        currentBoost += (targetBoost - currentBoost) * 0.16;
        position = wrapPosition(position + direction * (baseSpeed + currentBoost) * deltaSeconds);
        const translatedPosition = direction < 0 ? -position : position - copyWidth;
        track.style.transform = `translate3d(${translatedPosition}px, 0, 0)`;
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    measure();
    animationFrame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener?.("change", onMotionChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [scrollBoostVelocity, velocity]);

  return (
    <div ref={rowRef} className={`scroll-velocity__row is-${variant}`} aria-hidden="true">
      <div
        ref={trackRef}
        className="scroll-velocity__track"
      >
        {Array.from({ length: numCopies }, (_, index) => (
          <span ref={index === 0 ? firstCopyRef : null} className="scroll-velocity__copy" key={index}>
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ScrollVelocity({
  texts = [],
  velocity = 30,
  scrollBoostVelocity = velocity,
  damping = 50,
  stiffness = 300,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 2.4] },
}) {
  return (
    <div className="scroll-velocity">
      <div className="sr-only">{texts.join(". ")}</div>
      {texts.map((text, index) => (
        <VelocityRow
          key={text}
          numCopies={numCopies}
          velocity={velocity}
          scrollBoostVelocity={scrollBoostVelocity}
          variant={index === 0 ? "primary" : "secondary"}
        >
          {text}
        </VelocityRow>
      ))}
    </div>
  );
}
