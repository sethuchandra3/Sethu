import './MagicBento.css';

const cardData = [
  {
    role: 'Co-founder & President',
    organization: 'Lehigh Product Society',
    href: 'https://lehighproductsociety.org/',
    description:
      "Lead Lehigh's product community and an eight-week program where students build for major companies and pitch to product leaders."
  },
  {
    role: 'Director of Outreach',
    organization: 'Lehigh AI Club',
    href: 'https://www.instagram.com/lehighaiclub/',
    description:
      'Connect Lehigh students with AI alumni and industry leaders to support their professional and personal growth.'
  },
  {
    role: 'Orientation Leader',
    organization: 'Lehigh Office of First-Year Experience',
    href: 'https://studentaffairs.lehigh.edu/content/first-year-experience',
    description:
      'Help new Lehigh students feel at home, build connections, and confidently navigate campus life.'
  },
  {
    role: 'Tutor',
    organization: 'America Reads*America Counts',
    href: 'https://studentaffairs.lehigh.edu/content/community-service-office',
    description:
      'Tutor middle school students in reading and math, strengthening core skills and classroom confidence.'
  }
];

const awards = [
  {
    title: 'Eagle Scout Award',
    href: 'https://www.hoac-bsa.org/blue-elk/eagle-scout'
  },
  {
    title: 'Diana Award Recipient',
    href: 'https://diana-award.org.uk/'
  },
  {
    title: 'Duke of Edinburgh Gold Award',
    href: 'https://www.dofe.org/'
  }
];

const ExternalLink = ({ href, children, className }) => (
  <a className={className} href={href} target="_blank" rel="noreferrer">
    {children}
    <span aria-hidden="true"> ↗</span>
  </a>
);

const CommunityCard = ({ card }) => (
  <article className="magic-bento-card">
    <h2 className="magic-bento-card__title">{card.role}</h2>
    <ExternalLink className="magic-bento-card__organization" href={card.href}>
      {card.organization}
    </ExternalLink>
    <p className="magic-bento-card__description">{card.description}</p>
  </article>
);

export default function MagicBento() {
  return (
    <div className="card-grid bento-section">
      <div className="magic-bento-main">
        {cardData.map(card => (
          <CommunityCard card={card} key={card.role} />
        ))}
      </div>

      <article className="magic-bento-card magic-bento-card--awards">
        <h2 className="magic-bento-card__title">Awards &amp; honors</h2>
        <ul className="magic-bento-card__awards" aria-label="Awards and honors">
          {awards.map(award => (
            <li key={award.title}>
              <ExternalLink href={award.href}>{award.title}</ExternalLink>
            </li>
          ))}
        </ul>
        <p className="magic-bento-card__description">
          Recognition for leadership, service, and sustained community impact.
        </p>
      </article>
    </div>
  );
}
