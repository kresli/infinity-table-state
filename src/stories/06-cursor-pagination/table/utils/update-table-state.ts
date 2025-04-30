import { Dispatch, SetStateAction } from "react";
import { viewToVisibleRange } from "./view-to-visible-range";
import { Id } from "../types/Id";
import { TablePagination } from "../types/TablePagination";
import { cursorFetch, PagesWithCursor } from "./cursor-fetch";
import { rangeToEntries } from "./range-to-entries";
import { PageResponse } from "../types/PageResponse";

interface Params<Row> {
  pagination: TablePagination<Row>;
  scrollElement: HTMLDivElement | null;
  deltaY: number;
  rowBuffer: number;
  rowPixelHeight: number;
  abortSignal: AbortSignal;
  onFetchPages: (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;
  getItemId: (item: Row) => Id;
  onPaginationChange: Dispatch<SetStateAction<TablePagination<Row>>>;
}

export async function updateTableState<Row>(params: Params<Row>) {
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

  params.onPaginationChange((prev) => ({ ...prev, visibleRows: visibleEntries }));

  const fetchPromise = cursorFetch({
    entries: visibleEntries,
    paginatedState: params.pagination,
    onFetchPages,
    getItemId,
  });

  let result: PagesWithCursor<Row>;

  const abortPromise = getAbortPromise(params.abortSignal);

  try {
    result = await Promise.race([fetchPromise, abortPromise]);
  } catch (error: unknown) {
    if (isAbortError(error)) return;
    throw error;
  }

  const { state, cursor } = result;

  const offset = cursor?.offset || 0;
  scrollElement.scrollTop = Math.max(scrollTop + offset * rowPixelHeight, 0);

  params.onPaginationChange({
    pages: state.pages,
    totalRows: state.totalRows,
    rowsPerPage: state.rowsPerPage,
    visibleRows: rangeToEntries(range, state),
  });
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === "AbortError";
}

function getAbortPromise(abortSignal: AbortSignal) {
  return new Promise<never>((_, reject) => {
    abortSignal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  });
}
