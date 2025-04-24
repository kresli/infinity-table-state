import { test } from "vitest";

type Id = string | number;

interface Props<T> {
  prevArray: (null | T)[];
  nextArray: (null | T)[];
  cursors: number[];
  getItemId: (item: T) => Id;
}

// Helper function to create id objects
interface Item {
  id: number;
}
const v = (id: number): Item => ({ id });

/**
 * @returns the cursor index and the offset to to cursor index
 * - cursors are the visible items in the viewpor + buffer
 * Possible data change scenarios relative to the visible viewport:
 *
 * Data change scenarios (short identifiers):
 *
 * 1. `aboveOnly` – Change occurs entirely above the viewport.
 * 2. `belowOnly` – Change occurs entirely below the viewport.
 * 3. `withinViewport` – Change occurs entirely within the viewport.
 * 4. `aboveAndWithin` – Change spans above and within the viewport.
 * 5. `belowAndWithin` – Change spans below and within the viewport.
 * 6. `surroundingViewport` – Change spans both above and below the viewport, but not inside it.
 */
function calculateOffsetFromCursor<T>(props: Props<T>): [cursorIndex: number, offset: number] {
  const prevIdsArray = getCursorsArray(props.cursors, props.prevArray, props.getItemId);
  const nextIdsArray = getCursorsArray(props.cursors, props.nextArray, props.getItemId);
  // Check if the cursors are the same
  if (prevIdsArray.every((id, index) => id === nextIdsArray[index])) return [props.cursors[0], 0];
  // Check if first matching cursor is the same
  if (prevIdsArray.some((id, index) => id === nextIdsArray[index])) return [props.cursors[0], 0];
  return [Infinity, Infinity];
}

function getCursorsArray<T>(
  cursors: number[],
  array: (T | null)[],
  getItemId: (item: T) => Id
): (Id | null)[] {
  return cursors.map((cursorIndex) => {
    const item = array[cursorIndex];
    return item ? getItemId(item) : null;
  });
}

test("noChange - identical data", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const cursors = [0];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("belowOnly - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(3), v(4)];
  const cursors = [0, 1];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("withinViewport - changed", () => {
  // this should not change the offset as the second cursor is not affected and is on the same index
  const prevArray: Item[] = [v(1), v(2), v(3), v(4)];
  const nextArray: Item[] = [v(6), v(2), v(3), v(4)];
  const cursors = [0, 1];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("aboveOnly - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(6), v(7), v(3), v(4), v(5)];
  const cursors = [2, 3, 4]; // Viewport starts at index 2
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([2, 0]);
});

test("aboveAndWithin - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(6), v(7), v(8), v(4), v(5)];
  const cursors = [2, 3, 4]; // Viewport starts at index 2
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([3, 0]);
});

test("belowAndWithin - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(8), v(9), v(10)];
  const cursors = [0, 1, 2]; // Viewport ends at index 2
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("surroundingViewport - changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(6), v(7), v(3), v(8), v(9)];
  const cursors = [2]; // Viewport is only index 2
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([2, 0]);
});

test("completeDataMismatch - all changed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3)];
  const nextArray: Item[] = [v(4), v(5), v(6)];
  const cursors = [0, 1, 2];
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("aboveOnly - added", () => {
  const prevArray: Item[] = [v(1), v(2), v(3)];
  const nextArray: Item[] = [v(6), v(7), v(1), v(2), v(3)];
  const cursors = [0, 1, 2]; // In prevArray, these are all the items
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([2, 0]);
});

test("belowOnly - added", () => {
  const prevArray: Item[] = [v(1), v(2), v(3)];
  const nextArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const cursors = [0, 1, 2]; // In prevArray, these are all the items
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("withinViewport - added", () => {
  const prevArray: Item[] = [v(1), v(3)];
  const nextArray: Item[] = [v(1), v(2), v(3)];
  const cursors = [0, 1]; // In prevArray, these are all the items
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("aboveOnly - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(3), v(4), v(5)];
  const cursors = [2, 3, 4]; // In prevArray, these reference items 3, 4, 5
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("withinViewport - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(3), v(5)];
  const cursors = [1, 2, 3]; // In prevArray, these reference items 2, 3, 4
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([1, 0]);
});

test("aboveAndWithin - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(3), v(5)];
  const cursors = [2, 3, 4]; // In prevArray, these reference items 3, 4, 5
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});

test("belowAndWithin - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(1), v(2), v(4)];
  const cursors = [1, 2, 3]; // In prevArray, these reference items 2, 3, 4
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([1, 0]);
});

test("surroundingViewport - removed", () => {
  const prevArray: Item[] = [v(1), v(2), v(3), v(4), v(5)];
  const nextArray: Item[] = [v(3)];
  const cursors = [2]; // In prevArray, this references item 3
  const getItemId = (item: Item) => item.id;
  const cursorOffset = calculateOffsetFromCursor({ prevArray, nextArray, cursors, getItemId });
  expect(cursorOffset).toEqual([0, 0]);
});
