import { Dispatch, SetStateAction } from "react";
import { viewToVisibleRange } from "./view-to-visible-range";
import { Id } from "../types/Id";
import { TablePagination } from "../types/TablePagination";
import { cursorFetch, PagesWithCursor } from "./cursor-fetch";
import { rangeToEntries } from "./range-to-entries";
import { PageResponse } from "../types/PageResponse";

interface Params<Row> {
  pagination: TablePagination<Row>;
  viewportHeight: number;
  scrollTop: number;
  rowBuffer: number;
  rowPixelHeight: number;
  abortSignal: AbortSignal;
  onFetchPages: (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;
  getItemId: (item: Row) => Id;
  setScrollTop: (scrollTop: number) => void;
  onPaginationChange: Dispatch<SetStateAction<TablePagination<Row>>>;
}

export async function onScrollFetch<Row>(params: Params<Row>) {
  params.setScrollTop(params.scrollTop);

  const range = viewToVisibleRange({
    buffer: params.rowBuffer,
    totalRows: params.pagination.totalRows,
    rowPixelHeight: params.rowPixelHeight,
    scrollTop: -params.scrollTop,
    viewportHeight: params.viewportHeight,
  });

  const visibleEntries = rangeToEntries(range, params.pagination);

  params.onPaginationChange((prev) => ({ ...prev, visibleRows: visibleEntries }));

  const fetchPromise = cursorFetch({
    entries: visibleEntries,
    paginatedState: params.pagination,
    onFetchPages: params.onFetchPages,
    getItemId: params.getItemId,
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
  params.setScrollTop(params.scrollTop + offset * params.rowPixelHeight);

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
