import { useState } from "react";

export interface PaginatorData<Record> {
  index: number;
  pageSize: number;
  totalRecords: number;
  records: Record[];
}

interface PaginatorConfig<Row> {
  fetchPageData: (pageIndex: number, pageSize: number) => Promise<PaginatorData<Row>>;
  initialPageIndex: number;
  initialTotalRecords: number;
  initialRowsPerPage: number;
}

export interface UsePaginator<Row> {
  data: Row[];
  totalRecords: number;
  rowsPerPage: number;
  fetchingPageIndexes: Set<number>;
  totalPages: number;
  fetchPage: (pageIndex: number) => Promise<PaginatorData<Row>>;
}

export function usePaginator<Row>(config: PaginatorConfig<Row>): UsePaginator<Row> {
  const [pages, setPages] = useState<Row[][]>([]);
  const [fetchingPageIndexes, setFetchingPageIndexes] = useState(new Set<number>());
  const [totalRecords, setTotalRecords] = useState(config.initialTotalRecords);
  const [rowsPerPage, setRowsPerPage] = useState(config.initialRowsPerPage);

  const fetchPage = async (pageIndex: number) => {
    setFetchingPageIndexes((prev) => new Set([...prev, pageIndex]));
    const data = await config.fetchPageData(pageIndex, rowsPerPage);
    console.log("Fetched page", pageIndex, data);
    setPages((prev) => {
      const newPages = [...prev];
      newPages[pageIndex] = data.records;
      return newPages;
    });
    setTotalRecords(data.totalRecords);
    setRowsPerPage(data.pageSize);
    setFetchingPageIndexes((prev) => new Set([...prev].filter((i) => i !== pageIndex)));
    return data;
  };

  const data = pages.flat();
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return {
    data,
    totalRecords,
    rowsPerPage,
    fetchingPageIndexes,
    totalPages,
    fetchPage,
  };
}
