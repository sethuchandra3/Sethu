import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Masonry from "./Masonry.jsx";
import ScrollFloat from "./ScrollFloat.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FluidGlass = lazy(() => import("./FluidGlass.jsx"));

const projectLensProps = Object.freeze({
  scale: 0.04,
  ior: 1.15,
  thickness: 5,
  chromaticAberration: 0.03,
  anisotropy: 0.01,
});

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
    img: "/assets/spotify-insights-concept-light.png",
    imageWidth: 1536,
    imageHeight: 1024,
    group: "concepts",
    displayOrder: 1,
    tags: ["Retention", "Knowledge Capture", "Sharing"],
    title: "Spotify Insights",
    description:
      "Explored how Spotify could make podcasts more valuable after listening by turning fleeting moments into searchable, shareable insights.",
    href: "https://superficial-wolf-2a8.notion.site/Spotify-Insights-Make-Podcasts-Rememberable-Insight-Capture-Sharing-Layer-39500521ab31817ea491dd6094e774a9",
    cursorLabel: "Explore concept",
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
    img: "/assets/designathon-cooking-app.webp?v=3",
    imageWidth: 1536,
    imageHeight: 1024,
    group: "concepts",
    displayOrder: 5,
    tags: ["AI UX", "Adaptive Guidance", "Voice"],
    title: "Let's Cook",
    description:
      "Designed a beginner-first cooking experience that adapts recipes and provides hands-free guidance when users need it most.",
    href: "https://www.figma.com/design/f39mtF9PRe36RupvsY37UY/Prototype?node-id=0-1&t=AQRoZ5SMH3DpLIng-1",
    cursorLabel: "Explore concept",
  },
  {
    id: "project-05",
    img: "/assets/pinterest-wrapped-concept.png?v=2",
    imageWidth: 1536,
    imageHeight: 1024,
    group: "concepts",
    displayOrder: 3,
    tags: ["Growth", "Personalization", "Sharing"],
    title: "Pinterest Wrapped",
    description:
      "Designed an annual identity recap that turns a year of saves into a shareable aesthetic story and creates a new acquisition loop for Pinterest.",
    href: "https://superficial-wolf-2a8.notion.site/Pinterest-Wrapped-2f000521ab3180a7b232e01cf2e7444b?source=copy_link",
    cursorLabel: "Explore concept",
  },
  {
    id: "project-06",
    img: "/assets/tiktok-tutorial-mode.webp?v=3",
    imageWidth: 1672,
    imageHeight: 941,
    group: "concepts",
    displayOrder: 0,
    featured: true,
    tags: ["Consumer", "Creator Ecosystem", "Commerce"],
    title: "TikTok Tutorial Mode",
    description:
      "Turned passive how-to videos into guided experiences viewers can actually complete, while giving creators a new engagement and commerce surface.",
    href: "https://superficial-wolf-2a8.notion.site/TikTok-Tutorial-Mode-Capitalizing-on-a-new-search-engine-with-a-native-follow-along-layer-for-how-t-39500521ab3180ddbdf8d70bd6a5a1b1?source=copy_link",
    cursorLabel: "Explore concept",
  },
  {
    id: "project-07",
    img: "/assets/duolingo-video-concept.png",
    imageWidth: 1536,
    imageHeight: 1024,
    group: "concepts",
    displayOrder: 4,
    tags: ["Engagement", "Learning", "Content"],
    title: "Duolingo Video",
    description:
      "Explored how short-form native-speaker video could bridge the gap between structured lessons and understanding Spanish in the real world.",
    href: "https://superficial-wolf-2a8.notion.site/Duolingo-Video-a-short-form-native-video-layer-for-Duolingo-Spanish-39500521ab3180c8b374feff990ff56f?pvs=73",
    cursorLabel: "Explore concept",
  },
  {
    id: "project-08",
    img: "/assets/resume-linkedin-profile-generator.png",
    imageWidth: 1536,
    imageHeight: 1024,
    group: "concepts",
    displayOrder: 6,
    tags: ["AI UX", "Onboarding", "Automation"],
    title: "Resume to LinkedIn Profile",
    description:
      "Designed an AI onboarding flow that turns an existing resume into a reviewable LinkedIn profile instead of making users rebuild it manually.",
    href: "https://superficial-wolf-2a8.notion.site/Resume-to-Linkedin-profile-39500521ab31806382bfe2a0f1cd823a?source=copy_link",
    cursorLabel: "Explore concept",
  },
  {
    id: "project-09",
    img: "/assets/apple-photos-feelings.png",
    imageWidth: 1536,
    imageHeight: 1024,
    group: "concepts",
    displayOrder: 2,
    tags: ["Personalization", "Discovery", "Interaction Design"],
    title: "Apple Photos Feelings",
    description:
      "Reimagined photo retrieval around how memories felt—not just when or where they happened—through an emotional organization layer.",
    href: "https://superficial-wolf-2a8.notion.site/Apple-Photos-a-Feelings-reaction-layer-browse-memories-by-emotion-not-just-the-heart-3b900521ab31816facbbc6b50bb04ef9?source=copy_link",
    cursorLabel: "Explore concept",
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
  const [conceptLensScreenSize, setConceptLensScreenSize] = useState(null);
  const galleryRef = useRef(null);
  const galleryInnerRef = useRef(null);
  const sliderRef = useRef(null);
  const panelRefs = useRef({});
  const swipeRef = useRef({ active: false, dragging: false, x: 0, y: 0 });
  const suppressClickRef = useRef(false);
  const activeProjectCaptureKey = projectPlaceholders
    .filter(project => project.group === activeGroup)
    .map(project => project.img)
    .join("|");

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

    // Keep the gallery visible while Astro hydrates this island. Starting at
    // autoAlpha: 0 could hide the server-rendered projects after their scroll
    // trigger had already been crossed, leaving the whole section invisible.
    gsap.set(galleryInner, { autoAlpha: 1 });
    setGalleryRevealed(true);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(galleryInner, { clearProps: "all" });
      return undefined;
    }

    const reveal = gsap.fromTo(
      galleryInner,
      { y: 30 },
      {
        y: 0,
        duration: 0.9,
        delay: 0.08,
        ease: "power3.out",
        clearProps: "transform,opacity,visibility",
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
  };

  const handleSliderPointerMove = event => {
    const swipe = swipeRef.current;
    if (!swipe.active || !sliderRef.current) return;
    const deltaX = event.clientX - swipe.x;
    const deltaY = event.clientY - swipe.y;
    if (!swipe.dragging) {
      if (Math.abs(deltaX) < 8 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      swipe.dragging = true;
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
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
          text={"I help build products that unleash the full user experience by finding overlooked user problems, understanding why they matter, and designing the smallest product bet that could change the experience."}
          containerClassName="projects-subtitle"
          animationDuration={1}
          ease="none"
          scrollStart="top 94%"
          scrollEnd="top 56%"
          stagger={0.018}
          preserveShape
        />
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
              const items = projectPlaceholders
                .filter(project => project.group === group.id)
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
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
                activeSelector=".project-masonry__media[data-glass-captured='true']"
                captureKey={`${activeGroup}:${activeProjectCaptureKey}`}
                onCaptureReady={setGlassReady}
                onResolvedScreenSize={activeGroup === "concepts" ? setConceptLensScreenSize : undefined}
                lensProps={activeGroup === "shipped" && conceptLensScreenSize
                  ? { ...projectLensProps, screenSize: conceptLensScreenSize }
                  : projectLensProps}
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
