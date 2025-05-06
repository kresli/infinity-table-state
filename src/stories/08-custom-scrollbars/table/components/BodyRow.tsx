import { CSSProperties } from "react";
import { UseTable } from "../hooks/use-table";
import { DivProps } from "../types/DivProps";

interface BodyRowProps<Row> extends DivProps {
  state: UseTable<Row>;
  row: Row | null;
  rowIndex: number;
}
export function BodyRow<Row>(props: BodyRowProps<Row>) {
  const { state, rowIndex, children, ...htmlProps } = props;
  const style: CSSProperties = {
    gridRowStart: rowIndex + 1, // gridRowStart is 1-based index
    minHeight: state.rowPixelHeight,
    maxHeight: state.rowPixelHeight,
    height: state.rowPixelHeight,
    flexShrink: 0,
    display: "flex",
    flexDirection: "row",
  };
  return (
    <div style={style} {...htmlProps}>
      {children}
    </div>
  );
}
