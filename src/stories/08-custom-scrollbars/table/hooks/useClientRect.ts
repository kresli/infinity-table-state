import { useState } from "react";
import { useResizeObserver } from "./use-resize-observer";
import { useMutationObserver } from "./use-mutation-observer";

export function useClientRect(element: HTMLDivElement | null) {
  const [clientRect, setClientRect] = useState(() => new DOMRect());

  useResizeObserver(element, () => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setClientRect(rect);
  });

  useMutationObserver(element, () => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setClientRect(rect);
  });

  return clientRect;
}
