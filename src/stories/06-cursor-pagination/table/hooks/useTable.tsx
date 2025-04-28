import { useVisibleRowsObserver } from "./useVisibleRowsObserver";
import { Column } from "../types/Column";
import { useState } from "react";
import { useOnMount } from "../../useOnMount";
import { PageResponse, usePaginator } from "./PageResponse";
import { Range } from "../types/Range";
import { calculateOffsetFromCursor } from "../../utils/calculate-offset-from-cursor";

type Id = string | number;

export interface UseTableProps<Row> {
  columns: Column<Row>[];
  rowPixelHeight: number;
  rowBuffer: number;
  onFetchPages: (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;
  getItemId: (item: Row) => Id;
}

export interface UseTable<Row> {
  columns: Column<Row>[];
  rows: (Row | null)[];
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: { record: Row | null; recordIndex: number }[];
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
}

function getVisibleRowsFromPages<Row>(
  pages: (PageResponse<Row> | undefined)[],
  visibleRange: Range
): (Row | null)[] {
  const visibleRowsCount = visibleRange[1] - visibleRange[0] + 1;
  return Array.from({ length: visibleRowsCount }, (_, index) => {
    const pageSize = pages[0]?.pageSize || 0;
    const recordIndex = index + visibleRange[0];
    const pageIndex = Math.floor(recordIndex / pageSize);
    const pageOffset = recordIndex % pageSize;
    const page = pages[pageIndex];
    return page?.records.at(pageOffset) || null;
  });
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState<Range>([0, 0]);
  const paginator = usePaginator(props.onFetchPages);

  const onVisibleRowsChange = async (range: Range) => {
    if (range[0] === visibleRange[0] && range[1] === visibleRange[1]) return;
    setVisibleRange(range);
    // const prevVisibleRows = getVisibleRowsFromPages(paginator.pages, range);
    await paginator.fetchPagesByRange(range);
    // const nextVisibleRows = getVisibleRowsFromPages(newPages, range);
    // const commonSubarray = calculateOffsetFromCursor({
    //   prevArray: prevVisibleRows,
    //   nextArray: nextVisibleRows,
    //   getItemId: props.getItemId,
    // });
    // console.log("commonSubarray", commonSubarray);
  };

  useVisibleRowsObserver({
    element: scrollContainerElement,
    buffer: props.rowBuffer,
    totalRows: paginator.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    onVisibleRowsChange,
  });

  const visibleRowsCount = visibleRange[1] - visibleRange[0] + 1;

  const visibleRows = Array.from({ length: visibleRowsCount }, (_, index) => {
    const recordIndex = index + visibleRange[0];
    const record = paginator.data.at(recordIndex) || null;
    return { record, recordIndex };
  });

  const refechVisibleRows = async () => {
    const prevVisibleRows = getVisibleRowsFromPages(paginator.pages, visibleRange);
    await paginator.fetchPagesByRange(visibleRange, (pages) => {
      const nextVisibleRows = getVisibleRowsFromPages(pages, visibleRange);
      const commonSubarray = calculateOffsetFromCursor({
        prevArray: prevVisibleRows,
        nextArray: nextVisibleRows,
        getItemId: props.getItemId,
      });
      scrollContainerElement!.scrollTop =
        scrollContainerElement!.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
      console.log("commonSubarray", commonSubarray);
    });
  };

  useOnMount(() => paginator.fetchPage(0));

  return {
    columns: props.columns,
    rows: paginator.data,
    totalRows: paginator.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
    refechVisibleRows,
  };
}

// const prevData = usePrevValue(props.data);

// useLayoutEffect(() => {
//   if (scrollContainerElement === null) return;
//   const prevVisibleData = prevData.slice(props.visibleRows[0], props.visibleRows[1] + 1);
//   const nextVisibleData = props.data.slice(props.visibleRows[0], props.visibleRows[1] + 1);
//   const commonSubarray = calculateOffsetFromCursor({
//     prevArray: prevVisibleData,
//     nextArray: nextVisibleData,
//     getItemId: (item) => item.name,
//   });
//   scrollContainerElement.scrollTop =
//     scrollContainerElement.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
//   // props.onVisibleRowsChange([
//   //   props.visibleRows[0] + commonSubarray?.offset,
//   //   props.visibleRows[1] + commonSubarray?.offset,
//   // ]);
// }, [prevData, props.data, props.rowPixelHeight, props.visibleRows, scrollContainerElement]);

// onVisibleRowsChange: async (range) => {
//   if (scrollContainerElement === null) return;
//   const prevVisibleData = Array.from(
//     { length: props.visibleRows[1] - props.visibleRows[0] + 1 },
//     (_, index) => {
//       const recordIndex = index + props.visibleRows[0];
//       const record = data.at(recordIndex) || null;
//       return record;
//     }
//   );
//   const allData = await props.onVisibleRowsChange(range);
//   const nextVisibleData = Array.from({ length: range[1] - range[0] + 1 }, (_, index) => {
//     const recordIndex = index + range[0];
//     const record = allData.at(recordIndex) || null;
//     return record;
//   });
//   const commonSubarray = calculateOffsetFromCursor({
//     prevArray: prevVisibleData,
//     nextArray: nextVisibleData,
//     getItemId: props.getItemId,
//   });
//   setData(nextVisibleData);
//   scrollContainerElement.scrollTop =
//     scrollContainerElement.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
// },
