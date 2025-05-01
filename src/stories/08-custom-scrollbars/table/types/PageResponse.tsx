export interface PageResponse<Row> {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  records: Row[];
}
