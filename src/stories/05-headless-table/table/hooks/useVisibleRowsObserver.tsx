import { useClientRectObserver } from "./useClientRectObserver";
import { useScrollTopObserver } from "./useScrollTopObserver";

export function getVisibleRows(props: {
  totalRows: number;
  rowPixelHeight: number;
  containerHeight: number;
  scrollTop: number;
  buffer: number;
}): [firstVisibleRowIndex: number, lastVisibleRowIndex: number] {
  const { totalRows, rowPixelHeight, containerHeight, scrollTop, buffer } = props;

  const absouluteFirstVisibleRowIndex = Math.floor(scrollTop / rowPixelHeight);
  const firstVisibleRowIndex = Math.max(0, absouluteFirstVisibleRowIndex - buffer);
  const lastVisibleRowIndex = Math.min(
    totalRows - 1,
    absouluteFirstVisibleRowIndex + Math.ceil(containerHeight / rowPixelHeight) + buffer
  );

  return [firstVisibleRowIndex, lastVisibleRowIndex];
}

export function useVisibleRowsObserver(props: {
  element: HTMLDivElement | null;
  buffer: number;
  totalRows: number;
  rowPixelHeight: number;
  onVisibleRowsChange: (visibleRows: [start: number, end: number]) => void;
}) {
  useClientRectObserver(props.element, (clientRect) => {
    const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
      buffer: props.buffer,
      totalRows: props.totalRows,
      rowPixelHeight: props.rowPixelHeight,
      scrollTop: props.element?.scrollTop || 0,
      containerHeight: clientRect.height,
    });
    props.onVisibleRowsChange([firstVisibleRowIndex, lastVisibleRowIndex]);
  });

  useScrollTopObserver(props.element, (scrollTop) => {
    const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
      buffer: props.buffer,
      totalRows: props.totalRows,
      rowPixelHeight: props.rowPixelHeight,
      scrollTop,
      containerHeight: props.element?.clientHeight || 0,
    });
    props.onVisibleRowsChange([firstVisibleRowIndex, lastVisibleRowIndex]);
  });
}
