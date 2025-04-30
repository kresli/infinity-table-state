import { Range } from "../types/Range";
import { Entry } from "../types/Entry";
import { PaginatedState } from "../types/PaginatedState";

export function rangeToEntries<Row>(range: Range, state: PaginatedState<Row>): Entry<Row>[] {
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
