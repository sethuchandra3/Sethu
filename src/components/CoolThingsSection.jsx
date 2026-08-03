import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CurvedLoop from "./CurvedLoop.jsx";
import "./CoolThingsSection.css";

gsap.registerPlugin(ScrollTrigger);

const accomplishments = [
  {
    title: "East to west solo travel",
    description: "Chicago to San Francisco aboard the California Zephyr, with plenty of good conversations along the way.",
    label: "01",
    image: "/assets/east-west-solo-travel.jpg?v=2",
    imageAlt: "Riding the California Zephyr through the American West",
    gradient: "linear-gradient(135deg, #f5d76e, #e85d75)",
  },
  {
    title: "Eagle project",
    description: "A community service project I planned, led, and brought from an early idea to execution.",
    label: "02",
    image: "/assets/eagle-project.jpg",
    imageAlt: "Painting outdoor steps during the Eagle project",
    gradient: "linear-gradient(135deg, #7bdff2, #246eb9)",
  },
  {
    title: "Rapping in front of my school",
    description: "Ran for president of student council by creating my own rap song from scratch.",
    label: "03",
    image: "/assets/rapping-at-school.jpg",
    imageAlt: "Performing a student council campaign rap at school",
    gradient: "linear-gradient(135deg, #b8f2e6, #2f9c95)",
  },
  {
    title: "Skydiving in Kenya",
    description: "Took the leap over Kenya and experienced the landscape from an entirely new perspective.",
    label: "04",
    image: "/assets/skydiving-kenya.png",
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
          const horizontalTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: () => `+=${Math.max(getTravelDistance(), 1)}`,
              scrub: 0.18,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          horizontalTimeline.to(track, {
            x: () => -getTravelDistance(),
            duration: 1,
            ease: "none",
            force3D: true,
          });

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
          curveAmount={150}
          direction="left"
          interactive={false}
          scrollDriven
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
