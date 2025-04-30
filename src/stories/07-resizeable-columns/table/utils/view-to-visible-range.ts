import { Range } from "../types/Range";

interface Params {
  totalRows: number;
  rowPixelHeight: number;
  containerHeight: number;
  scrollTop: number;
  buffer: number;
}

export function viewToVisibleRange(params: Params): Range {
  const { totalRows, rowPixelHeight, containerHeight, scrollTop, buffer } = params;

  const absoluteFirstVisibleRowIndex = Math.floor(scrollTop / rowPixelHeight);
  const firstVisibleRowIndex = Math.max(0, absoluteFirstVisibleRowIndex - buffer);
  const lastVisibleRowIndex = Math.min(
    totalRows - 1,
    absoluteFirstVisibleRowIndex + Math.ceil(containerHeight / rowPixelHeight) + buffer
  );

  return [firstVisibleRowIndex, lastVisibleRowIndex];
}
