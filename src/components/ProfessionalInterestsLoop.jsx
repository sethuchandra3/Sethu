import { useMemo } from "react";
import LogoLoop from "./LogoLoop.jsx";
import "./ProfessionalInterestsLoop.css";

const interests = [
  "Product",
  "Go-to-Market",
  "Marketing",
  "Growth",
  "Content Creation",
  "Design",
  "Creative Technology",
];

export default function ProfessionalInterestsLoop() {
  const items = useMemo(
    () =>
      interests.flatMap((interest) => [
        {
          node: <span className="professional-loop__term">{interest}</span>,
          title: interest,
        },
        {
          node: <span className="professional-loop__separator" aria-hidden="true">✳</span>,
          title: "",
        },
      ]),
    [],
  );

  return (
    <LogoLoop
      logos={items}
      speed={105}
      direction="left"
      logoHeight={56}
      gap={34}
      pauseOnHover={false}
      ariaLabel={`Professional interests: ${interests.join(", ")}`}
      className="professional-loop"
    />
  );
}
