/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { useLiveRef } from "./useLiveRef";

export function useFn<T extends (...args: any[]) => any>(fn: T) {
  const ref = useLiveRef(fn);
  return useCallback(
    (...args: Parameters<T>) => {
      return ref.current(...args);
    },
    [ref]
  );
}
