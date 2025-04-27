import { getPaginatedData } from "./generate-data";
import { Row } from "./Row";

interface PaginatorData<Record> {
  index: number;
  pageSize: number;
  totalRecords: number;
  records: Record[];
}

export function fetchData(
  page: number,
  pageSize: number,
  deletedRows: Set<number>
): Promise<PaginatorData<Row>> {
  return new Promise<PaginatorData<Row>>((resolve) => {
    const randomDelay = Math.floor(Math.random() * 1000) + 500; // Random delay between 500ms and 1500ms
    setTimeout(() => {
      const records = getPaginatedData(page, pageSize, deletedRows);
      const totalRecords = 1032;

      resolve({
        index: page,
        pageSize,
        totalRecords,
        records,
      });
    }, randomDelay);
  });
}
