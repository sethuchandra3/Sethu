import { forwardRef } from 'react';
import './MagicBento.css';
import AnimatedList from './AnimatedList.jsx';

const cardData = [
  {
    area: 'Community building',
    role: 'Co-founder & President',
    organization: 'Lehigh Product Society',
    href: 'https://lehighproductsociety.org/',
    logo: '/assets/community/lehigh-product-society.png',
    logoAlt: 'Lehigh Product Society logo',
    logoKey: 'lehigh-product-society',
    description:
      "Lead Lehigh's product community and an eight-week program where students build for major companies and pitch to product leaders.",
    accent: 'orange'
  },
  {
    area: 'Industry outreach',
    role: 'Director of Outreach',
    organization: 'Lehigh AI Club',
    href: 'https://www.instagram.com/lehighaiclub/',
    logo: '/assets/community/lehigh-ai-club.png',
    logoAlt: 'Lehigh AI Club logo',
    logoKey: 'lehigh-ai-club',
    description:
      'Connect students with AI alumni and industry leaders who can support their professional and personal growth.',
    accent: 'pink'
  },
  {
    area: 'Student belonging',
    role: 'Orientation Leader',
    organization: 'Lehigh Office of First-Year Experience',
    href: 'https://studentaffairs.lehigh.edu/content/first-year-experience',
    logo: '/assets/community/lehigh-ofye.png',
    logoAlt: 'Lehigh Office of the First-Year Experience logo',
    logoKey: 'lehigh-ofye',
    description:
      'Help new students feel at home, build lasting connections, and confidently navigate campus life.',
    accent: 'pink'
  },
  {
    area: 'Education access',
    role: 'Tutor',
    organization: 'America Reads*America Counts',
    href: 'https://studentaffairs.lehigh.edu/content/community-service-office',
    logo: '/assets/community/america-reads-counts.png',
    logoAlt: 'America Reads America Counts logo',
    logoKey: 'america-reads-counts',
    description:
      'Tutor middle school students in reading and math, strengthening core skills and classroom confidence.',
    accent: 'orange'
  }
];

const awards = [
  {
    title: 'Eagle Scout Award',
    href: 'https://www.hoac-bsa.org/blue-elk/eagle-scout',
    logo: '/assets/community/eagle-scout-award.png',
    logoAlt: 'Eagle Scout emblem'
  },
  {
    title: 'Diana Award Recipient',
    href: 'https://diana-award.org.uk/',
    logo: '/assets/community/diana-award.png',
    logoAlt: 'The Diana Award logo',
    logoKey: 'diana-award'
  },
  {
    title: 'Duke of Edinburgh Gold Award',
    href: 'https://www.dofe.org/',
    logo: '/assets/community/duke-of-edinburgh-award.png',
    logoAlt: 'The Duke of Edinburgh Award logo'
  }
];

const MagicBento = forwardRef(function MagicBento(_, forwardedRef) {
  return (
    <div className="community-showcase bento-section">
      <AnimatedList
        ref={forwardedRef}
        className="community-animated-list"
        items={cardData}
        ariaLabel="Community experience"
        showGradients
        enableArrowNavigation
        displayScrollbar={false}
        pageDriven
        renderItem={(card) => (
          <>
            <div
              className="community-experience__logo"
              data-accent={card.accent}
              data-logo={card.logoKey}
            >
              <img src={card.logo} alt={card.logoAlt} loading="lazy" decoding="async" />
            </div>
            <div className="community-experience__content">
              <h3>{card.role}</h3>
              <a
                className="community-experience__organization"
                href={card.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${card.organization} website`}
                onClick={(event) => event.stopPropagation()}
              >
                {card.organization}<span aria-hidden="true"> ↗</span>
              </a>
              <p>{card.description}</p>
            </div>
            <p className="community-experience__area">{card.area}</p>
          </>
        )}
      />

      <aside className="magic-bento-awards" aria-labelledby="community-awards-title">
        <div className="magic-bento-awards__heading">
          <h3 id="community-awards-title">Awards &amp; honors</h3>
        </div>
        <ul className="magic-bento-card__awards" aria-label="Awards and honors">
          {awards.map(award => (
            <li key={award.title}>
              <a href={award.href} target="_blank" rel="noreferrer">
                <span className="magic-bento-card__award-title">{award.title}</span>
                <img
                  className="magic-bento-card__award-logo"
                  src={award.logo}
                  alt={award.logoAlt}
                  data-logo={award.logoKey}
                  loading="lazy"
                  decoding="async"
                />
                <span className="magic-bento-card__award-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
});

export default MagicBento;
