import { useVisibleRowsObserver } from "./useVisibleRowsObserver";
import { Column } from "../types/Column";
import { useState } from "react";
import { Range } from "../types/Range";
import { calculateOffsetFromCursor } from "../../utils/calculate-offset-from-cursor";
import { useLiveRef } from "./useLiveRef";

type Id = string | number;

interface PaginatedState<Row> {
  pages: (PageResponse<Row> | undefined)[];
  totalRows: number;
  rowsPerPage: number;
}

interface PageResponse<Row> {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  records: Row[];
}

interface VisibleRow<Row> {
  record: Row | null;
  recordIndex: number;
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
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: VisibleRow<Row>[];
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState<Range>([0, 1]);
  const [paginatedState, setPaginatedState] = useState<PaginatedState<Row>>(defaultPaginatedState);
  const visibleRangeRef = useLiveRef(visibleRange);
  const visibleRows = rangeToVisibleRows(visibleRange, paginatedState);

  const onVisibleRowsChange = async (range: Range) => {
    setVisibleRange(range);
    const pagesIndexes = rangeToPageIndexes(range, paginatedState);
    const pages = await props.onFetchPages(pagesIndexes, paginatedState.rowsPerPage);
    if (visibleRangeRef.current !== range) return;
    const state = pagesToState(pages);
    setPaginatedState(state);
  };

  const refechVisibleRows = async () => {
    const prevRows = rangeToRows(visibleRange, paginatedState);
    const pagesIndexes = rangeToPageIndexes(visibleRange, paginatedState);
    const pages = await props.onFetchPages(pagesIndexes, paginatedState.rowsPerPage);
    const newState = pagesToState(pages, paginatedState);
    const nextRows = rangeToRows(visibleRange, newState);
    const cursor = calculateOffsetFromCursor({
      prevArray: prevRows,
      nextArray: nextRows,
      getItemId: props.getItemId,
    });
    scrollContainerElement!.scrollTop =
      scrollContainerElement!.scrollTop + (cursor?.offset || 0) * props.rowPixelHeight;
    setPaginatedState(newState);
  };

  useVisibleRowsObserver({
    element: scrollContainerElement,
    buffer: props.rowBuffer,
    totalRows: paginatedState.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    onVisibleRowsChange,
  });

  return {
    columns: props.columns,
    totalRows: paginatedState.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
    refechVisibleRows,
  };
}

function rowIndexToRow<Row>(rowIndex: number, state: PaginatedState<Row>) {
  const pageSize = state.rowsPerPage;
  const pageIndex = Math.floor(rowIndex / pageSize);
  const pageOffset = rowIndex % pageSize;
  const page = state.pages[pageIndex];
  return page?.records.at(pageOffset) || null;
}

function rangeToVisibleRows<Row>(range: Range, state: PaginatedState<Row>): VisibleRow<Row>[] {
  const [start, end] = range;
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => {
    const recordIndex = index + start;
    const record = rowIndexToRow(recordIndex, state);
    return { record, recordIndex };
  });
}

function pagesToState<Row>(pages: PageResponse<Row>[], prevPaginatedState?: PaginatedState<Row>) {
  if (!pages.length) return defaultPaginatedState;
  const newPages = prevPaginatedState ? [...prevPaginatedState.pages] : [];
  for (const page of pages) {
    newPages[page.pageIndex] = page;
  }
  const totalRecords = pages[0].totalRecords;
  const rowsPerPage = pages[0].pageSize;
  return { pages: newPages, totalRows: totalRecords, rowsPerPage };
}

function rangeToPageIndexes(range: Range, state: PaginatedState<unknown>): number[] {
  const { totalRows, rowsPerPage } = state;
  const [start, end] = range;
  if (totalRows === 0) return [start];
  const result: number[] = [];
  const currentPage = Math.floor(start / rowsPerPage);
  const lastPage = Math.floor(end / rowsPerPage);
  for (let page = currentPage; page <= lastPage; page++) {
    if (page < totalRows) result.push(page);
  }
  return result;
}

function rangeToRows<Row>(visibleRange: Range, state: PaginatedState<Row>): (Row | null)[] {
  const { pages } = state;
  const visibleRowsCount = visibleRange[1] - visibleRange[0] + 1;
  return Array.from({ length: visibleRowsCount }, (_, index) => {
    const pageSize = pages[0]?.pageSize || 0;
    const recordIndex = index + visibleRange[0];
    const pageIndex = Math.floor(recordIndex / pageSize);
    const pageOffset = recordIndex % pageSize;
    const page = pages[pageIndex];
    return page?.records.at(pageOffset) || null;
  });
}

const defaultPaginatedState: PaginatedState<never> = {
  pages: [],
  totalRows: 10,
  rowsPerPage: 10,
};
