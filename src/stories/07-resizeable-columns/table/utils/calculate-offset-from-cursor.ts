import { findLongestCommonSubarray } from "./find-longest-common-subarray";

type Id = string | number;
interface Params<T> {
  prevArray: (null | T)[];
  nextArray: (null | T)[];
  getItemId: (item: T) => Id;
}
interface OffsetCursor {
  originalPrevIndex: number;
  originalNextIndex: number;
  offset: number;
}

/**
 * returns the index of the cursor in the prevArray and the offset to be applied to the nextArray
 * the originalPrevIndex is calculated by finding the longest common subarray between the two arrays
 * Data change scenarios (short identifiers):
 *
 * 1. `aboveOnly` – Change occurs entirely above the viewport.
 * 2. `belowOnly` – Change occurs entirely below the viewport.
 * 3. `withinViewport` – Change occurs entirely within the viewport.
 * 4. `aboveAndWithin` – Change spans above and within the viewport.
 * 5. `belowAndWithin` – Change spans below and within the viewport.
 * 6. `surroundingViewport` – Change spans both above and below the viewport, but not inside it.
 */
export function calculateOffsetFromCursor<T>(params: Params<T>): OffsetCursor | null {
  const { prevArray, nextArray, getItemId } = params;
  const prevArrayIds = prevArray.map((item) => (item ? getItemId(item) : performance.now()));
  const nextArrayIds = nextArray.map((item) => (item ? getItemId(item) : performance.now()));
  const commonSubarray = findLongestCommonSubarray(prevArrayIds, nextArrayIds);
  // If no common subarray is found, return null
  if (!commonSubarray) return null;

  const { sourceArrayIndex, sourceShift } = commonSubarray;
  const originalPrevIndex = sourceArrayIndex;
  const originalNextIndex = sourceArrayIndex + sourceShift;

  // Calculate the offset based on the common subarray
  const offset = sourceShift;

  return { originalPrevIndex, offset, originalNextIndex };
}
