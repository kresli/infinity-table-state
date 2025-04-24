import { CSSProperties } from "react";
import { Column } from "../types/Column";
import { DivProps } from "../types/DivProps";

interface RowCellProps<Row> extends DivProps {
  column: Column<Row>;
}
export function RowCell<Row>(props: RowCellProps<Row>) {
  const { column, children, ...htmlProps } = props;
  const style: CSSProperties = {
    width: column.width,
    maxWidth: column.width,
    flex: 1,
  };
  return (
    <div style={style} {...htmlProps}>
      {children}
    </div>
  );
}
