import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./HeaderDock.css";

const socialLinks = [
  { label: "X", href: "https://x.com/Sethu_Chandra_", icon: "x" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sethu-chandra/", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com/sethuchandra3", icon: "github" },
  { label: "Substack", href: "https://substack.com/@sethuchandra", icon: "substack" },
];

function SocialIcon({ icon }) {
  if (icon === "linkedin") return <span aria-hidden="true">in</span>;

  if (icon === "x") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    );
  }

  if (icon === "github") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5v-1.9c-2.78.62-3.37-1.2-3.37-1.2-.45-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 5.96c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92v2.85c0 .28.18.6.69.5A10.1 10.1 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 4h14v2H5V4Zm0 4h14v2H5V8Zm0 4h14v8l-7-3.9L5 20v-8Z" />
    </svg>
  );
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
    const initialTheme = document.body.dataset.theme || "light";
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = nextTheme;
    window.localStorage.setItem("sethu-theme", nextTheme);
    setTheme(nextTheme);
  };

  useEffect(() => {
    const root = rootRef.current;
    const full = fullRef.current;
    const compact = compactRef.current;
    const aboutSection = document.querySelector(".about-section");
    if (!root || !full || !compact) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener("scroll", requestUpdate);
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
