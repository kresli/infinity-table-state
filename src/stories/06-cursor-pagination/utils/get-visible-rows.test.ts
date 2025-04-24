import { getVisibleRows } from "./get-visible-rows";

test("get visible rows", () => {
  const result = getVisibleRows({
    buffer: 2,
    totalRows: 100,
    rowPixelHeight: 20,
    scrollTop: 0,
    containerHeight: 200,
  });
  expect(result).toEqual([0, 12]);
});
