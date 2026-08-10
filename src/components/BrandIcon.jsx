import { siGithub, siSubstack, siX } from "simple-icons";
import "./BrandIcon.css";

const icons = {
  github: siGithub,
  substack: siSubstack,
  x: siX,
};

export default function BrandIcon({ icon, className }) {
  const classes = ["brand-icon", className].filter(Boolean).join(" ");

  if (icon === "linkedin") {
    return (
      <span className={`${classes} brand-icon--linkedin`} aria-hidden="true">
        <img
          className="brand-icon__linkedin-black"
          src="/assets/linkedin-in-black.png"
          alt=""
          width="840"
          height="779"
        />
        <img
          className="brand-icon__linkedin-white"
          src="/assets/linkedin-in-white.png"
          alt=""
          width="840"
          height="779"
        />
      </span>
    );
  }

  const brand = icons[icon];
  if (!brand) return null;

  return (
    <svg
      className={classes}
      aria-hidden="true"
      viewBox="0 0 24 24"
      focusable="false"
    >
      <path d={brand.path} />
    </svg>
  );
}
