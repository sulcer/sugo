import { useLayoutEffect, useState, type RefObject } from 'react';

/** Whether the element is narrower than `px`, kept current as it resizes (false on the server). */
export function useWidthBelow(ref: RefObject<HTMLElement | null>, px: number): boolean {
  const [below, setBelow] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    // The box's fractional width, as container queries see it (clientWidth is rounded).
    const measure = () => setBelow(element.getBoundingClientRect().width < px);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, px]);

  return below;
}
