import Masonry from "./Masonry.jsx";
import ScrollFloat from "./ScrollFloat.jsx";

const projectPlaceholders = [
  {
    id: "project-01",
    img: "/assets/mesh-homepage.jpg",
    height: 470,
    category: "Website",
    title: "Mesh Website Design",
    description:
      "Rebuilt Mesh’s website around its ICP and brand, improving SEO, search visibility, and conversion clarity.",
    href: "https://usemesh.com/",
    cursorLabel: "View website",
  },
  {
    id: "project-02",
    img: "/assets/spotify-insights.png",
    height: 340,
    category: "Case Study",
    title: "Spotify Insights: Make Podcasts Rememberable",
    description:
      "Designed a podcast memory layer for capturing, searching, and sharing insights and quotes while listening.",
    href: "https://superficial-wolf-2a8.notion.site/Spotify-Insights-Make-Podcasts-Rememberable-Insight-Capture-Sharing-Layer-39500521ab31817ea491dd6094e774a9",
    cursorLabel: "View case study",
  },
  {
    id: "project-03",
    img: "/assets/researchbuddy-cover.png",
    height: 440,
    category: "Hackathon MVP",
    title: "Rodney: Your Research Buddy",
    description:
      "Built an interactive AI research assistant MVP at an MLH hackathon to make scientific papers easier for everyone to understand.",
    href: "https://github.com/sethuchandra3/researchbuddy",
    cursorLabel: "View project",
  },
  {
    id: "project-04",
    img: "/assets/designathon-cooking-app.webp",
    height: 330,
    category: "Designathon Prototype",
    title: "AI Cooking Companion",
    description:
      "Designed a beginner-friendly cooking app that combines TikTok-style recipes with hands-free AI voice guidance.",
    href: "https://www.figma.com/design/f39mtF9PRe36RupvsY37UY/Prototype?node-id=0-1&t=AQRoZ5SMH3DpLIng-1",
    cursorLabel: "View prototype",
  },
  {
    id: "project-05",
    img: "/assets/pinterest-wrapped-concept.png",
    height: 450,
    category: "Product Concept",
    title: "Pinterest Wrapped: Your Year in Aesthetics",
    description:
      "Conceptualized a shareable annual recap that turns a year of saves into a named aesthetic identity and a new-user growth loop.",
    href: "https://superficial-wolf-2a8.notion.site/Pinterest-Wrapped-Your-Year-in-Aesthetics-shareable-annual-recap-39500521ab3181489ca3da05c95a937f?source=copy_link",
    cursorLabel: "View case study",
  },
];

export default function ProjectsSection() {
  return (
    <section id="projects" className="projects-section" aria-labelledby="projects-title">
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
          Case studies, concepts and shipped products.
        </ScrollFloat>
      </header>

      <Masonry
        items={projectPlaceholders}
        ease="power3.out"
        duration={0.65}
        stagger={0.07}
        animateFrom="bottom"
        scaleOnHover
        hoverScale={0.975}
        blurToFocus
      />
    </section>
  );
}
