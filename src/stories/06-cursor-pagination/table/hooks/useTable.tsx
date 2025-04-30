import { Column } from "../types/Column";
import { useLayoutEffect, useState } from "react";
import { Range } from "../types/Range";
import { calculateOffsetFromCursor } from "../../utils/calculate-offset-from-cursor";
import { useLiveRef } from "./useLiveRef";
import { viewToVisibleRange } from "../../utils/view-to-visible-range";
import { useClientRectObserver } from "./useClientRectObserver";
import { useAbortController } from "./useAbortController";

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

interface TablePagination<Row> {
  pages: (PageResponse<Row> | undefined)[];
  totalRows: number;
  rowsPerPage: number;
  visibleRows: Entry<Row>[];
}

const defaultPagination: TablePagination<never> = {
  pages: [],
  totalRows: 10,
  rowsPerPage: 10,
  visibleRows: [],
};

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const abortController = useAbortController();

  const [pagination, setPagination] = useState<TablePagination<Row>>(defaultPagination);

  const updateState = async (params: { deltaY: number }) => {
    const controller = abortController.resetController();
    if (!scrollContainerElement) return;
    await handleUpdateState<Row>({
      pagination,
      scrollElement: scrollContainerElement,
      deltaY: params.deltaY,
      rowBuffer: props.rowBuffer,
      rowPixelHeight: props.rowPixelHeight,
      abortSignal: controller.signal,
      onFetchPages: props.onFetchPages,
      getItemId: props.getItemId,
      setPagination,
    });
    abortController.resetController(controller);
  };

  useWheel(scrollContainerElement, (e) => updateState({ deltaY: e.deltaY }));
  useClientRectObserver(scrollContainerElement, () => updateState({ deltaY: 0 }));

  const refechVisibleRows = async () => await updateState({ deltaY: 0 });

  return {
    columns: props.columns,
    totalRows: pagination.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows: pagination.visibleRows,
    setScrollContainerElement,
    refechVisibleRows,
  };
}

interface HandleUpdateStateParams<Row> {
  pagination: TablePagination<Row>;
  scrollElement: HTMLDivElement | null;
  deltaY: number;
  rowBuffer: number;
  rowPixelHeight: number;
  onFetchPages: UseTableProps<Row>["onFetchPages"];
  getItemId: UseTableProps<Row>["getItemId"];
  setPagination: React.Dispatch<React.SetStateAction<TablePagination<Row>>>;
  abortSignal: AbortSignal;
}

async function handleUpdateState<Row>(params: HandleUpdateStateParams<Row>) {
  const { scrollElement, deltaY, rowBuffer, rowPixelHeight, onFetchPages, getItemId } = params;
  if (!scrollElement) return;

  const scrollTop = deltaY + (scrollElement.scrollTop || 0);
  const containerHeight = scrollElement.clientHeight || 0;
  scrollElement.scrollTop = Math.max(scrollTop, 0);

  const range = viewToVisibleRange({
    buffer: rowBuffer,
    totalRows: params.pagination.totalRows,
    rowPixelHeight: rowPixelHeight,
    scrollTop,
    containerHeight,
  });

  const visibleEntries = rangeToEntries(range, params.pagination);

  params.setPagination((prev) => ({ ...prev, visibleRows: visibleEntries }));

  const fetchPromise = fetchPagesWithCursor({
    entries: visibleEntries,
    paginatedState: params.pagination,
    onFetchPages,
    getItemId,
  });

  let result: PagesWithCursor<Row>;

  const abortPromise = new Promise<never>((_, reject) => {
    params.abortSignal.addEventListener("abort", () =>
      reject(new DOMException("aborted", "AbortError"))
    );
  });

  try {
    result = await Promise.race([fetchPromise, abortPromise]);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log("aborted");
      return;
    }
    throw error;
  }

  const { state, cursor } = result;

  const offset = cursor?.offset || 0;
  scrollElement.scrollTop = Math.max(scrollTop + offset * rowPixelHeight, 0);

  params.setPagination({
    pages: state.pages,
    totalRows: state.totalRows,
    rowsPerPage: state.rowsPerPage,
    visibleRows: rangeToEntries(range, state),
  });
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

interface PagesWithCursor<Row> {
  state: PaginatedState<Row>;
  cursor: { offset: number } | null;
}

async function fetchPagesWithCursor<Row>(params: {
  entries: Entry<Row>[];
  paginatedState: PaginatedState<Row>;
  onFetchPages: UseTableProps<Row>["onFetchPages"];
  getItemId: (item: Row) => Id;
}): Promise<PagesWithCursor<Row>> {
  const { getItemId } = params;

  const start = params.entries[0].recordIndex;
  const end = params.entries.at(-1)?.recordIndex || start;
  const range: Range = [start, end];

  const pagesIndexes = params.entries.map((row) => row.pageIndex);
  const pages = await params.onFetchPages(pagesIndexes, params.paginatedState.rowsPerPage);
  const state = mergePagesToState(pages); // params.paginatedState

  const prevArray = params.entries.map((row) => row.record);
  const nextArray = rangeToEntries(range, state).map((row) => row.record);

  const cursor = calculateOffsetFromCursor({ prevArray, nextArray, getItemId });

  return { state, cursor };
}

function rangeToEntries<Row>(range: Range, state: PaginatedState<Row>): Entry<Row>[] {
  const [start, end] = range;
  const length = end - start + 1;
  const entries: Entry<Row>[] = [];
  for (let index = 0; index < length; index++) {
    const recordIndex = index + start;
    const pageIndex = Math.floor(recordIndex / state.rowsPerPage);
    const page = state.pages[pageIndex];
    const pageOffset = recordIndex % state.rowsPerPage;
    const record = page?.records.at(pageOffset) || null;
    const entry: Entry<Row> = { record, recordIndex, pageIndex };
    entries.push(entry);
  }
  return entries;
}

function mergePagesToState<Row>(
  rawPages: PageResponse<Row>[],
  prevPaginatedState?: PaginatedState<Row>
) {
  if (!rawPages.length) return defaultPagination;
  const pages = prevPaginatedState ? [...prevPaginatedState.pages] : [];
  for (const page of rawPages) pages[page.pageIndex] = page;
  const totalRecords = rawPages[0].totalRecords;
  const rowsPerPage = rawPages[0].pageSize;
  return { pages, totalRows: totalRecords, rowsPerPage };
}
