import { useState } from "react";
import { Range } from "../types/Range";

export interface PageResponse<Row> {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  records: Row[];
}

type OnFetchPage<Row> = (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;

export function usePaginator<Row>(onFetchPage: OnFetchPage<Row>) {
  const [pages, setPages] = useState<(PageResponse<Row> | undefined)[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPagesByRange = async ([start, end]: Range) => {
    const pagesIndexes = rangeToPagesIndexes({
      start,
      end,
      totalRows,
      rowsPerPage,
    });
    const pages = await onFetchPage(pagesIndexes, rowsPerPage);
    setPages((prev) => {
      const newPages = [...prev];
      for (const page of pages) {
        newPages[page.pageIndex] = page;
      }
      return newPages;
    });
    setTotalRows(pages[0].totalRecords);
    setRowsPerPage(pages[0].pageSize);
    return pages;
  };

  const fetchPage = async (pageIndex: number) => {
    return fetchPagesByRange([pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage - 1]);
  };

  const data = pages.flatMap((page) => page?.records || []);

  return { pages, totalRows, rowsPerPage, data, fetchPage, fetchPagesByRange };
}

function rangeToPagesIndexes(params: {
  start: number;
  end: number;
  totalRows: number;
  rowsPerPage: number;
}) {
  if (params.totalRows === 0) return [params.start];
  const { start, end, totalRows, rowsPerPage } = params;
  const result: number[] = [];
  const currentPage = Math.floor(start / rowsPerPage);
  const lastPage = Math.floor(end / rowsPerPage);
  for (let page = currentPage; page <= lastPage; page++) {
    if (page < totalRows) result.push(page);
  }
  return result;
}
