import { CSSProperties, ReactNode, useRef } from "react";
import { useVisibleRowsObserver } from "../hooks/useVisibleRowsObserver";
import { VirtualRow } from "./VirtualRow";

interface VirtualListCoreProps {
  scrollTop: number;
  containerHeight: number;
  totalRows: number;
  rowPixelHeight: number;
  buffer: number;
  children: (index: number) => ReactNode;
}

interface VirtualListProps extends Omit<VirtualListCoreProps, "scrollTop" | "containerHeight"> {
  onVisibleRowsChange: (visibleRows: [start: number, end: number]) => void;
  visibleRows: [start: number, end: number];
}

export function VirtualList(props: VirtualListProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { totalRows, rowPixelHeight } = props;
  const visibleRowsCount = props.visibleRows[1] - props.visibleRows[0] + 1;

  useVisibleRowsObserver({
    element: ref.current,
    buffer: props.buffer,
    totalRows: props.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    onVisibleRowsChange: props.onVisibleRowsChange,
  });

  const gridStyle: CSSProperties = {
    gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
    minHeight: totalRows * rowPixelHeight,
  };

  const rows = Array.from({ length: visibleRowsCount }, (_, index) => {
    const rowIndex = index + props.visibleRows[0];
    return (
      <VirtualRow
        key={rowIndex}
        index={rowIndex}
        rowPixelHeight={rowPixelHeight}
        children={props.children}
      />
    );
  });

  return (
    <div className="w-full h-full overflow-auto" ref={ref}>
      <div className="grid w-full" style={gridStyle}>
        {rows}
      </div>
    </div>
  );
}
