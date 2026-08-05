import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Masonry from "./Masonry.jsx";
import ScrollFloat from "./ScrollFloat.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FluidGlass = lazy(() => import("./FluidGlass.jsx"));

const projectPlaceholders = [
  {
    id: "project-01",
    img: "/assets/mesh-homepage.jpg",
    imageWidth: 1265,
    imageHeight: 712,
    group: "shipped",
    title: "Mesh Website Design",
    description:
      "Rebuilt Mesh’s website around its ICP and brand, improving SEO, search visibility, and conversion clarity.",
    href: "https://usemesh.com/",
    cursorLabel: "View website",
  },
  {
    id: "project-02",
    img: "/assets/spotify-insights.png",
    imageWidth: 1568,
    imageHeight: 1003,
    group: "concepts",
    title: "Spotify Insights: Make Podcasts Rememberable",
    description:
      "Designed a podcast memory layer for capturing, searching, and sharing insights and quotes while listening.",
    href: "https://superficial-wolf-2a8.notion.site/Spotify-Insights-Make-Podcasts-Rememberable-Insight-Capture-Sharing-Layer-39500521ab31817ea491dd6094e774a9",
    cursorLabel: "View case study",
  },
  {
    id: "project-03",
    img: "/assets/researchbuddy-cover.png",
    imageWidth: 1782,
    imageHeight: 1014,
    group: "shipped",
    title: "Rodney: Your Research Buddy",
    description:
      "Built an interactive AI research assistant MVP at an MLH hackathon to make scientific papers easier for everyone to understand.",
    href: "https://github.com/sethuchandra3/researchbuddy",
    cursorLabel: "View project",
  },
  {
    id: "project-04",
    img: "/assets/designathon-cooking-app.webp",
    imageWidth: 394,
    imageHeight: 450,
    group: "concepts",
    title: "AI Cooking Companion",
    description:
      "Designed a beginner-friendly cooking app that combines TikTok-style recipes with hands-free AI voice guidance.",
    href: "https://www.figma.com/design/f39mtF9PRe36RupvsY37UY/Prototype?node-id=0-1&t=AQRoZ5SMH3DpLIng-1",
    cursorLabel: "View prototype",
  },
  {
    id: "project-05",
    img: "/assets/pinterest-wrapped-concept.png",
    imageWidth: 1448,
    imageHeight: 1086,
    group: "concepts",
    title: "Pinterest Wrapped: Your Year in Aesthetics",
    description:
      "Conceptualized a shareable annual recap that turns a year of saves into a named aesthetic identity and a new-user growth loop.",
    href: "https://superficial-wolf-2a8.notion.site/Pinterest-Wrapped-Your-Year-in-Aesthetics-shareable-annual-recap-39500521ab3181489ca3da05c95a937f?source=copy_link",
    cursorLabel: "View case study",
  },
];

const projectGroups = [
  {
    id: "concepts",
    label: "Concepts",
    description: "Product ideas explored through case studies, strategy and prototypes.",
  },
  {
    id: "shipped",
    label: "Shipped",
    description: "Live work and functional products built beyond the design file.",
  },
];

