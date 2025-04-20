import { forwardRef, useLayoutEffect, useRef, useState } from "react";

interface VirtualListCoreProps {
  scrollTop: number;
  containerHeight: number;
  totalRows: number;
  rowPixelHeight: number;
  children: (index: number) => React.ReactNode;
}

export const VirtualListCore = forwardRef(function VirtualListCore(
  props: VirtualListCoreProps,
  ref: React.Ref<HTMLDivElement>
) {
  const { totalRows, rowPixelHeight, containerHeight, scrollTop } = props;
  const buffer = 5;

  const absouluteFirstVisibleRowIndex = Math.floor(scrollTop / rowPixelHeight);
  const firstVisibleRowIndex = Math.max(0, absouluteFirstVisibleRowIndex);
  const lastVisibleRowIndex = Math.min(
    totalRows - 1,
    absouluteFirstVisibleRowIndex + Math.ceil(containerHeight / rowPixelHeight)
  );

  const visibleRowsCount = lastVisibleRowIndex - firstVisibleRowIndex + 1;

  const renderedRows = Array.from(
    { length: visibleRowsCount },
    (_, index) => index + firstVisibleRowIndex
  );

  return (
    <div
      ref={ref}
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
});

type VirtualListProps = Omit<VirtualListCoreProps, "scrollTop" | "containerHeight">;

export function VirtualList(props: VirtualListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  useLayoutEffect(() => {
    const parent = ref.current;
    if (!parent) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === parent) {
          setContainerHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(parent);

    return () => {
      observer.disconnect();
    };
  }, []);

  const onWheel = (e: React.UIEvent<HTMLDivElement, UIEvent>) =>
    setScrollTop(e.currentTarget.scrollTop);

  console.log(scrollTop);

  return (
    <div className="w-full h-full overflow-auto" ref={ref} onScroll={onWheel}>
      <VirtualListCore scrollTop={scrollTop} containerHeight={containerHeight} {...props} />
    </div>
  );
}

export function VirtualListxa(props: VirtualListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === parent) {
          setContainerHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(parent);
    const onScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);
    };
    parent.addEventListener("scroll", onScroll);
    return () => {
      observer.disconnect();
      parent.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <VirtualListCore
      {...props}
      ref={ref}
      containerHeight={containerHeight}
      scrollTop={scrollTop}
      rowPixelHeight={props.rowPixelHeight}
      totalRows={props.totalRows}
    />
  );
}
