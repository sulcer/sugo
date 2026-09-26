import { useLayoutEffect, useState, type RefObject } from 'react';
import type { ViewBox } from './geometry';

type Size = { width: number; height: number; measured: boolean };

/**
 * Viewbox units per screen pixel for a drawing filling `ref`. Starts from a nominal width so the
 * server render is already close; measures before the first client paint, then — like the design —
 * redraws only when the width moves more than 12 % or the height more than 30 px.
 */
export function useDrawingScale(
  ref: RefObject<HTMLElement | null>,
  viewBox: ViewBox,
  nominalWidth: number,
  aspect: number,
): number {
  const [size, setSize] = useState<Size>({
    width: nominalWidth,
    height: nominalWidth / aspect,
    measured: false,
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      if (!width) return;
      const height = element.clientHeight < 20 ? width / aspect : element.clientHeight;
      setSize((previous) =>
        previous.measured &&
        Math.abs(width - previous.width) / previous.width < 0.12 &&
        Math.abs(height - previous.height) < 30
          ? previous
          : { width, height, measured: true },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, aspect]);

  return Math.max(viewBox[2] / size.width, viewBox[3] / size.height);
}
