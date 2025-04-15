import { ListStore } from "./List.store";

test("visible entries", () => {
  const fetchPageMock = vi.fn();
  const list = new ListStore<{ id: string; name: string }>();

  list.on(ListStore.EventType.VISIBLE_PAGES_CHANGED, fetchPageMock);
  expect(fetchPageMock).toHaveBeenCalledTimes(0);

  list.applyPageSnapshot({
    index: 0,
    perPage: 2,
    data: [],
    total: 6,
  });
  expect(list.totalPages).toBe(3);

  // we have 3 pages, each with 2 entries
  // visible range is 0-2, so we should have 1 page visible
  expect(list.visiblePages).toHaveLength(1);
  expect(list.visiblePages[0].index).toBe(0);
  expect(fetchPageMock).toHaveBeenCalledTimes(1);

  // set the visible range to 0-1
  // we should have 1 page visible
  // we should NOT fetch the page again as the visible range is the same
  list.setVisibleRange(0, 1);
  expect(list.visiblePages).toHaveLength(1);
  expect(list.visiblePages[0].index).toBe(0);
  expect(fetchPageMock).toHaveBeenCalledTimes(1);

  // set the visible range to 1-2
  // we should have 2 pages visible
  // we should fetch the page again as the visible range is different
  list.setVisibleRange(1, 2);
  expect(list.visiblePages).toHaveLength(2);
  expect(list.visiblePages[0].index).toBe(0);
  expect(list.visiblePages[1].index).toBe(1);
  expect(fetchPageMock).toHaveBeenCalledTimes(2);

  // set the visible range to 2-3
  // we should have 1 page visible
  // we should fetch the page again as the visible range is different
  list.setVisibleRange(2, 3);
  expect(list.visiblePages).toHaveLength(1);
  expect(list.visiblePages[0].index).toBe(1);
  expect(fetchPageMock).toHaveBeenCalledTimes(3);

  // set the visible range to 3-4
  // we should have 2 pages visible
  // we should fetch the page again as the visible range is different
  list.setVisibleRange(3, 4);
  expect(list.visiblePages).toHaveLength(2);
  expect(fetchPageMock).toHaveBeenCalledTimes(4);
});
