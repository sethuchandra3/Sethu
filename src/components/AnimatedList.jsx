import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import "./AnimatedList.css";

function AnimatedItem({ children, index, scrollRoot, selected, onSelect }) {
  const itemRef = useRef(null);
  const inView = useInView(itemRef, {
    root: scrollRoot,
    amount: 0.55,
    margin: "-8% 0px -8% 0px",
  });

  return (
    <motion.button
      ref={itemRef}
      className={`animated-list__item${selected ? " is-selected" : ""}`}
      type="button"
      role="option"
      aria-selected={selected}
      data-index={index}
      onClick={onSelect}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.35, y: 14, scale: 0.98 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.button>
  );
}

export default function AnimatedList({
  items,
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  displayScrollbar = true,
  initialSelectedIndex = 0,
  className = "",
}) {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const updateGradients = useCallback((element) => {
    const { scrollTop, scrollHeight, clientHeight } = element;
    setTopGradientOpacity(Math.min(scrollTop / 56, 1));
    setBottomGradientOpacity(
      scrollHeight <= clientHeight
        ? 0
        : Math.min((scrollHeight - scrollTop - clientHeight) / 56, 1),
    );
  }, []);

  useEffect(() => {
    if (listRef.current) updateGradients(listRef.current);
  }, [items, updateGradients]);

  const selectItem = useCallback(
    (index) => {
      const nextIndex = Math.min(Math.max(index, 0), items.length - 1);
      setSelectedIndex(nextIndex);
      onItemSelect?.(items[nextIndex], nextIndex);

      const selectedItem = listRef.current?.querySelector(`[data-index="${nextIndex}"]`);
      selectedItem?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [items, onItemSelect],
  );

  const handleKeyDown = (event) => {
    if (!enableArrowNavigation) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectItem(selectedIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectItem(selectedIndex - 1);
    }
  };

  return (
    <div className={`animated-list ${className}`.trim()}>
      <div
        ref={listRef}
        className={`animated-list__scroll${displayScrollbar ? "" : " no-scrollbar"}`}
        role="listbox"
        aria-label="Work experience"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={(event) => updateGradients(event.currentTarget)}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={item.id ?? index}
            index={index}
            scrollRoot={listRef}
            selected={selectedIndex === index}
            onSelect={() => selectItem(index)}
          >
            {renderItem ? renderItem(item, index) : item}
          </AnimatedItem>
        ))}
      </div>

      {showGradients && (
        <>
          <div className="animated-list__gradient is-top" style={{ opacity: topGradientOpacity }} />
          <div className="animated-list__gradient is-bottom" style={{ opacity: bottomGradientOpacity }} />
        </>
      )}
    </div>
  );
}
