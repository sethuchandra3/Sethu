import { Mail } from "lucide-react";
import BrandIcon from "./BrandIcon.jsx";
import ScrollVelocity from "./ScrollVelocity.jsx";
import InterestVelocity from "./InterestVelocity.jsx";

const interestText = "startups, public speaking, philosophy, dance, taekwondo, solo travelling, playing the drums, film making, music, anime, fun UI/UX, cultural experiences";
const interestWords = [
  "startups",
  "public speaking",
  "philosophy",
  "dance",
  "taekwondo",
  "solo travelling",
  "playing the drums",
  "film making",
  "music",
  "anime",
  "fun UI/UX",
  "cultural experiences",
];

const contactLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sethu-chandra/",
    icon: "linkedin",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:sec228@lehigh.edu",
    icon: "mail",
  },
  {
    label: "GitHub",
    href: "https://github.com/sethuchandra3",
    icon: "github",
    external: true,
  },
];

export default function ConnectSection() {
  return (
    <section className="connect-section" aria-labelledby="connect-title">
      <h2 id="connect-title" className="sr-only">
        Let's connect
      </h2>

      <ScrollVelocity
        texts={["Let's connect"]}
        velocity={66}
        scrollBoostVelocity={52}
        damping={52}
        stiffness={280}
        numCopies={6}
      />

      <InterestVelocity
        text={interestText}
        highlightWords={interestWords}
        highlightClass="is-interest"
        velocity={34}
        direction="right"
        numCopies={4}
        velocityMapping={{ input: [0, 1000], output: [0, 5.5] }}
        fontSize="clamp(1.35rem, 2.6vw, 2.2rem)"
      />

      <nav className="connect-links" aria-label="Contact Sethu Chandra">
        {contactLinks.map(({ label, href, icon, external }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            title={label}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
          >
            {icon === "mail" && <Mail aria-hidden="true" strokeWidth={2} />}
            {icon === "linkedin" && <BrandIcon icon="linkedin" className="connect-brand-icon" />}
            {icon === "github" && <BrandIcon icon="github" className="connect-brand-icon" />}
          </a>
        ))}
      </nav>

      <footer className="connect-footer">
        <p>© {new Date().getFullYear()} Sethu Chandra</p>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </section>
  );
}
