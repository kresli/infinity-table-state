import { useState } from "react";
import { PaginatorData } from "./Example";

interface PaginatorConfig<Row> {
  fetchPageData: (pageIndex: number, pageSize: number) => Promise<PaginatorData<Row>>;
}

export interface UsePaginator<Row> {
  data: Row[];
  totalRecords: number;
  rowsPerPage: number;
  fetchingPageIndexes: Set<number>;
  totalPages: number;
  fetchPage: (pageIndex: number) => Promise<void>;
}

export function usePaginator<Row>(config: PaginatorConfig<Row>): UsePaginator<Row> {
  const [pages, setPages] = useState<Row[][]>([]);
  const [fetchingPageIndexes, setFetchingPageIndexes] = useState(new Set<number>());
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPage = async (pageIndex: number) => {
    setFetchingPageIndexes((prev) => new Set([...prev, pageIndex]));
    const data = await config.fetchPageData(pageIndex, rowsPerPage);
    setPages((prev) => {
      const newPages = [...prev];
      newPages[pageIndex] = data.records;
      return newPages;
    });
    setTotalRecords(data.totalRecords);
    setRowsPerPage(data.pageSize);
    setFetchingPageIndexes((prev) => new Set([...prev].filter((i) => i !== pageIndex)));
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
