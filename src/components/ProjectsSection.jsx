import { useEffect, useRef, useState } from "react";
import FluidGlass from "./FluidGlass.jsx";
import Masonry from "./Masonry.jsx";
import ScrollFloat from "./ScrollFloat.jsx";

const projectPlaceholders = [
  {
    id: "project-01",
    img: "/assets/mesh-homepage.jpg",
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
  const galleryRef = useRef(null);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerSupport = () => setSupportsFinePointer(pointerQuery.matches);
    updatePointerSupport();
    pointerQuery.addEventListener?.("change", updatePointerSupport);
    return () => pointerQuery.removeEventListener?.("change", updatePointerSupport);
  }, []);

  useEffect(() => {
    const syncGroupFromHash = () => {
      const groupId = window.location.hash.replace("#projects-", "");
      if (projectGroups.some(group => group.id === groupId)) setActiveGroup(groupId);
    };
    syncGroupFromHash();
    window.addEventListener("hashchange", syncGroupFromHash);
    return () => window.removeEventListener("hashchange", syncGroupFromHash);
  }, []);

  const selectGroup = groupId => {
    window.history.replaceState(null, "", `#projects-${groupId}`);
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

      <div ref={galleryRef} className="projects-editorial-gallery">
        <div className="projects-gallery-inner">
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

          <div className="projects-slider" data-active-group={activeGroup}>
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

        {supportsFinePointer && (
          <div className="projects-glass-overlay" data-html2canvas-ignore="true" aria-hidden="true">
            <FluidGlass
              mode="lens"
              captureTargetRef={galleryRef}
              trackingTargetRef={galleryRef}
              activeTargetRef={galleryRef}
              activeSelector=".project-masonry__media"
              lensProps={{
                scale: 0.055,
                ior: 1.15,
                thickness: 5,
                chromaticAberration: 0.03,
                anisotropy: 0.01,
              }}
              barProps={{}}
              cubeProps={{}}
            />
          </div>
        )}
      </div>
    </section>
  );
}
