import { useVisibleRowsObserver } from "./useVisibleRowsObserver";
import { Column } from "../types/Column";
import { useLayoutEffect, useRef, useState } from "react";
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
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  // const [visibleRange, setVisibleRange] = useState<Range>([0, 1]);
  // const [paginatedState, setPaginatedState] = useState<PaginatedState<Row>>(defaultPaginatedState);
  // const [scrollTop, setScrollTop] = useState(0);
  // const visibleRangeRef = useLiveRef(visibleRange);
  // const visibleRows = rangeToEntries(visibleRange, paginatedState);
  const [visibleRows, setVisibleRows] = useState<Entry<Row>[]>([]);
  const [totalRows, setTotalRows] = useState(10);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pages, setPages] = useState<(PageResponse<Row> | undefined)[]>([]);

  const rangeRef = useRef<Range>([0, 1]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateState = async (params: { deltaY: number }) => {
    if (!scrollContainerElement) return;
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      await handleUpdateState<Row>({
        scrollContainerElement,
        deltaY: params.deltaY,
        totalRows,
        rowBuffer: props.rowBuffer,
        rowPixelHeight: props.rowPixelHeight,
        pages,
        rowsPerPage,
        onFetchPages: props.onFetchPages,
        getItemId: props.getItemId,
        setVisibleRows,
        setPages,
        setTotalRows,
        setRowsPerPage,
        rangeRef,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Request aborted");
        return;
      }
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  useWheel(scrollContainerElement, (e) => updateState({ deltaY: e.deltaY }));
  useClientRectObserver(scrollContainerElement, () => updateState({ deltaY: 0 }));

  const refechVisibleRows = async () => {
    await updateState({ deltaY: 0 });
  };

  return {
    columns: props.columns,
    totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
    refechVisibleRows,
  };
}

async function handleUpdateState<Row>(params: {
  scrollContainerElement: HTMLDivElement | null;
  deltaY: number;
  totalRows: number;
  rowBuffer: number;
  rowPixelHeight: number;
  pages: (PageResponse<Row> | undefined)[];
  rowsPerPage: number;
  onFetchPages: UseTableProps<Row>["onFetchPages"];
  getItemId: UseTableProps<Row>["getItemId"];
  setVisibleRows: (rows: Entry<Row>[]) => void;
  setPages: (pages: (PageResponse<Row> | undefined)[]) => void;
  setTotalRows: (totalRows: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  rangeRef: React.MutableRefObject<Range>;
}) {
  const {
    scrollContainerElement,
    deltaY,
    totalRows,
    rowBuffer,
    rowPixelHeight,
    onFetchPages,
    getItemId,
    pages,
    rowsPerPage,
    setVisibleRows,
    setPages,
    setTotalRows,
    setRowsPerPage,
    rangeRef,
  } = params;
  if (!scrollContainerElement) return;
  const scrollTop = deltaY + (scrollContainerElement.scrollTop || 0);
  const containerHeight = scrollContainerElement.clientHeight || 0;

  const range = getVisibleRows({
    buffer: rowBuffer,
    totalRows,
    rowPixelHeight: rowPixelHeight,
    scrollTop,
    containerHeight,
  });
  const visibleRows = rangeToEntries(range, {
    pages,
    totalRows,
    rowsPerPage,
  });
  setVisibleRows(visibleRows);
  scrollContainerElement.scrollTop = Math.max(scrollTop, 0);
  rangeRef.current = range;
  const { state, cursor } = await fetchPagesWithCursor({
    visibleRows,
    paginatedState: { pages, totalRows, rowsPerPage },
    onFetchPages,
    getItemId,
  });
  if (rangeRef.current !== range) return;
  const offset = cursor?.offset || 0;
  scrollContainerElement.scrollTop = Math.max(scrollTop + offset * rowPixelHeight, 0);
  setPages(state.pages);
  setTotalRows(state.totalRows);
  setRowsPerPage(state.rowsPerPage);
  setVisibleRows(
    rangeToEntries(range, {
      pages: state.pages,
      totalRows: state.totalRows,
      rowsPerPage: state.rowsPerPage,
    })
  );
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
