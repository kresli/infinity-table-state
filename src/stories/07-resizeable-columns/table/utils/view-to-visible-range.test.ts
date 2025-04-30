import { viewToVisibleRange } from "./view-to-visible-range";

test("get visible rows", () => {
  const result = viewToVisibleRange({
    buffer: 2,
    totalRows: 100,
    rowPixelHeight: 20,
    scrollTop: 0,
    containerHeight: 200,
  });
  expect(result).toEqual([0, 12]);
});
