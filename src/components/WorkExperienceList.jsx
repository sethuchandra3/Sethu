import AnimatedList from "./AnimatedList.jsx";

const workExperiences = [
  {
    id: "mesh",
    period: "Current",
    role: "GTM Engineer",
    company: "Mesh (YC W25)",
    description:
      "Building inbound and outbound growth engines for the future of enterprise finance teams.",
  },
  {
    id: "work-placeholder-2",
    period: "Previous",
    role: "Work experience",
    company: "Details coming soon",
    description: "Role, impact, and the story behind the work will be added here.",
  },
  {
    id: "work-placeholder-3",
    period: "Previous",
    role: "Work experience",
    company: "Details coming soon",
    description: "Role, impact, and the story behind the work will be added here.",
  },
  {
    id: "work-placeholder-4",
    period: "Earlier",
    role: "Project or internship",
    company: "Details coming soon",
    description: "A place for another experience, project, or formative chapter.",
  },
  {
    id: "work-placeholder-5",
    period: "Earlier",
    role: "Project or internship",
    company: "Details coming soon",
    description: "A place for another experience, project, or formative chapter.",
  },
];

export default function WorkExperienceList() {
  return (
    <AnimatedList
      items={workExperiences}
      showGradients
      enableArrowNavigation
      displayScrollbar={false}
      renderItem={(item, index) => (
        <>
          <div className="work-experience__meta">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{item.period}</span>
          </div>
          <div className="work-experience__content">
            <p className="work-experience__company">{item.company}</p>
            <h3>{item.role}</h3>
            <p>{item.description}</p>
          </div>
        </>
      )}
    />
  );
}
