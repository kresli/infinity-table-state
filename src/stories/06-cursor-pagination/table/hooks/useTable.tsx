import { useVisibleRowsObserver } from "./useVisibleRowsObserver";
import { Column } from "../types/Column";
import { useState } from "react";
import { useLiveRef } from "./useLiveRef";
import { useOnMount } from "../../useOnMount";

type Id = string | number;

type Range = [start: number, end: number];

interface PageResponse<Row> {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  records: Row[];
}

export interface UseTableProps<Row> {
  columns: Column<Row>[];
  rowPixelHeight: number;
  rowBuffer: number;
  onFetchPages: (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;
  getItemId: (item: Row) => Id;
}

export interface UseTable<Row> {
  columns: Column<Row>[];
  rows: (Row | null)[];
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: { record: Row | null; recordIndex: number }[];
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
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

function usePaginator<Row>(onFetchPage: UseTableProps<Row>["onFetchPages"]) {
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
    if (pages.length === 0) return;
    setPages((prev) => {
      const newPages = [...prev];
      for (const page of pages) {
        newPages[page.pageIndex] = page;
      }
      return newPages;
    });
    setTotalRows(pages[0].totalRecords);
    setRowsPerPage(pages[0].pageSize);
  };

  const fetchPage = async (pageIndex: number) => {
    return fetchPagesByRange([pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage - 1]);
  };

  const data = pages.flatMap((page) => page?.records || []);

  return { pages, totalRows, rowsPerPage, data, fetchPage, fetchPagesByRange };
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState<Range>([0, 0]);
  const paginator = usePaginator(props.onFetchPages);

  const onVisibleRowsChange = async (range: Range) => {
    if (range[0] === visibleRange[0] && range[1] === visibleRange[1]) return;
    setVisibleRange(range);
    paginator.fetchPagesByRange(range);
  };

  useVisibleRowsObserver({
    element: scrollContainerElement,
    buffer: props.rowBuffer,
    totalRows: paginator.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    onVisibleRowsChange: onVisibleRowsChange,
  });

  const visibleRowsCount = visibleRange[1] - visibleRange[0] + 1;

  const visibleRows = Array.from({ length: visibleRowsCount }, (_, index) => {
    const recordIndex = index + visibleRange[0];
    const record = paginator.data.at(recordIndex) || null;
    return { record, recordIndex };
  });

  const paginatorRef = useLiveRef(paginator);

  const refechVisibleRows = async () => {
    await paginatorRef.current.fetchPagesByRange(visibleRange);
  };

  useOnMount(() => paginatorRef.current.fetchPage(0));

  return {
    columns: props.columns,
    rows: paginator.data,
    totalRows: paginator.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
    refechVisibleRows,
  };
}

// const prevData = usePrevValue(props.data);

// useLayoutEffect(() => {
//   if (scrollContainerElement === null) return;
//   const prevVisibleData = prevData.slice(props.visibleRows[0], props.visibleRows[1] + 1);
//   const nextVisibleData = props.data.slice(props.visibleRows[0], props.visibleRows[1] + 1);
//   const commonSubarray = calculateOffsetFromCursor({
//     prevArray: prevVisibleData,
//     nextArray: nextVisibleData,
//     getItemId: (item) => item.name,
//   });
//   scrollContainerElement.scrollTop =
//     scrollContainerElement.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
//   // props.onVisibleRowsChange([
//   //   props.visibleRows[0] + commonSubarray?.offset,
//   //   props.visibleRows[1] + commonSubarray?.offset,
//   // ]);
// }, [prevData, props.data, props.rowPixelHeight, props.visibleRows, scrollContainerElement]);

// onVisibleRowsChange: async (range) => {
//   if (scrollContainerElement === null) return;
//   const prevVisibleData = Array.from(
//     { length: props.visibleRows[1] - props.visibleRows[0] + 1 },
//     (_, index) => {
//       const recordIndex = index + props.visibleRows[0];
//       const record = data.at(recordIndex) || null;
//       return record;
//     }
//   );
//   const allData = await props.onVisibleRowsChange(range);
//   const nextVisibleData = Array.from({ length: range[1] - range[0] + 1 }, (_, index) => {
//     const recordIndex = index + range[0];
//     const record = allData.at(recordIndex) || null;
//     return record;
//   });
//   const commonSubarray = calculateOffsetFromCursor({
//     prevArray: prevVisibleData,
//     nextArray: nextVisibleData,
//     getItemId: props.getItemId,
//   });
//   setData(nextVisibleData);
//   scrollContainerElement.scrollTop =
//     scrollContainerElement.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
// },
