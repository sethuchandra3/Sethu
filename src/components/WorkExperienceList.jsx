import { forwardRef } from "react";
import AnimatedList from "./AnimatedList.jsx";

const workExperiences = [
  {
    id: "mesh",
    year: "2026",
    location: "Remote",
    role: "GTM Engineer",
    company: "Mesh (YC W25)",
    href: "https://www.usemesh.com/",
    tags: ["GTM Engineering", "Growth Systems", "Enterprise SaaS"],
    description:
      "Building inbound and outbound growth engines for the future of enterprise finance teams.",
  },
  {
    id: "bouken-capital",
    year: "Oct 2025 - Present",
    location: "San Francisco Bay Area",
    role: "Venture Capital Analyst",
    company: "Bouken Capital",
    href: "https://www.boukencapital.com/",
    tags: ["Venture Capital", "Due Diligence", "Financial Modeling"],
  },
  {
    id: "superpower",
    year: "2025",
    location: "Remote",
    role: "Product Marketer",
    company: "Superpower",
    href: "https://superpower.com/",
    tags: ["Product Marketing", "GTM Strategy", "HealthTech"],
  },
  {
    id: "rebee-health",
    year: "Jan 2025 - Aug 2025",
    location: "Singapore",
    role: "Product Strategy Intern",
    company: "Rebee Health",
    href: "https://www.rebeehealth.com/",
    tags: ["Corporate Strategy", "Financial Modeling", "Product Trials"],
  },
  {
    id: "you-com",
    year: "2025",
    location: "Bethlehem, PA",
    role: "Campus Strategy & Growth",
    company: "You.com",
    href: "https://you.com/",
    tags: ["Campus Growth", "Community Marketing", "AI Search"],
  },
  {
    id: "clever-harvey",
    year: "2023",
    location: "Mumbai, India",
    role: "Corporate Marketing Intern",
    company: "Clever Harvey",
    href: "https://cleverharvey.com/",
    tags: ["Corporate Marketing", "Content Strategy", "Market Research"],
  },
];

const WorkExperienceList = forwardRef(function WorkExperienceList({ onReachEnd }, forwardedRef) {
  return (
    <AnimatedList
      ref={forwardedRef}
      items={workExperiences}
      showGradients
      enableArrowNavigation
      displayScrollbar={false}
      pageDriven
      onReachEnd={onReachEnd}
      renderItem={(item) => (
        <>
          <div className={`work-experience__logo work-experience__logo--${item.id}`} aria-hidden="true">
            {item.id === "mesh" && <img src="/assets/mesh-mark-blue.png" alt="" />}
            {item.id === "bouken-capital" && <img src="/assets/bouken-capital-logo.png" alt="" />}
            {item.id === "superpower" && <img src="/assets/superpower-logo.png" alt="" />}
            {item.id === "rebee-health" && <img src="/assets/rebee-health-logo.png" alt="" />}
            {item.id === "you-com" && <img src="/assets/you-com-logo.png" alt="" />}
            {item.id === "clever-harvey" && <img src="/assets/clever-harvey-logo.png" alt="" />}
          </div>
          <div className="work-experience__content">
            <h3>{item.role}</h3>
            <p className="work-experience__company">
              <a
                className={`work-experience__company-link${item.id === "mesh" ? " work-experience__company-link--mesh" : ""}`}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                {item.company}
              </a>
            </p>
            <ul className="work-experience__tags" aria-label={`${item.company} skills`}>
              {item.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
          <time className="work-experience__year">{item.year}</time>
        </>
      )}
    />
  );
});

export default WorkExperienceList;
