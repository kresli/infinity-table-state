import { useLayoutEffect } from "react";
import { useLiveRef } from "./useLiveRef";

export function useScrollTopObserver(
  element: HTMLDivElement | null,
  callback: (scrollTop: number) => void
) {
  const callbackRef = useLiveRef(callback);

  useLayoutEffect(() => {
    if (!element) return;
    const onScroll = (e: Event) => {
      const element = e.currentTarget as HTMLDivElement;
      const scrollTop = element.scrollTop;
      callbackRef.current(scrollTop);
    };
    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, [callbackRef, element]);
}
