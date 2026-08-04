import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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
    <motion.div
      ref={itemRef}
      className={`animated-list__item${selected ? " is-selected" : ""}`}
      role="option"
      tabIndex={0}
      aria-selected={selected}
      data-index={index}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.35, y: 14, scale: 0.98 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const AnimatedList = forwardRef(function AnimatedList({
  items,
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  displayScrollbar = true,
  initialSelectedIndex = 0,
  className = "",
  ariaLabel = "Work experience",
  pageDriven = false,
  onReachEnd,
}, forwardedRef) {
  const listRef = useRef(null);
  const reachedEndRef = useRef(false);
  const programmaticScrollUntilRef = useRef(0);
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

  useImperativeHandle(
    forwardedRef,
    () => ({
      setProgress(progress) {
        const element = listRef.current;
        if (!element) return;

        const clampedProgress = Math.min(Math.max(progress, 0), 1);
        const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
        programmaticScrollUntilRef.current = performance.now() + 120;
        element.scrollTop = maxScroll * clampedProgress;
        updateGradients(element);

        const nextIndex = Math.round(clampedProgress * Math.max(items.length - 1, 0));
        setSelectedIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
      },
    }),
    [items.length, updateGradients],
  );

  const selectItem = useCallback(
    (index) => {
      const nextIndex = Math.min(Math.max(index, 0), items.length - 1);
      setSelectedIndex(nextIndex);
      onItemSelect?.(items[nextIndex], nextIndex);

      const element = listRef.current;
      if (pageDriven && element) {
        const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
        const denominator = Math.max(items.length - 1, 1);
        element.scrollTo({ top: (nextIndex / denominator) * maxScroll, behavior: "smooth" });
      } else {
        const selectedItem = element?.querySelector(`[data-index="${nextIndex}"]`);
        selectedItem?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    [items, onItemSelect, pageDriven],
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

  const handleScroll = (event) => {
    const element = event.currentTarget;
    updateGradients(element);

    const distanceFromEnd = element.scrollHeight - element.scrollTop - element.clientHeight;
    const reachedEnd = distanceFromEnd <= 4;
    const isProgrammatic = performance.now() < programmaticScrollUntilRef.current;

    if (!reachedEnd) {
      reachedEndRef.current = false;
    } else if (!isProgrammatic && !reachedEndRef.current) {
      reachedEndRef.current = true;
      onReachEnd?.();
    }

    if (!pageDriven) return;
    const maxScroll = Math.max(0, element.scrollHeight - element.clientHeight);
    const progress = maxScroll > 0 ? element.scrollTop / maxScroll : 0;
    const nextIndex = Math.round(progress * Math.max(items.length - 1, 0));
    setSelectedIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
  };

  return (
    <div className={`animated-list ${className}`.trim()}>
      <div
        ref={listRef}
        className={`animated-list__scroll${displayScrollbar ? "" : " no-scrollbar"}${pageDriven ? " is-page-driven" : ""}`}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
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
});

export default AnimatedList;
