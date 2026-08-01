import Masonry from "./Masonry.jsx";
import ScrollFloat from "./ScrollFloat.jsx";

const projectPlaceholders = [
  {
    id: "project-01",
    img: "https://picsum.photos/id/180/1000/1200?grayscale",
    height: 470,
    category: "Growth",
    title: "Project placeholder 01",
    description: "A future case study for a product, growth system, or experiment.",
  },
  {
    id: "project-02",
    img: "https://picsum.photos/id/20/1000/900?grayscale",
    height: 340,
    category: "Product",
    title: "Project placeholder 02",
    description: "Space for the challenge, approach, and measurable outcome.",
  },
  {
    id: "project-03",
    img: "https://picsum.photos/id/48/1000/1200?grayscale",
    height: 440,
    category: "Community",
    title: "Project placeholder 03",
    description: "A future story about something built with and for people.",
  },
  {
    id: "project-04",
    img: "https://picsum.photos/id/60/1000/900?grayscale",
    height: 330,
    category: "Research",
    title: "Project placeholder 04",
    description: "A home for an insight-driven project and what it taught me.",
  },
  {
    id: "project-05",
    img: "https://picsum.photos/id/96/1000/1200?grayscale",
    height: 450,
    category: "Storytelling",
    title: "Project placeholder 05",
    description: "An upcoming piece of work spanning writing, media, or narrative.",
  },
  {
    id: "project-06",
    img: "https://picsum.photos/id/119/1000/900?grayscale",
    height: 350,
    category: "Next",
    title: "Project placeholder 06",
    description: "Reserved for the next idea that becomes real enough to share.",
  },
];

export default function ProjectsSection() {
  return (
    <section className="projects-section" aria-labelledby="projects-title">
      <header className="projects-heading">
        <p>Selected work</p>
        <ScrollFloat
          id="projects-title"
          animationDuration={1}
          ease="power2.out"
          scrollStart="top 88%"
          scrollEnd="top 42%"
          stagger={0.045}
        >
          Projects
        </ScrollFloat>
        <span>Case studies and experiments will live here soon.</span>
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
