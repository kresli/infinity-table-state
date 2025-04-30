export interface GetVisibleRowsProps {
  totalRows: number;
  rowPixelHeight: number;
  containerHeight: number;
  scrollTop: number;
  buffer: number;
}

export function viewToVisibleRange(
  props: GetVisibleRowsProps
): [firstVisibleRowIndex: number, lastVisibleRowIndex: number] {
  const { totalRows, rowPixelHeight, containerHeight, scrollTop, buffer } = props;

  const absoluteFirstVisibleRowIndex = Math.floor(scrollTop / rowPixelHeight);
  const firstVisibleRowIndex = Math.max(0, absoluteFirstVisibleRowIndex - buffer);
  const lastVisibleRowIndex = Math.min(
    totalRows - 1,
    absoluteFirstVisibleRowIndex + Math.ceil(containerHeight / rowPixelHeight) + buffer
  );

  return [firstVisibleRowIndex, lastVisibleRowIndex];
}
