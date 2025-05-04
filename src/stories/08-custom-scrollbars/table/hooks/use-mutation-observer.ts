import { useLayoutEffect } from "react";
import { useLiveRef } from "./use-live-ref";

export function useMutationObserver(
  element: HTMLDivElement | null,
  callback: (mutations: MutationRecord[]) => void
) {
  const callbackRef = useLiveRef(callback);
  useLayoutEffect(() => {
    if (!element) return;
    const observer = new MutationObserver((mutations) => callbackRef.current(mutations));
    observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [callbackRef, element]);
}
