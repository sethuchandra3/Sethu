import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CurvedLoop from "./CurvedLoop.jsx";
import "./CoolThingsSection.css";

gsap.registerPlugin(ScrollTrigger);

const accomplishments = [
  {
    title: "East to west solo travel",
    description: "Took the California Zephyr from Chicago to San Francisco, taking in the American landscape and sharing unforgettable conversations along the way.",
    label: "01",
    image: "/assets/east-west-solo-travel.jpg?v=2",
    imageWidth: 2200,
    imageHeight: 1650,
    imageAlt: "Riding the California Zephyr through the American West",
    gradient: "linear-gradient(135deg, #f5d76e, #e85d75)",
  },
  {
    title: "Eagle project",
    description: "Built a playground for a local children’s school, leading the project from idea to execution.",
    label: "02",
    image: "/assets/eagle-project.jpg",
    imageWidth: 748,
    imageHeight: 562,
    imageAlt: "Painting outdoor steps during the Eagle project",
    gradient: "linear-gradient(135deg, #7bdff2, #246eb9)",
  },
  {
    title: "Rapping in front of my school",
    description: "Ran for president of student council by creating my own rap song from scratch.",
    label: "03",
    image: "/assets/rapping-at-school.jpg",
    imageWidth: 1600,
    imageHeight: 1200,
    imageAlt: "Performing a student council campaign rap at school",
    gradient: "linear-gradient(135deg, #b8f2e6, #2f9c95)",
  },
  {
    title: "Skydiving in Kenya",
    description: "Spontaneously jumped 10,000 feet from a plane and saw Kenya’s beautiful beaches from above.",
    label: "04",
    image: "/assets/skydiving-kenya.png",
    imageWidth: 320,
    imageHeight: 180,
    imageAlt: "Preparing to skydive above Kenya",
    gradient: "linear-gradient(135deg, #f7a072, #5b2333)",
  },
];

export default function CoolThingsSection() {
  const rootRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!root || !viewport || !track) return undefined;

    const curve = root.querySelector(".sidequests-curve");
    const nextSection = root.nextElementSibling;
    const nextHeading = nextSection?.querySelector(".world-heading");

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        {
          desktop: "(min-width: 761px)",
          mobile: "(max-width: 760px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          const { desktop, reduceMotion } = conditions;

          if (reduceMotion || !desktop) {
            gsap.set(track, { clearProps: "all" });
            return undefined;
          }

          const getTravelDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
          // Complete the horizontal journey in slightly less vertical distance.
          // The previous 1:1 distance left the final card pinned for too long on
          // laptop-height viewports, which read as an empty gap before My World.
          const getScrollDistance = () => Math.max(getTravelDistance() * 0.84, 1);
          gsap.set(track, { x: 0 });

          const horizontalTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${getScrollDistance()}`,
              scrub: 0.35,
              pin: root,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: -10,
              onRefreshInit: () => gsap.set(track, { x: 0 }),
            },
          });

          horizontalTimeline.to(track, {
            x: () => -getTravelDistance(),
            duration: 1,
            ease: "none",
            force3D: true,
          }, 0);

          // Keep the last card moving while the section gently lifts away, so
          // the pin releases into the next section rather than pausing on an
          // apparently empty frame.
          horizontalTimeline.to([curve, viewport], {
            y: -18,
            autoAlpha: 0.88,
            duration: 0.08,
            ease: "none",
          }, 0.92);

          if (nextHeading) {
            gsap.fromTo(nextHeading,
              { y: 42, autoAlpha: 0.5 },
              {
                y: 0,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: nextSection,
                  start: "top bottom",
                  end: "top 82%",
                  scrub: 0.35,
                  invalidateOnRefresh: true,
                },
              },
            );
          }

          return undefined;
        },
      );

    }, root);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="carousel-section" aria-labelledby="cool-things-title">
      <h2 id="cool-things-title" className="sr-only">Cool sidequests I have been on</h2>
      <div className="sidequests-curve" aria-hidden="true">
        <CurvedLoop
          marqueeText="Cool sidequests I have been on ✦ "
          speed={1.15}
          curveAmount={165}
          direction="left"
          interactive
          scrollDriven
          wave
          className="sidequests-curve__text"
        />
      </div>
      <div ref={viewportRef} className="carousel-viewport">
        <div ref={trackRef} className="carousel-track" aria-label="Cool sidequests gallery">
          <header className="carousel-intro">
            <p className="carousel-intro-copy">
              I lose sleep to hackathons, travelling and stepping out of my comfort zone.
            </p>
            <p className="carousel-scroll-cue">Scroll <span aria-hidden="true">→</span></p>
          </header>

          {accomplishments.map((item) => (
            <article className="achievement-card" key={item.label}>
              <div className="achievement-image" style={{ background: item.gradient }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    width={item.imageWidth}
                    height={item.imageHeight}
                    loading={item.label === "01" ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <span>{item.label}</span>
                )}
              </div>
              <div className="achievement-copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
