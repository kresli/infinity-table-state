import { viewToVisibleRange } from "./view-to-visible-range";

test("get visible rows", () => {
  const result = viewToVisibleRange({
    buffer: 2,
    totalRows: 100,
    rowPixelHeight: 20,
    scrollTop: 0,
    viewportHeight: 200,
  });
  expect(result).toEqual([0, 12]);
});
