interface Cluster<T> {
  // The index of the first element in arrB that matches the start of arrA
  sourceArrayIndex: number;
  sourceShift: number;
  segements: T[];
}

function getBiggerClusterIndex<T>(sourceArray: T[], targetArray: T[]): Cluster<T> | null {
  let biggest: Cluster<T> | null = null;

  for (let i = 0; i < sourceArray.length; i++) {
    for (let j = 0; j < targetArray.length; j++) {
      if (sourceArray[i] !== targetArray[j]) continue;

      // walk forward from this match to build the matching segment until we find a mismatch
      // this gives us array of matching elements until we find a mismatch
      const matched: T[] = [];
      for (let k = 0; i + k < sourceArray.length && j + k < targetArray.length; k++) {
        if (sourceArray[i + k] !== targetArray[j + k]) break;
        matched.push(sourceArray[i + k]);
      }

      // if we have a match, we need to check if this is the biggest one so far
      if (matched.length > 0) {
        const cluster: Cluster<T> = {
          sourceArrayIndex: i,
          sourceShift: j - i,
          segements: matched,
        };

        // if this is the biggest cluster so far, save it
        if (!biggest || matched.length > biggest.segements.length) {
          biggest = cluster;
        }
      }
    }
  }

  return biggest;
}

test("full change", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 6];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual(null);
});

test("added on start", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 6, 1, 2, 3];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 3, segements: [1, 2, 3] });
});

test("no change", () => {
  const arrA = [1, 2, 3];
  const arrB = [1, 2, 3];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 0, segements: [1, 2, 3] });
});

test("added on end", () => {
  const arrA = [1, 2, 3];
  const arrB = [1, 2, 3, 4, 5, 6];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 0, segements: [1, 2, 3] });
});

test("partial matching, added on start", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 2, 3];
  const result = getBiggerClusterIndex(arrA, arrB);
  // as [2, 3] matches, we are use it for sourceShift. source (2) is 1, so we need to add 1
  expect(result).toEqual({ sourceArrayIndex: 1, sourceShift: 1, segements: [2, 3] });
});

test("partial matching, added on end", () => {
  const arrA = [1, 2, 3];
  const arrB = [4, 5, 6, 1, 2];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 3, segements: [1, 2] });
});

test("partial matching, in the middle", () => {
  const arrA = [1, 2, 3, 4];
  const arrB = [5, 6, 2, 3, 7, 8];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 1, sourceShift: 1, segements: [2, 3] });
});

test("removed on start", () => {
  const arrA = [1, 2, 3];
  const arrB = [2, 3];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 1, sourceShift: -1, segements: [2, 3] });
});

test("removed on end", () => {
  const arrA = [1, 2, 3];
  const arrB = [1, 2];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 0, sourceShift: 0, segements: [1, 2] });
});

test("removed in the middle", () => {
  const arrA = [1, 2, 3, 4];
  const arrB = [1, 3, 4];
  const result = getBiggerClusterIndex(arrA, arrB);
  expect(result).toEqual({ sourceArrayIndex: 2, sourceShift: -1, segements: [3, 4] });
});
