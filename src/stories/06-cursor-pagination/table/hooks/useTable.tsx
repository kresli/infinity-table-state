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
  onFetchPages: (pageIndexes: number[]) => Promise<PageResponse<Row>[]>;
  getItemId: (item: Row) => Id;
}

export interface UseTable<Row> {
  columns: Column<Row>[];
  rows: (Row | null)[];
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: { record: Row | null; recordIndex: number }[];
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
}

function rangeToPagesIndexes(params: {
  start: number;
  end: number;
  totalRows: number;
  rowsPerPage: number;
}) {
  const { start, end, totalRows, rowsPerPage } = params;
  const pagesIndexes = new Set<number>();
  for (let i = start; i <= end; i++) {
    const pageIndex = Math.floor(i / rowsPerPage);
    if (pageIndex < totalRows) {
      pagesIndexes.add(pageIndex);
    }
  }
  return Array.from(pagesIndexes);
}

function usePaginator<Row>(onFetchPage: UseTableProps<Row>["onFetchPages"]) {
  const [pages, setPages] = useState<PageResponse<Row>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(0);

  const fetchPage = async (pageIndex: number) => {
    const page = await onFetchPage([pageIndex]);
    setPages((prev) => [...prev, ...page]);
    setTotalRows(page[0].totalRecords);
    setRowsPerPage(page[0].pageSize);
  };

  const fetchPagesByRange = async ([start, end]: Range) => {
    const pagesIndexes = rangeToPagesIndexes({
      start,
      end,
      totalRows,
      rowsPerPage,
    });
    const pages = await onFetchPage(pagesIndexes);
    if (pages.length === 0) return;
    setPages((prev) => [...prev, ...pages]);
    setTotalRows(pages[0].totalRecords);
    setRowsPerPage(pages[0].pageSize);
  };

  const data = pages.flatMap((page) => page.records);

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
    return {
      record,
      recordIndex,
    };
  });

  const paginatorRef = useLiveRef(paginator);

  useOnMount(() => paginatorRef.current.fetchPage(0));

  return {
    columns: props.columns,
    rows: paginator.data,
    totalRows: paginator.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
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
//   console.log("commonSubarray", commonSubarray);
//   scrollContainerElement.scrollTop =
//     scrollContainerElement.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
//   // props.onVisibleRowsChange([
//   //   props.visibleRows[0] + commonSubarray?.offset,
//   //   props.visibleRows[1] + commonSubarray?.offset,
//   // ]);
// }, [prevData, props.data, props.rowPixelHeight, props.visibleRows, scrollContainerElement]);

// onVisibleRowsChange: async (range) => {
//   console.log("onVisibleRowsChange", range);
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
//   console.log("allData", allData);
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
