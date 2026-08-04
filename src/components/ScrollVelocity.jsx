import { useEffect, useRef } from "react";
import "./ScrollVelocity.css";

function VelocityRow({ children, numCopies, velocity, scrollBoostVelocity, variant }) {
  const rowRef = useRef(null);
  const trackRef = useRef(null);
  const duration = Math.max(14, 900 / Math.max(1, Math.abs(velocity)));

  useEffect(() => {
    const row = rowRef.current;
    const track = trackRef.current;
    if (!row || !track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const idleRate = 0.57;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let targetRate = idleRate;
    let currentRate = idleRate;
    let animationFrame = 0;

    const onScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      const elapsed = Math.max(16, now - lastScrollTime);
      lastScrollY = currentScrollY;
      lastScrollTime = now;

      const rect = row.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const scrollVelocity = (Math.abs(delta) / elapsed) * 1000;
      const scrollBoost = Math.max(0, Math.min(5, scrollVelocity / 240));
      const boostScale = scrollBoostVelocity / Math.max(1, Math.abs(velocity));
      targetRate = idleRate + scrollBoost * boostScale;

      const [animation] = track.getAnimations();
      if (animation && typeof animation.currentTime === "number") {
        const timing = animation.effect?.getTiming();
        const duration = typeof timing?.duration === "number" ? timing.duration : 0;
        let nextTime = animation.currentTime + Math.abs(delta) * 5;
        if (duration > 0) nextTime = ((nextTime % duration) + duration) % duration;
        animation.currentTime = Math.max(0, nextTime);
      }
    };

    const updatePlaybackRate = () => {
      targetRate += (idleRate - targetRate) * 0.045;
      currentRate += (targetRate - currentRate) * 0.18;
      const [animation] = track.getAnimations();
      if (animation) animation.playbackRate = currentRate;
      animationFrame = window.requestAnimationFrame(updatePlaybackRate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    animationFrame = window.requestAnimationFrame(updatePlaybackRate);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [scrollBoostVelocity, velocity]);

  return (
    <div ref={rowRef} className={`scroll-velocity__row is-${variant}`} aria-hidden="true">
      <div
        ref={trackRef}
        className="scroll-velocity__track"
        style={{ "--scroll-velocity-duration": `${duration}s` }}
      >
        {Array.from({ length: numCopies }, (_, index) => (
          <span className="scroll-velocity__copy" key={index}>
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
