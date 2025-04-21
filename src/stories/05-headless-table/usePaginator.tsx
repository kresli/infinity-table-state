import { EffectCallback, useEffect, useState } from "react";

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
  visibleRecords: [start: number, end: number];
  onVisibleRecordsChange: (range: [start: number, end: number]) => void;
}

export function usePaginator<Row>(config: PaginatorConfig<Row>): UsePaginator<Row> {
  const [pages, setPages] = useState<Row[][]>([]);
  const [fetchingPageIndexes, setFetchingPageIndexes] = useState(new Set<number>());
  const [totalRecords, setTotalRecords] = useState(config.initialTotalRecords);
  const [rowsPerPage, setRowsPerPage] = useState(config.initialRowsPerPage);
  const [visibleRecords, setVisibleRecords] = useState<[start: number, end: number]>([0, 0]);

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

  const onVisibleRecordsChange = (range: [start: number, end: number]) => {
    setVisibleRecords(range);
    const [start, end] = range;
    const startPageIndex = Math.floor(start / rowsPerPage);
    const endPageIndex = Math.floor(end / rowsPerPage);
    for (let i = startPageIndex; i <= endPageIndex; i++) {
      fetchPage(i);
    }
  };

  useOnMount(() => void fetchPage(config.initialPageIndex));

  const data = pages.flat();
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return {
    data,
    totalRecords,
    rowsPerPage,
    fetchingPageIndexes,
    totalPages,
    visibleRecords,
    onVisibleRecordsChange,
  };
}

function useOnMount<T extends EffectCallback>(fn: T) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, []);
}
