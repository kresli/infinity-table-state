import { ReactElement, CSSProperties } from "react";
import { UseTable } from "../hooks/use-table";

interface BodyProps<Row> {
  state: UseTable<Row>;
  children: (record: Row | null, rowIndex: number) => ReactElement;
}
export function Body<Row>(props: BodyProps<Row>) {
  const rootStyle: CSSProperties = {
    height: "100%",
    overflow: "clip",
    width: "100%",
    position: "relative",
  };
  const gridStyle: CSSProperties = {
    display: "grid",
    width: "fit-content",
    minWidth: "100%",
    gridTemplateRows: `repeat(${props.state.totalRows}, minmax(0, 1fr))`,
    minHeight: props.state.totalRows * props.state.rowPixelHeight,
  };
  const positionStyle: CSSProperties = {
    position: "absolute",
    height: "100%",
    width: "100%",
    top: props.state.girdPosition.y,
    left: props.state.girdPosition.x,
  };
  return (
    <div style={gridStyle} ref={props.state.setContentElement}>
      {props.state.visibleRows.map(({ record, recordIndex }) =>
        props.children(record, recordIndex)
      )}
    </div>
  );
}
