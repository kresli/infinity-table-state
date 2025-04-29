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
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState<Range>([0, 1]);
  const [paginatedState, setPaginatedState] = useState<PaginatedState<Row>>(defaultPaginatedState);
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
    if (cursor) scrollContainerElement!.scrollTop += cursor.offset * props.rowPixelHeight;
    setPaginatedState(state);
  };

  useVisibleRowsObserver({
    element: scrollContainerElement,
    buffer: props.rowBuffer,
    totalRows: paginatedState.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    onVisibleRowsChange: refechVisibleRows,
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
