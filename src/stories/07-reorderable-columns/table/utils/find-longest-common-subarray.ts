interface Cluster<T> {
  // The index of the first element in arrB that matches the start of arrA
  sourceArrayIndex: number;
  sourceShift: number;
  segments: T[];
}
/**
 * Finds the biggest contiguous matching "cluster" between two arrays.
 * Returns null if no common subsequence exists.
 */
export function findLongestCommonSubarray<T>(source: T[], target: T[]): Cluster<T> | null {
  const n = source.length;
  const m = target.length;
  let maxLen = 0;
  let endSrc = 0;
  let endTgt = 0;

  // DP rows: prev[j] = length of LCSuffix ending at source[i-1] & target[j-1]
  const prev: number[] = new Array(m + 1).fill(0);
  const curr: number[] = new Array(m + 1).fill(0);

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
    // move curr -> prev, and reset curr
    for (let j = 0; j <= m; j++) {
      prev[j] = curr[j];
      curr[j] = 0;
    }
  }

  if (maxLen === 0) {
    return null;
  }

  const startSrc = endSrc - maxLen;
  const startTgt = endTgt - maxLen;

  return {
    sourceArrayIndex: startSrc,
    sourceShift: startTgt - startSrc,
    segments: source.slice(startSrc, endSrc),
  };
}
