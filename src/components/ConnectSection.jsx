import { Mail } from "lucide-react";
import ScrollVelocity from "./ScrollVelocity.jsx";

const contactLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sethu-chandra",
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
        texts={["Let's connect", "startups, public speaking, philosophy, dance"]}
        velocity={28}
        damping={52}
        stiffness={280}
        numCopies={6}
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
            {icon === "linkedin" && (
              <span className="connect-icon-text" aria-hidden="true">
                in
              </span>
            )}
            {icon === "github" && (
              <svg className="connect-github-icon" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5v-1.9c-2.78.62-3.37-1.2-3.37-1.2-.45-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 5.96c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92v2.85c0 .28.18.6.69.5A10.1 10.1 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
              </svg>
            )}
          </a>
        ))}
      </nav>

      <p className="connect-signoff">Sethu Chandra</p>
    </section>
  );
}
