import { useRef, useState } from "react";
import { useResizeObserver } from "./hooks/useResizeObserver";
import { useLiveRef } from "./hooks/useLiveRef";
import { useScrollTopObserver } from "./hooks/useScrollTopObserver";

interface VirtualListCoreProps {
  scrollTop: number;
  containerHeight: number;
  totalRows: number;
  rowPixelHeight: number;
  buffer: number;
  children: (index: number) => React.ReactNode;
}

function getVisibleRows(props: {
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

interface VirtualListProps extends Omit<VirtualListCoreProps, "scrollTop" | "containerHeight"> {
  onVisibleRowsChange: (visibleRows: [start: number, end: number]) => void;
}

export function VirtualList(props: VirtualListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const { totalRows, rowPixelHeight } = props;

  const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
    ...props,
    scrollTop,
    containerHeight,
  });
  const visibleRowsCount = lastVisibleRowIndex - firstVisibleRowIndex + 1;

  const renderedRows = Array(visibleRowsCount).fill(null);

  useResizeObserver(ref.current, (clientRect) => {
    setContainerHeight(containerHeight);
    const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
      ...props,
      scrollTop,
      containerHeight: clientRect.height,
    });
    props.onVisibleRowsChange([firstVisibleRowIndex, lastVisibleRowIndex]);
  });

  useScrollTopObserver(ref.current, (scrollTop) => {
    setScrollTop(scrollTop);
    const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
      ...props,
      scrollTop,
      containerHeight,
    });
    props.onVisibleRowsChange([firstVisibleRowIndex, lastVisibleRowIndex]);
  });

  return (
    <div className="w-full h-full overflow-auto" ref={ref}>
      <div
        className="grid w-full"
        style={{
          gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
          minHeight: totalRows * rowPixelHeight,
        }}
      >
        {renderedRows.map((_, index) => {
          const rowIndex = index + firstVisibleRowIndex;
          return (
            <div
              key={rowIndex}
              className="outline outline-gray-300 bg-green-200/20"
              style={{
                gridRowStart: rowIndex + 1, // gridRowStart is 1-based index
                minHeight: rowPixelHeight,
                maxHeight: rowPixelHeight,
                height: rowPixelHeight,
              }}
            >
              {props.children(rowIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
