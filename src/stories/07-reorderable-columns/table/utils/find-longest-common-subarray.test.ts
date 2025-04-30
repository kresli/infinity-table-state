import { findLongestCommonSubarray } from "./find-longest-common-subarray";

test("full change", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 6];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual(null);
});

test("added on start", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 6, 1, 2, 3];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 3, segements: [1, 2, 3] });
});

test("no change", () => {
  const arrA = [1, 2, 3];
  const arrB = [1, 2, 3];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 0, segements: [1, 2, 3] });
});

test("added on end", () => {
  const arrA = [1, 2, 3];
  const arrB = [1, 2, 3, 4, 5, 6];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 0, segements: [1, 2, 3] });
});

test("partial matching, added on start", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 2, 3];
  const result = findLongestCommonSubarray(arrA, arrB);
  // as [2, 3] matches, we are use it for sourceShift. source (2) is 1, so we need to add 1
  expect(result).toEqual({ sourceArrayIndex: 1, sourceShift: 1, segements: [2, 3] });
});

test("partial matching, added on end", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 6, 1, 2];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 3, segements: [1, 2] });
});

test("partial matching, in the middle", () => {
  const arrA = [1, 2, 3, 4];
  const arrB = [5, 6, 2, 3, 7, 8];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 1, sourceShift: 1, segements: [2, 3] });
});

test("removed on start", () => {
  const arrA = [1, 2, 3];
  const arrB = [2, 3];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 1, sourceShift: -1, segements: [2, 3] });
});

test("removed on end", () => {
  const arrA = [1, 2, 3];
  const arrB = [1, 2];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 0, segements: [1, 2] });
});

test("removed in the middle", () => {
  const arrA = [1, 2, 3, 4];
  const arrB = [1, 3, 4];
  const result = findLongestCommonSubarray(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 2, sourceShift: -1, segements: [3, 4] });
});

test("random A", () => {
  const prevArray = [1, 2, 3, 4, 5];
  const nextArray = [6, 7, 3, 4, 5];
  const result = findLongestCommonSubarray(prevArray, nextArray);
  expect(result).toEqual({ sourceArrayIndex: 2, sourceShift: 0, segements: [3, 4, 5] });
});
