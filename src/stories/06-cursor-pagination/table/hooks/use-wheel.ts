import { useLayoutEffect } from "react";
import { useLiveRef } from "./use-live-ref";

export function useWheel(element: HTMLDivElement | null, callback: (e: WheelEvent) => void) {
  const callbackRef = useLiveRef(callback);
  useLayoutEffect(() => {
    if (!element) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      callbackRef.current(e);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [element, callbackRef]);
}
