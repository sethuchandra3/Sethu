import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import BrandIcon from "./BrandIcon.jsx";
import "./HeaderDock.css";

const socialLinks = [
  { label: "X", href: "https://x.com/Sethu_Chandra_", icon: "x" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sethu-chandra/", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com/sethuchandra3", icon: "github" },
  { label: "Substack", href: "https://substack.com/@sethuchandra", icon: "substack" },
];

function SocialIcon({ icon }) {
  return <BrandIcon icon={icon} />;
}

export default function HeaderDock() {
  const rootRef = useRef(null);
  const fullRef = useRef(null);
  const compactRef = useRef(null);
  const stateRef = useRef("intro");
  const hiddenLatchRef = useRef(false);
  const frameRef = useRef(0);
  const [state, setState] = useState("intro");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const initialTheme = document.documentElement.dataset.theme || document.body.dataset.theme || "light";
    document.documentElement.dataset.theme = initialTheme;
    document.body.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.body.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem("sethu-theme", nextTheme);
    } catch {
      // The visual theme still works when storage is blocked or unavailable.
    }
    setTheme(nextTheme);
  };

  useEffect(() => {
    const root = rootRef.current;
    const full = fullRef.current;
    const compact = compactRef.current;
    const aboutSection = document.querySelector(".about-section");
    if (!root || !full || !compact) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileNavigation = window.matchMedia("(max-width: 760px), (hover: none), (pointer: coarse)");
    const duration = reduceMotion ? 0 : 0.38;

    gsap.set(root, { autoAlpha: 0, y: -12 });
    gsap.set(full, { autoAlpha: 1, y: 0, scale: 1 });
    gsap.set(compact, { autoAlpha: 0, y: -10, scale: 0.94 });

    const transitionTo = (nextState) => {
      if (nextState === stateRef.current) return;
      stateRef.current = nextState;
      setState(nextState);

      if (nextState === "hidden") {
        gsap.to(root, {
          autoAlpha: 0,
          y: -18,
          duration: reduceMotion ? 0 : 0.3,
          ease: "power2.in",
          overwrite: "auto",
        });
        return;
      }

      gsap.to(root, {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(full, {
        autoAlpha: nextState === "full" ? 1 : 0,
        y: nextState === "full" ? 0 : -8,
        scale: nextState === "full" ? 1 : 0.985,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(compact, {
        autoAlpha: nextState === "compact" ? 1 : 0,
        y: nextState === "compact" ? 0 : -10,
        scale: nextState === "compact" ? 1 : 0.94,
        duration,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const updateHeader = () => {
      frameRef.current = 0;
      const scrollTop = window.scrollY;
      const aboutTop = aboutSection?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const heroHasEnded = aboutTop <= window.innerHeight * 0.92;
      const dockHasPassed = aboutTop <= window.innerHeight * 0.12;

      if (scrollTop <= 6) {
        hiddenLatchRef.current = false;
        if (stateRef.current !== "intro") transitionTo("full");
      } else if (mobileNavigation.matches) {
        hiddenLatchRef.current = false;
        transitionTo("full");
      } else if (dockHasPassed) {
        hiddenLatchRef.current = true;
        transitionTo("hidden");
      } else {
        hiddenLatchRef.current = false;
        transitionTo(heroHasEnded ? "compact" : "full");
      }
    };

    const introReveal = gsap.delayedCall(reduceMotion ? 0 : 2.05, () => {
      if (window.scrollY <= 6) transitionTo("full");
    });

    const requestUpdate = () => {
      if (!frameRef.current) frameRef.current = window.requestAnimationFrame(updateHeader);
    };

    updateHeader();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    mobileNavigation.addEventListener?.("change", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", requestUpdate);
      mobileNavigation.removeEventListener?.("change", requestUpdate);
      introReveal.kill();
      gsap.killTweensOf([root, full, compact]);
    };
  }, []);

  const fullTabIndex = state === "full" ? 0 : -1;
  const compactTabIndex = state === "compact" ? 0 : -1;

  return (
    <header ref={rootRef} className="site-header" data-state={state}>
      <nav
        ref={fullRef}
        className="site-header__full"
        aria-label="Primary navigation"
        aria-hidden={state !== "full"}
      >
        <a className="site-header__brand" href="#top" tabIndex={fullTabIndex}>Sethu Chandra</a>
        <div className="site-header__navigation">
          <a href="#projects" tabIndex={fullTabIndex}>Projects</a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer" tabIndex={fullTabIndex}>Resume</a>
          <span className="site-header__divider" aria-hidden="true" />
          <div className="site-header__socials" aria-label="Social media">
            {socialLinks.map(({ label, href, icon }) => (
              <a key={label} href={href} aria-label={label} title={label} target="_blank" rel="noreferrer" tabIndex={fullTabIndex}>
                <SocialIcon icon={icon} />
              </a>
            ))}
          </div>
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "dark"}
            tabIndex={fullTabIndex}
            onClick={toggleTheme}
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span className="theme-toggle-thumb" />
            </span>
          </button>
        </div>
      </nav>

      <nav
        ref={compactRef}
        className="site-header__compact"
        aria-label="Return to top"
        aria-hidden={state !== "compact"}
      >
        <a href="#top" tabIndex={compactTabIndex}>Sethu Chandra</a>
        <span className="site-header__dots" aria-hidden="true"><i /><i /><i /></span>
      </nav>
    </header>
  );
}
