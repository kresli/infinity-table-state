import { Entry } from "./Entry";
import { PageResponse } from "./PageResponse";

export interface TablePagination<Row> {
  pages: (PageResponse<Row> | undefined)[];
  totalRows: number;
  rowsPerPage: number;
  visibleRows: Entry<Row>[];
}