export default function ProjectsSection() {
  const [activeGroup, setActiveGroup] = useState(projectGroups[0].id);
  const [supportsFinePointer, setSupportsFinePointer] = useState(false);
  const [glassReady, setGlassReady] = useState(false);
  const [galleryRevealed, setGalleryRevealed] = useState(false);
  const galleryRef = useRef(null);
  const galleryInnerRef = useRef(null);
  const sliderRef = useRef(null);
  const panelRefs = useRef({});
  const swipeRef = useRef({ active: false, dragging: false, x: 0, y: 0 });
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerSupport = () => setSupportsFinePointer(pointerQuery.matches);
    updatePointerSupport();
    pointerQuery.addEventListener?.("change", updatePointerSupport);
    return () => pointerQuery.removeEventListener?.("change", updatePointerSupport);
  }, []);

  useLayoutEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;

    const updateHeight = () => {
      const activePanel = panelRefs.current[activeGroup];
      if (!activePanel) return;
      const nextHeight = Math.ceil(activePanel.scrollHeight);
      const currentHeight = Number.parseFloat(slider.style.height) || 0;
      if (nextHeight > 0 && Math.abs(nextHeight - currentHeight) > 1) {
        slider.style.height = `${nextHeight}px`;
      }
      slider.dataset.heightReady = "true";
    };

    const observer = new ResizeObserver(updateHeight);
    Object.values(panelRefs.current).forEach(panel => observer.observe(panel));
    window.addEventListener("resize", updateHeight, { passive: true });
    updateHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [activeGroup]);

  useGSAP(() => {
    const galleryInner = galleryInnerRef.current;
    if (!galleryInner) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(galleryInner, { clearProps: "all" });
      setGalleryRevealed(true);
      return undefined;
    }

    const reveal = gsap.fromTo(
      galleryInner,
      { autoAlpha: 0, y: 30 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        delay: 0.08,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
        onComplete: () => setGalleryRevealed(true),
        scrollTrigger: {
          trigger: galleryInner,
          start: "top 88%",
          once: true,
        },
      },
    );

    return () => reveal.kill();
  }, { scope: galleryRef });

  useEffect(() => {
    // Category tabs are local UI state, not routes. Normalize legacy category
    // hashes to the stable section anchor so refresh/back-forward restoration
    // cannot target an element whose panel is currently hidden.
    if (window.location.hash.startsWith("#projects-")) {
      window.history.replaceState(null, "", "#projects");
    }
    setActiveGroup(projectGroups[0].id);
  }, []);

  const selectGroup = groupId => {
    if (groupId === activeGroup) return;
    setGlassReady(false);
    setActiveGroup(groupId);
  };

  const handleTabKeyDown = event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = projectGroups.findIndex(group => group.id === activeGroup);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = Math.max(0, currentIndex - 1);
    if (event.key === "ArrowRight") nextIndex = Math.min(projectGroups.length - 1, currentIndex + 1);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = projectGroups.length - 1;
    const nextGroup = projectGroups[nextIndex];
    selectGroup(nextGroup.id);
    document.getElementById(`projects-tab-${nextGroup.id}`)?.focus();
  };

  const resetSwipe = () => {
    const slider = sliderRef.current;
    if (slider) {
      slider.style.removeProperty("--projects-drag-x");
      slider.dataset.dragging = "false";
    }
    swipeRef.current = { active: false, dragging: false, x: 0, y: 0 };
  };

  const handleSliderPointerDown = event => {
    if (event.button !== 0) return;
    swipeRef.current = {
      active: true,
      dragging: false,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleSliderPointerMove = event => {
    const swipe = swipeRef.current;
    if (!swipe.active || !sliderRef.current) return;
    const deltaX = event.clientX - swipe.x;
    const deltaY = event.clientY - swipe.y;
    if (!swipe.dragging && (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY))) return;
    swipe.dragging = true;
    suppressClickRef.current = true;
    sliderRef.current.dataset.dragging = "true";
    sliderRef.current.style.setProperty(
      "--projects-drag-x",
      `${Math.max(-110, Math.min(110, deltaX))}px`,
    );
  };

  const handleSliderPointerEnd = event => {
    const swipe = swipeRef.current;
    if (!swipe.active) return;
    const deltaX = event.clientX - swipe.x;
    const activeIndex = projectGroups.findIndex(group => group.id === activeGroup);
    const threshold = Math.min(72, (sliderRef.current?.offsetWidth || 600) * 0.12);
    resetSwipe();

    if (swipe.dragging && Math.abs(deltaX) >= threshold) {
      const nextIndex = deltaX < 0 ? activeIndex + 1 : activeIndex - 1;
      const nextGroup = projectGroups[nextIndex];
      if (nextGroup) selectGroup(nextGroup.id);
    }

    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  };

  const handleSliderClickCapture = event => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <section
      id="projects"
      className="projects-section"
      aria-labelledby="projects-title"
    >
      <div className="projects-content">
        <header className="projects-heading">
        <ScrollFloat
          id="projects-title"
          animationDuration={1}
          ease="none"
          scrollStart="top 94%"
          scrollEnd="top 44%"
          stagger={0.045}
          preserveShape
        >
          Projects
        </ScrollFloat>
        <a className="projects-see-all" href="/projects" aria-label="See all projects">
          See all
          <span aria-hidden="true">↗</span>
        </a>
        <ScrollFloat
          as="p"
          containerClassName="projects-subtitle"
          animationDuration={1}
          ease="none"
          scrollStart="top 94%"
          scrollEnd="top 56%"
          stagger={0.018}
          preserveShape
        >
          A selection of how I think, design and build.
        </ScrollFloat>
        </header>
      </div>

      <div
        ref={galleryRef}
        className="projects-editorial-gallery"
        data-glass-ready={glassReady ? "true" : "false"}
      >
        <div ref={galleryInnerRef} className="projects-gallery-inner">
          <div
            className="projects-category-tabs"
            data-active-group={activeGroup}
            role="tablist"
            aria-label="Project categories"
            onKeyDown={handleTabKeyDown}
          >
            {projectGroups.map(group => (
              <button
                type="button"
                role="tab"
                id={`projects-tab-${group.id}`}
                className={activeGroup === group.id ? "is-active" : undefined}
                aria-selected={activeGroup === group.id}
                aria-controls={`projects-panel-${group.id}`}
                tabIndex={activeGroup === group.id ? 0 : -1}
                onClick={() => selectGroup(group.id)}
                key={group.id}
              >
                {group.label}
              </button>
            ))}
            <span className="projects-category-tabs__indicator" aria-hidden="true" />
          </div>

          <div
            ref={sliderRef}
            className="projects-slider"
            data-active-group={activeGroup}
            data-dragging="false"
            onPointerDown={handleSliderPointerDown}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerEnd}
            onPointerCancel={resetSwipe}
            onClickCapture={handleSliderClickCapture}
          >
            {projectGroups.map((group, groupIndex) => {
              const items = projectPlaceholders.filter(project => project.group === group.id);
              const activeIndex = projectGroups.findIndex(item => item.id === activeGroup);
              const positionClass = groupIndex === activeIndex
                ? "is-active"
                : groupIndex < activeIndex
                  ? "is-before"
                  : "is-after";
              return (
                <section
                  ref={element => {
                    if (element) panelRefs.current[group.id] = element;
                    else delete panelRefs.current[group.id];
                  }}
                  id={`projects-panel-${group.id}`}
                  className={`projects-slider__panel projects-group projects-group--${group.id} ${positionClass}`}
                  role="tabpanel"
                  aria-labelledby={`projects-tab-${group.id}`}
                  aria-hidden={activeGroup !== group.id}
                  inert={activeGroup !== group.id}
                  key={group.id}
                >
                  <p className="projects-group__description">{group.description}</p>
                  <Masonry items={items} headingTag="h3" />
                </section>
              );
            })}
          </div>
        </div>

        {supportsFinePointer && galleryRevealed && (
          <div className="projects-glass-overlay" aria-hidden="true">
            <Suspense fallback={null}>
              <FluidGlass
                mode="lens"
                captureTargetRef={galleryRef}
                trackingTargetRef={galleryRef}
                activeTargetRef={galleryRef}
                activeSelector=".project-masonry__media"
                captureKey={activeGroup}
                enabled={glassReady}
                onCaptureReady={setGlassReady}
                lensProps={{
                  scale: 0.075,
                  ior: 1.15,
                  thickness: 5,
                  chromaticAberration: 0.03,
                  anisotropy: 0.01,
                }}
                barProps={{}}
                cubeProps={{}}
              />
            </Suspense>
          </div>
        )}
      </div>
    </section>
  );
}
