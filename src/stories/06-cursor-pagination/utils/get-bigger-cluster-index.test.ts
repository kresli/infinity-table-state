interface Cluster<T> {
  // The index of the first element in arrB that matches the start of arrA
  sourceArrayIndex: number;
  sourceShift: number;
  segements: T[];
}

function getBiggerClusterIndex<T>(source: T[], target: T[]): Cluster<T> | null {
  const n = source.length;
  const m = target.length;
  let maxLen = 0;
  let endSrc = 0;
  let endTgt = 0;

  // dp rows: prev = dp[i-1][*], curr = dp[i][*]
  const prev = new Array(m + 1).fill(0);
  const curr = new Array(m + 1).fill(0);

  // Build the LCSUBSTR DP table
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (source[i - 1] === target[j - 1]) {
        curr[j] = prev[j - 1] + 1;
        if (curr[j] > maxLen) {
          maxLen = curr[j];
          endSrc = i;
          endTgt = j;
        }
      } else {
        curr[j] = 0;
      }
    }

    // swap rows and zero out the new curr
    for (let j = 0; j <= m; j++) {
      prev[j] = curr[j];
      curr[j] = 0;
    }
  }

  if (maxLen === 0) return null;

  const startSrc = endSrc - maxLen;
  const startTgt = endTgt - maxLen;

  return {
    sourceArrayIndex: startSrc,
    sourceShift: startTgt - startSrc,
    segements: source.slice(startSrc, endSrc),
  };
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
