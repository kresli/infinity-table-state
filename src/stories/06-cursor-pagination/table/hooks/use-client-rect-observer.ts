import { useLayoutEffect } from "react";
import { useLiveRef } from "./use-live-ref";

export function useClientRectObserver(
  element: HTMLDivElement | null,
  callback: (clientRect: DOMRectReadOnly) => void
) {
  const callbackRef = useLiveRef(callback);

  useLayoutEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === element) return callbackRef.current(entry.contentRect);
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [callbackRef, element]);
}
