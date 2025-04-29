import { getVisibleRows } from "../../utils/get-visible-rows";
import { useClientRectObserver } from "./useClientRectObserver";
import { useScrollTopObserver } from "./useScrollTopObserver";

/**
 * A custom hook that observes the visible rows within a scrollable container
 * and triggers a callback whenever the visible rows change.
 *
 * @param props - The properties for the hook.
 * @param props.element - The scrollable container element to observe.
 * @param props.buffer - The number of rows to buffer before and after the visible rows.
 * @param props.totalRows - The total number of rows in the table.
 * @param props.rowPixelHeight - The height of each row in pixels.
 * @param props.onVisibleRowsChange - A callback function that is triggered when the visible rows change.
 *                                    It receives a tuple `[start, end]` representing the indices of the first
 *                                    and last visible rows (inclusive).
 *
 * NOTE: onVisibleRowsChange is called when element is mounted
 */
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
