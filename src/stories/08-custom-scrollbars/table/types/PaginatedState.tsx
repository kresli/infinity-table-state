import { PageResponse } from "./PageResponse";

export interface PaginatedState<Row> {
  pages: (PageResponse<Row> | undefined)[];
  totalRows: number;
  rowsPerPage: number;
}
