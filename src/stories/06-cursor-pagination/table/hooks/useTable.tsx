import { useVisibleRowsObserver } from "./useVisibleRowsObserver";
import { Column } from "../types/Column";
import { useLayoutEffect, useState } from "react";
import { Range } from "../types/Range";
import { calculateOffsetFromCursor } from "../../utils/calculate-offset-from-cursor";
import { useLiveRef } from "./useLiveRef";
import { getVisibleRows } from "../../utils/get-visible-rows";
import { useClientRectObserver } from "./useClientRectObserver";

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

interface Entry<Row> {
  record: Row | null;
  recordIndex: number;
  pageIndex: number;
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
  visibleRows: Entry<Row>[];
  scrollTop: number;
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState<Range>([0, 1]);
  const [paginatedState, setPaginatedState] = useState<PaginatedState<Row>>(defaultPaginatedState);
  const [scrollTop, setScrollTop] = useState(0);
  const visibleRangeRef = useLiveRef(visibleRange);
  const visibleRows = rangeToEntries(visibleRange, paginatedState);

  const refechVisibleRows = async (range?: Range) => {
    const { onFetchPages, getItemId } = props;
    if (range) setVisibleRange(range);
    const { state, cursor } = await fetchPagesWithCursor({
      visibleRows,
      paginatedState,
      onFetchPages,
      getItemId,
    });
    if (visibleRangeRef.current !== range) return;
    if (cursor) setScrollTop((prev) => Math.max(prev + cursor.offset * props.rowPixelHeight, 0));
    setPaginatedState(state);
  };

  const updateState = (params: { deltaY: number }) => {
    if (!scrollContainerElement) return;
    const _scrollTop = params.deltaY + (scrollContainerElement.scrollTop || 0);
    const _containerHeight = scrollContainerElement.clientHeight || 0;

    const [firstVisibleRowIndex, lastVisibleRowIndex] = getVisibleRows({
      buffer: props.rowBuffer,
      totalRows: paginatedState.totalRows,
      rowPixelHeight: props.rowPixelHeight,
      scrollTop: _scrollTop,
      containerHeight: _containerHeight,
    });

    setScrollTop(_scrollTop);
    setVisibleRange([firstVisibleRowIndex, lastVisibleRowIndex]);
    refechVisibleRows([firstVisibleRowIndex, lastVisibleRowIndex]);
  };

  useWheel(scrollContainerElement, (e) => updateState({ deltaY: e.deltaY }));
  useClientRectObserver(scrollContainerElement, () => updateState({ deltaY: 0 }));

  useLayoutEffect(() => {
    if (!scrollContainerElement) return;
    scrollContainerElement.scrollTop = scrollTop;
  }, [scrollContainerElement, scrollTop]);

  return {
    columns: props.columns,
    totalRows: paginatedState.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
    refechVisibleRows,
    scrollTop,
  };
}

function useWheel(element: HTMLDivElement | null, callback: (e: WheelEvent) => void) {
  const callbackRef = useLiveRef(callback);
  useLayoutEffect(() => {
    if (!element) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      callbackRef.current(e);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [element, callbackRef]);
}

// ==========
// ==========
// ==========

async function fetchPagesWithCursor<Row>(params: {
  visibleRows: Entry<Row>[];
  paginatedState: PaginatedState<Row>;
  onFetchPages: UseTableProps<Row>["onFetchPages"];
  getItemId: (item: Row) => Id;
}): Promise<{ state: PaginatedState<Row>; cursor: { offset: number } | null }> {
  const prevRows = params.visibleRows.map((row) => row.record);
  const pagesIndexes = params.visibleRows.map((row) => row.pageIndex);
  const pages = await params.onFetchPages(pagesIndexes, params.paginatedState.rowsPerPage);
  const newState = mergePagesToState(pages, params.paginatedState);
  const range: Range = [params.visibleRows[0].recordIndex, params.visibleRows.at(-1)!.recordIndex];
  const nextRows = rangeToEntries(range, newState).map((row) => row.record);
  const cursor = calculateOffsetFromCursor({
    prevArray: prevRows,
    nextArray: nextRows,
    getItemId: params.getItemId,
  });
  return { state: newState, cursor };
}

function rangeToEntries<Row>(range: Range, state: PaginatedState<Row>): Entry<Row>[] {
  const [start, end] = range;
  const length = end - start + 1;
  const entries: Entry<Row>[] = [];
  for (let index = 0; index < length; index++) {
    const rowIndex = index + start;
    const pageIndex = Math.floor(rowIndex / state.rowsPerPage);
    const page = state.pages[pageIndex];
    const pageOffset = rowIndex % state.rowsPerPage;
    const row = page?.records.at(pageOffset) || null;
    entries.push({ record: row, recordIndex: rowIndex, pageIndex });
  }
  return entries;
}

function mergePagesToState<Row>(
  pages: PageResponse<Row>[],
  prevPaginatedState?: PaginatedState<Row>
) {
  if (!pages.length) return defaultPaginatedState;
  const newPages = prevPaginatedState ? [...prevPaginatedState.pages] : [];
  for (const page of pages) {
    newPages[page.pageIndex] = page;
  }
  const totalRecords = pages[0].totalRecords;
  const rowsPerPage = pages[0].pageSize;
  return { pages: newPages, totalRows: totalRecords, rowsPerPage };
}

const defaultPaginatedState: PaginatedState<never> = {
  pages: [],
  totalRows: 10,
  rowsPerPage: 10,
};
