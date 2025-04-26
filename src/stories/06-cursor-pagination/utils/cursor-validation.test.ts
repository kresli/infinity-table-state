import { test } from "vitest";
import { calculateOffsetFromCursor } from "./calculate-offset-from-cursor";

// Helper function to create id objects
interface Item {
  id: number;
}
const v = (id: number): Item => ({ id });

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
  // the bigest subbaray is [4, 5] which is at index 3
  expect(cursorOffset).toEqual({
    originalPrevIndex: 3,
    originalNextIndex: 3,
    offset: 0,
  });
});
