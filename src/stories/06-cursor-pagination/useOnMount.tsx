import { useEffect } from "react";

export function useOnMount<T>(fn: () => T | Promise<T>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void fn(), []);
}
