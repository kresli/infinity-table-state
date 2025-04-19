import { ReactElement } from "react";

export interface Column<Row> {
  id: string;
  width: number | string;
  BodyCell: (props: { row: Row }) => ReactElement;
  HeaderCell: () => ReactElement;
}
