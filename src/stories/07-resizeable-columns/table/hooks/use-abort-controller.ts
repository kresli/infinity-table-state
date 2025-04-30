import { useRef, useEffect } from "react";

export function useAbortController() {
  const controllerRef = useRef<AbortController>(new AbortController());

  const resetController = (target?: AbortController) => {
    if (target && target !== controllerRef.current) return target;
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
    return controllerRef.current;
  };

  useEffect(() => () => controllerRef.current.abort(), []);

  return { resetController };
}
