import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextPressure from "./TextPressure.jsx";
import WorkExperienceList from "./WorkExperienceList.jsx";
import SpecularButton from "./SpecularButton.jsx";
import MagicBento from "./MagicBento.jsx";
import "./ExperienceSection.css";

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceSection() {
  const rootRef = useRef(null);
  const sequenceRef = useRef(null);
  const resumeRef = useRef(null);
  const workListRef = useRef(null);
  const communityListRef = useRef(null);
  const activePanelRef = useRef("work");
  const manualCommunityRef = useRef(false);
  const [activePanel, setActivePanel] = useState("work");

  const switchPanel = useCallback((panel) => {
    if (activePanelRef.current === panel) return;
    activePanelRef.current = panel;
    setActivePanel(panel);
  }, []);

  const handlePanelSelect = useCallback((panel) => {
    manualCommunityRef.current = panel === "community";
    switchPanel(panel);
  }, [switchPanel]);

  const handleWorkListEnd = useCallback(() => {
    manualCommunityRef.current = true;
    switchPanel("community");
  }, [switchPanel]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([".experiences-title", ".experiences-subtitle", ".experience-island"], {
          autoAlpha: 1,
          clearProps: "transform",
        });
        return;
      }

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 86%",
            end: "top 48%",
            scrub: 0.18,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "power2.out" },
        })
        .fromTo(
          ".experiences-title",
          { autoAlpha: 0, xPercent: 92 },
          { autoAlpha: 1, xPercent: 0, duration: 0.5 },
        )
        .fromTo(
          ".experiences-subtitle",
          { autoAlpha: 0, xPercent: -58 },
          { autoAlpha: 1, xPercent: 0, duration: 0.32 },
          0.04,
        )
        .fromTo(
          ".experience-island",
          { autoAlpha: 0, y: 28, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.28 },
          0.12,
        );
    }, root);

    return () => context.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const sequence = sequenceRef.current;
    const resumeCta = resumeRef.current;
    if (!root || !sequence || !resumeCta) return undefined;

    const media = gsap.matchMedia();
    media.add("(min-width: 821px)", () => {
      const workEndProgress = 0.64;
      const communityEnterProgress = 0.66;
      const communityExitProgress = 0.6;
      const communityEndProgress = 0.96;
      const resumeStartProgress = 0.72;
      const resumeEndProgress = 0.9;

      gsap.set(resumeCta, { autoAlpha: 0, y: 26, pointerEvents: "none" });
      const resumeReveal = gsap.to(resumeCta, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "none",
        paused: true,
      });

      const sequenceTrigger = ScrollTrigger.create({
        trigger: sequence,
        start: "top 4%",
        end: () => `+=${Math.max(window.innerHeight * 1.2, 840)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const workProgress = gsap.utils.clamp(0, 1, self.progress / workEndProgress);
          const communityProgress = gsap.utils.clamp(
            0,
            1,
            (self.progress - communityEnterProgress) /
              (communityEndProgress - communityEnterProgress),
          );
          const resumeProgress = gsap.utils.clamp(
            0,
            1,
            (self.progress - resumeStartProgress) / (resumeEndProgress - resumeStartProgress),
          );
          workListRef.current?.setProgress(workProgress);
          communityListRef.current?.setProgress(communityProgress);
          resumeReveal.progress(resumeProgress);
          resumeCta.style.pointerEvents = resumeProgress >= 0.85 ? "auto" : "none";

          if (self.direction < 0 && self.progress <= communityExitProgress) {
            manualCommunityRef.current = false;
          }

          const nextPanel = manualCommunityRef.current
            ? "community"
            : activePanelRef.current === "community"
              ? self.progress > communityExitProgress
                ? "community"
                : "work"
              : self.progress >= communityEnterProgress
                ? "community"
                : "work";

          switchPanel(nextPanel);
        },
      });

      return () => {
        sequenceTrigger.kill();
        resumeReveal.kill();
        gsap.set(resumeCta, { clearProps: "opacity,visibility,transform,pointerEvents" });
      };
    }, root);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      media.revert();
    };
  }, [switchPanel]);

  return (
    <section ref={rootRef} className="experiences-section" aria-labelledby="experiences-title">
      <div className="experiences-inner">
        <TextPressure id="experiences-title" className="experiences-title" text="Experience" />
        <p className="experiences-subtitle">
          "Everything is a win when the goal is to experience."
        </p>

        <div ref={sequenceRef} className="experience-sequence" data-active={activePanel}>
          <nav
            className="experience-island"
            aria-label="Experience categories"
            data-active={activePanel}
          >
            <span className="yin-yang-surface" aria-hidden="true">
              <span className="yin-yang-white-field" />
            </span>
            {['work', 'community'].map((panel) => {
              const isActive = activePanel === panel;
              return (
                <button
                  className={`yin-yang-option${isActive ? " is-active" : ""}`}
                  type="button"
                  aria-pressed={isActive}
                  data-experience-option={panel}
                  onClick={() => handlePanelSelect(panel)}
                  key={panel}
                >
                  <span className="yin-yang-option__label">{panel}</span>
                </button>
              );
            })}
          </nav>

          <div className="experience-panels" data-active={activePanel}>
            <section
              className={`experience-panel experience-panel--work${activePanel === "work" ? " is-active" : ""}`}
              aria-label="Work experience"
              aria-hidden={activePanel !== "work"}
              inert={activePanel !== "work"}
            >
              <WorkExperienceList ref={workListRef} onReachEnd={handleWorkListEnd} />
            </section>

            <section
              className={`experience-panel experience-panel--community${activePanel === "community" ? " is-active" : ""}`}
              aria-label="Community experience"
              aria-hidden={activePanel !== "community"}
              inert={activePanel !== "community"}
            >
              <MagicBento
                ref={communityListRef}
                textAutoHide={false}
                enableStars={false}
                enableSpotlight={false}
                enableBorderGlow={false}
                enableTilt={false}
                enableMagnetism={false}
                clickEffect={false}
                spotlightRadius={400}
                particleCount={12}
                glowColor="207, 47, 114"
                disableAnimations={activePanel !== "community"}
              />
            </section>
          </div>

          <div ref={resumeRef} className="experience-resume-cta">
            <SpecularButton
              size="lg"
              radius={18}
              tint="#ffffff"
              tintOpacity={0}
              blur={0}
              background="linear-gradient(115deg, #f25a1d 0%, #cf2f72 100%)"
              textColor="#fffaf7"
              lineColor="#fff7f2"
              baseColor="#8f244d"
              intensity={1.35}
              shineSize={16}
              shineFade={50}
              thickness={1.3}
              speed={0.48}
              followMouse={false}
              proximity={1}
              autoAnimate
              className="experience-resume-button"
              onClick={() => window.open("/resume.pdf", "_blank", "noopener,noreferrer")}
            >
              View my resume
            </SpecularButton>
          </div>
        </div>
      </div>
    </section>
  );
}
