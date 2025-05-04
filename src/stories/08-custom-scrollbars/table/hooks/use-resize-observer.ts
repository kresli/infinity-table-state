import { useLayoutEffect } from "react";
import { useLiveRef } from "./use-live-ref";

export function useResizeObserver(element: HTMLDivElement | null, callback: () => void) {
  const onResize = useLiveRef(callback);
  useLayoutEffect(() => {
    if (!element) return;
    const resizeObserver = new ResizeObserver(() => onResize.current());
    resizeObserver.observe(element);
    return () => resizeObserver.unobserve(element);
  }, [element, onResize]);
}
