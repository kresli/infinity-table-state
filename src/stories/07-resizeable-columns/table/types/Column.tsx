import { ReactElement } from "react";

interface RowProps<RowData> {
  record: RowData;
  recordIndex: number;
}

export interface Column<Row> {
  id: string;
  width: number | string;
  BodyCell: (props: RowProps<Row | null>) => ReactElement;
  HeaderCell: () => ReactElement;
}
