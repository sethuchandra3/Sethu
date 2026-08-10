import "./Masonry.css";

export default function Masonry({ items, headingTag = "h3" }) {
  const HeadingTag = headingTag;

  return (
    <div
      className="project-masonry"
      aria-label="Project index"
      data-item-count={items.length}
    >
      {items.map((item) => {
        return (
          <article
            key={item.id}
            data-project-key={item.id}
            className="project-masonry__item"
          >
            <a
              className="project-masonry__media"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.title}, ${item.cursorLabel || "view project"} (opens in a new tab)`}
              data-cursor-label={item.cursorLabel || "View case study"}
            >
              <img
                src={item.img}
                alt={`${item.title} project preview`}
                width={item.imageWidth}
                height={item.imageHeight}
                loading={item.id === "project-01" ? "eager" : "lazy"}
                decoding="async"
              />
            </a>
            <div className="project-masonry__content">
              <HeadingTag>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </HeadingTag>
              <p className="project-masonry__description">{item.description}</p>
              <a
                className="project-masonry__action"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.cursorLabel || "View project"}
                <i aria-hidden="true">↗</i>
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
