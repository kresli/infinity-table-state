interface Change<T> {
  value: T;
  removed?: boolean;
  added?: boolean;
}

// const enum ChangeType {
//   ADDED = "added",
//   REMOVED = "removed",
//   NO_CHANGE = "no_change",
// }

export function diffArray<T>(a: T[], b: T[]): Change<T>[] {
  const maxLength = Math.max(a.length, b.length);
  const result: Change<T>[] = [];
  for (let i = 0; i < maxLength; i++) {
    const aItem = a[i];
    const bItem = b[i];
    const lastItem = result[result.length - 1];

    if (aItem === bItem) {
      if (!lastItem || lastItem.removed || lastItem.added) {
        result.push({ value: [aItem] });
      } else {
        lastItem.value.push(aItem);
      }
    }
  }
  return result;
}

test("lazy lookup", () => {
  const result = diffArray([1, 2, 3, 2, 3], [1, 2, 3, 4, 5]);
  expect(result[0]).toEqual({ value: 1 });
  expect(result[1]).toEqual({ value: 2 });
  expect(result[2]).toEqual({ value: 3 });
  expect(result[3]).toEqual({ value: 2, removed: true });
  expect(result[4]).toEqual({ value: 3, removed: true });
  expect(result[5]).toEqual({ value: 4, added: true });
  expect(result[6]).toEqual({ value: 5, added: true });
  expect(result).toEqual([
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 2, removed: true },
    { value: 3, removed: true },
    { value: 4, added: true },
    { value: 5, added: true },
  ]);
});

test("diffArray - no change", () => {
  const arr1 = [1, 2, 3];
  const arr2 = [1, 2, 3];
  const result = diffArray(arr1, arr2);
  expect(result).toEqual([{ value: [1, 2, 3] }]);
});

test("diffArray - added", () => {
  const arr1 = [1, 2, 3, 5];
  const arr2 = [1, 2, 3, 4, 5, 6];
  const result = diffArray(arr1, arr2);
  expect(result).toEqual([
    { value: [1, 2, 3] },
    { value: [5], removed: true },
    { value: [4, 5, 6], added: true },
  ]);
});

test("diffArray - removed", () => {
  const arr1 = [1, 2, 3, 4];
  const arr2 = [2, 3];
  const result = diffArray(arr1, arr2);
  expect(result[0]).toEqual({ value: [1], removed: true });
  expect(result[1]).toEqual({ value: [2, 3] });
  expect(result[2]).toEqual({ value: [4], removed: true });
  expect(result).toEqual([
    { value: [1], removed: true },
    { value: [2, 3] },
    { value: [4], removed: true },
  ]);
});

test("identical arrays", () => {
  const result = diffArray([1, 2, 3], [1, 2, 3]);
  expect(result).toEqual([{ value: [1, 2, 3] }]);
});

test("additions only", () => {
  const result = diffArray([1, 2], [1, 2, 3, 4]);
  expect(result).toEqual([{ value: [1, 2] }, { value: [3, 4], added: true }]);
});

test("removals only", () => {
  const result = diffArray([1, 2, 3, 4], [1, 2]);
  expect(result).toEqual([{ value: [1, 2] }, { value: [3, 4], removed: true }]);
});

test("single replacement", () => {
  const result = diffArray([1, 2, 3], [1, 9, 3]);
  expect(result).toEqual([
    { value: [1] },
    { value: [2], removed: true },
    { value: [9], added: true },
    { value: [3] },
  ]);
});

test("leading addition", () => {
  const result = diffArray([2, 3], [1, 2, 3]);
  expect(result).toEqual([{ value: [1], added: true }, { value: [2, 3] }]);
});

test("trailing removal", () => {
  const result = diffArray([1, 2, 3], [1, 2]);
  expect(result).toEqual([{ value: [1, 2] }, { value: [3], removed: true }]);
});

test("completely different arrays", () => {
  const result = diffArray([1, 2, 3], [4, 5, 6]);
  expect(result).toEqual([
    { value: [1, 2, 3], removed: true },
    { value: [4, 5, 6], added: true },
  ]);
});

test("empty prev array", () => {
  const result = diffArray([], [1, 2, 3]);
  expect(result).toEqual([{ value: [1, 2, 3], added: true }]);
});

test("empty next array", () => {
  const result = diffArray([1, 2, 3], []);
  expect(result).toEqual([{ value: [1, 2, 3], removed: true }]);
});

test("both arrays empty", () => {
  const result = diffArray([], []);
  expect(result).toEqual([]);
});
