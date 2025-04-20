import { useLayoutEffect, useRef, useState } from "react";

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

export function VirtualListCore(props: VirtualListCoreProps) {
  const { totalRows, rowPixelHeight } = props;

  const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows(props);
  const visibleRowsCount = lastVisibleRowIndex - firstVisibleRowIndex + 1;

  // would be faster to use Array(visibleRowsCount).fill(null)
  const renderedRows = Array.from(
    { length: visibleRowsCount },
    (_, index) => index + firstVisibleRowIndex
  );

  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
        minHeight: totalRows * rowPixelHeight,
      }}
    >
      {renderedRows.map((rowIndex) => (
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
      ))}
    </div>
  );
}

interface VirtualListProps extends Omit<VirtualListCoreProps, "scrollTop" | "containerHeight"> {
  onVisibleRowsChange: (visibleRows: [start: number, end: number]) => void;
}

export function VirtualList(props: VirtualListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const scrollTopRef = useRef(scrollTop);
  scrollTopRef.current = scrollTop;

  const propsRef = useRef(props);
  propsRef.current = props;

  useLayoutEffect(() => {
    const parent = ref.current;
    if (!parent) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === parent) {
          const containerHeight = entry.contentRect.height;
          const scrollTop = scrollTopRef.current;
          setContainerHeight(containerHeight);
          const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
            ...propsRef.current,
            scrollTop,
            containerHeight,
          });
          propsRef.current.onVisibleRowsChange([firstVisibleRowIndex, lastVisibleRowIndex]);
          return;
        }
      }
    });
    observer.observe(parent);

    return () => observer.disconnect();
  }, []);

  const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    setScrollTop(e.currentTarget.scrollTop);
    const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
      ...props,
      scrollTop: e.currentTarget.scrollTop,
      containerHeight,
    });
    props.onVisibleRowsChange([firstVisibleRowIndex, lastVisibleRowIndex]);
  };

  return (
    <div className="w-full h-full overflow-auto" ref={ref} onScroll={onScroll}>
      <VirtualListCore scrollTop={scrollTop} containerHeight={containerHeight} {...props} />
    </div>
  );
}
