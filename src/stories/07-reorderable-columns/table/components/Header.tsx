import { ReactElement, CSSProperties } from "react";
import { UseTable } from "../hooks/use-table";
import { Column } from "../types/Column";
import { DivProps } from "../types/DivProps";

interface HeaderProps<Row> extends Omit<DivProps, "children"> {
  state: UseTable<Row>;
  children: (column: Column<Row>) => ReactElement;
}
export function Header<Row>(props: HeaderProps<Row>) {
  const { state, children, ...htmlProps } = props;
  const style: CSSProperties = {
    display: "flex",
    flexDirection: "row",
  };
  return (
    <div style={style} {...htmlProps}>
      {state.columns.map((column) => children(column))}
    </div>
  );
}
