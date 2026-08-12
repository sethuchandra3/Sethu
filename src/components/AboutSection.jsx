import ScrollReveal from "./ScrollReveal.jsx";
import "./AboutSection.css";

const splitWords = (text, keyPrefix) =>
  text.split(/(\s+)/).map((word, index) => {
    if (/^\s+$/.test(word)) return word;
    return (
      <span className="scroll-reveal__word" key={`${keyPrefix}-${index}`}>
        {word}
      </span>
    );
  });

export default function AboutSection() {
  return (
    <section className="about-section" aria-label="About Sethu Chandra">
      <div className="about-section__inner">
        <ScrollReveal
          baseOpacity={0.1}
          enableBlur
          baseRotation={3}
          blurStrength={4}
          rotationEnd="bottom 78%"
          wordAnimationEnd="bottom 70%"
        >
          <div className="about-section__copy">
            <p>
              {splitWords("I'm a creative engineer 🎨👩🏽‍💻", "intro")}
            </p>
            <p>
              {splitWords(
                "Passionate about translating user insights into enhanced products, building meaningful communities, and data-driven storytelling.",
                "intro-drawn",
              )}
            </p>
            <p>
              {splitWords("Third culture kid that grew up in ", "places-intro")}
              <span className="scroll-reveal__word about-section__country-pair">🇰🇪 Kenya,</span>{" "}
              <span className="scroll-reveal__word about-section__country-pair">🇹🇿 Tanzania,</span>{" "}
              {splitWords("and ", "places-join")}
              <span className="scroll-reveal__word about-section__country-pair">🇮🇳 India.</span>
            </p>
            <p>
              {splitWords("Currently leading GTM at ", "current-role")}
              <a
                className="about-section__mesh-link"
                href="https://www.usemesh.com/"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/assets/mesh-mark-blue.png" width="173" height="173" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                <span className="scroll-reveal__word about-section__linked-name">Mesh (YC W25)</span>
              </a>
              {splitWords(" and studying ", "study-intro")}
              <span className="scroll-reveal__word about-section__inline-pair">🧬 biocomputational</span>{" "}
              {splitWords("engineering with a minor in 🗿 philosophy at ", "study")}
              <a href="https://www2.lehigh.edu/" target="_blank" rel="noreferrer">
                <span className="scroll-reveal__word about-section__linked-name">Lehigh</span>
              </a>
              <span className="scroll-reveal__word">.</span>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
