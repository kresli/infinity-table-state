import { test } from "vitest";
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
// Helper function to create id objects
interface Item {
  id: number;
}
const v = (id: number): Item => ({ id });

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
  const prevArrayIds = prevArray.map((item) => (item ? getItemId(item) : null));
  const nextArrayIds = nextArray.map((item) => (item ? getItemId(item) : null));
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

test("noChange - identical data", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 0,
    offset: 0,
  });
});

test("belowOnly - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(3), v(4)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 0,
    offset: 0,
  });
});

test("withinViewport - changed", () => {
  // this should not change the offset as the second cursor is not affected and is on the same index
  const prevArray: Item[] = [v(1), v(2), v(3), v(4)];
  const nextArray: Item[] = [v(6), v(2), v(3), v(4)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 1,
    originalNextIndex: 1,
    offset: 0,
  });
});

test("aboveOnly - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(6), v(7), v(3), v(4), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 2,
    originalNextIndex: 2,
    offset: 0,
  });
});

test("aboveAndWithin - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(6), v(7), v(8), v(4), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 3,
    originalNextIndex: 3,
    offset: 0,
  });
});

test("belowAndWithin - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(8), v(9), v(10)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 0,
    offset: 0,
  });
});

test("surroundingViewport - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(6), v(7), v(3), v(8), v(9)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 2,
    originalNextIndex: 2,
    offset: 0,
  });
});

test("completeDataMismatch - all changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3)];
  const nextArray: Item[] = [v(4), v(5), v(6)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual(null);
});

test("aboveOnly - added", () => {
  const prevArray: Item[] = [v(1), v(2), v(3)];
  const nextArray: Item[] = [v(6), v(7), v(1), v(2), v(3)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 2,
    offset: 2,
  });
});

test("belowOnly - added", () => {
  const prevArray: Item[] = [v(1), v(2), v(3)];
  const nextArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 0,
    offset: 0,
  });
});

test("withinViewport - added", () => {
  const prevArray: Item[] = [v(1), v(3)];
  const nextArray: Item[] = [v(1), v(2), v(3)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 0,
    offset: 0,
  });
});

test("aboveOnly - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(3), v(4), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 2,
    originalNextIndex: 0,
    offset: -2,
  });
});

test("withinViewport - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(3), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 0,
    offset: 0,
  });
});

test("aboveAndWithin - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(3), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 2,
    originalNextIndex: 0,
    offset: -2,
  });
});

test("belowAndWithin - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(4)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 0,
    originalNextIndex: 0,
    offset: 0,
  });
});

test("surroundingViewport - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(3)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 2,
    originalNextIndex: 0,
    offset: -2,
  });
});

test("with nulls", () => {
  const prevArray = [null, v(1), v(3), v(4), v(5)];
  const nextArray = [v(1), null, null, v(4), v(5)];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });
  expect(cursorOffset).toEqual({
    originalPrevIndex: 1,
    originalNextIndex: 0,
    offset: -1,
  });
});
