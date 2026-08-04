import "./Masonry.css";

export default function Masonry({ items, headingTag = "h3" }) {
  const HeadingTag = headingTag;

  return (
    <div className="project-masonry" aria-label="Project index">
      {items.map((item) => {
        const ItemTag = item.href ? "a" : "article";

        return (
          <ItemTag
            key={item.id}
            data-project-key={item.id}
            className="project-masonry__item"
            href={item.href}
            target={item.href ? "_blank" : undefined}
            rel={item.href ? "noreferrer" : undefined}
            aria-label={item.href ? `${item.title}, ${item.cursorLabel || "view project"} (opens in a new tab)` : undefined}
          >
            <div
              className="project-masonry__media"
              data-cursor-label={item.cursorLabel || "View case study"}
            >
              <img
                src={item.img}
                alt={`${item.title} project preview`}
                loading={item.id === "project-01" ? "eager" : "lazy"}
              />
            </div>
            <div className="project-masonry__content">
              <HeadingTag>{item.title}</HeadingTag>
              <p className="project-masonry__description">{item.description}</p>
              <span className="project-masonry__action">
                {item.cursorLabel || "View project"}
                <i aria-hidden="true">↗</i>
              </span>
            </div>
          </ItemTag>
        );
      })}
    </div>
  );
}
