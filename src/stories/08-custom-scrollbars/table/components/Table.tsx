import { CSSProperties } from "react";
import { RowCell } from "./RowCell";
import { BodyRow } from "./BodyRow";
import { Body } from "./Body";
import { HeaderCell } from "./HeaderCell";
import { Header } from "./Header";
import { DivProps } from "../types/DivProps";
import { Scrollbar } from "./Scrollbar";
import { Viewport } from "./Viewport";

export function Table(props: DivProps) {
  const style: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  };
  return (
    <div style={style} {...props}>
      {props.children}
    </div>
  );
}

Table.Header = Header;
Table.HeaderCell = HeaderCell;
Table.Body = Body;
Table.BodyRow = BodyRow;
Table.RowCell = RowCell;
Table.Scrollbar = Scrollbar;
Table.Viewport = Viewport;
