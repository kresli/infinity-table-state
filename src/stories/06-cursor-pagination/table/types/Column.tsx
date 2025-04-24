import { ReactElement } from "react";

interface RowProps<RowData> {
  record: RowData;
  recordIndex: number;
}

export interface Column<Row> {
  id: string;
  width: number | string;
  BodyCell: (props: RowProps<Row>) => ReactElement;
  HeaderCell: () => ReactElement;
}
