import { getVisibleRows } from "../../utils/get-visible-rows";
import { useClientRectObserver } from "./useClientRectObserver";
import { useScrollTopObserver } from "./useScrollTopObserver";

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
