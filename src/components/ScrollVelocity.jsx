import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./ScrollVelocity.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function VelocityRow({ children, numCopies, velocity, scrollBoostVelocity, variant }) {
  const rowRef = useRef(null);
  const trackRef = useRef(null);
  const duration = Math.max(9, 680 / Math.max(1, Math.abs(velocity)));

  useGSAP(
    () => {
      const row = rowRef.current;
      if (!row || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const section = row.closest(".connect-section") || row;
      gsap.fromTo(
        row,
        { xPercent: 8.5 },
        {
          xPercent: -8.5,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.24,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: rowRef },
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    let lastScrollY = window.scrollY;
    let targetRate = 1;
    let currentRate = 1;
    let animationFrame = 0;

    const onScroll = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const scrollBoost = Math.min(4.2, Math.abs(delta) * 0.075);
      const boostScale = scrollBoostVelocity / Math.max(1, Math.abs(velocity));
      targetRate = 1 + scrollBoost * boostScale;
    };

    const updatePlaybackRate = () => {
      targetRate += (1 - targetRate) * 0.055;
      currentRate += (targetRate - currentRate) * 0.24;
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
  }, []);

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
