import { ReactElement, CSSProperties } from "react";
import { UseTable } from "../hooks/useTable";

interface BodyProps<Row> {
  state: UseTable<Row>;
  children: (record: Row | null, rowIndex: number) => ReactElement;
}
export function Body<Row>(props: BodyProps<Row>) {
  const rootStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "auto",
  };
  const gridStyle: CSSProperties = {
    display: "grid",
    width: "100%",
    gridTemplateRows: `repeat(${props.state.totalRows}, minmax(0, 1fr))`,
    minHeight: props.state.totalRows * props.state.rowPixelHeight,
  };
  return (
    <div style={rootStyle} ref={props.state.setScrollContainerElement}>
      <div style={gridStyle}>
        {props.state.visibleRows.map(({ record, recordIndex }) =>
          props.children(record, recordIndex)
        )}
      </div>
    </div>
  );
}
