import { calculateOffsetFromCursor } from "./calculate-offset-from-cursor";
import { Range } from "../types/Range";
import { rangeToEntries } from "./range-to-entries";
import { Entry } from "../types/Entry";
import { PageResponse } from "../types/PageResponse";
import { PaginatedState } from "../types/PaginatedState";
import { Id } from "../types/Id";
import { TablePagination } from "../types/TablePagination";

export interface PagesWithCursor<Row> {
  state: PaginatedState<Row>;
  cursor: { offset: number } | null;
}
export async function cursorFetch<Row>(params: {
  entries: Entry<Row>[];
  paginatedState: PaginatedState<Row>;
  onFetchPages: (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;
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

const defaultPagination: TablePagination<never> = {
  pages: [],
  totalRows: 10,
  rowsPerPage: 10,
  visibleRows: [],
};
