import { useVisibleRowsObserver } from "./useVisibleRowsObserver";
import { Column } from "../types/Column";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { findLongestCommonSubarray } from "../../utils/find-longest-common-subarray";
import { calculateOffsetFromCursor } from "../../utils/calculate-offset-from-cursor";

export interface UseTableProps<Row> {
  columns: Column<Row>[];
  // data: Row[];
  rowsPerPage: number;
  totalRows: number;
  visibleRows: [start: number, end: number];
  rowPixelHeight: number;
  rowBuffer: number;
  onVisibleRowsChange: (range: [start: number, end: number]) => Promise<Row[]>;
}

export interface UseTable<Row> {
  columns: Column<Row>[];
  rows: (Row | null)[];
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: { record: Row | null; recordIndex: number }[];
  onFetchPage: (pageIndex: number) => Promise<Row[]>;
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
}

function usePrevValue<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const [data, setData] = useState<(Row | null)[]>([]);
  useVisibleRowsObserver({
    element: scrollContainerElement,
    buffer: props.rowBuffer,
    totalRows: props.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    onVisibleRowsChange: async (range) => {
      console.log("onVisibleRowsChange", range);
      if (scrollContainerElement === null) return;
      const prevVisibleData = Array.from(
        { length: props.visibleRows[1] - props.visibleRows[0] + 1 },
        (_, index) => {
          const recordIndex = index + props.visibleRows[0];
          const record = data.at(recordIndex) || null;
          return record;
        }
      );
      const allData = await props.onVisibleRowsChange(range);
      console.log("allData", allData);
      const nextVisibleData = Array.from({ length: range[1] - range[0] + 1 }, (_, index) => {
        const recordIndex = index + range[0];
        const record = allData.at(recordIndex) || null;
        return record;
      });
      const commonSubarray = calculateOffsetFromCursor({
        prevArray: prevVisibleData,
        nextArray: nextVisibleData,
        getItemId: (item) => item.name,
      });
      setData(nextVisibleData);
      scrollContainerElement.scrollTop =
        scrollContainerElement.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
    },
  });

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
  //   console.log("commonSubarray", commonSubarray);
  //   scrollContainerElement.scrollTop =
  //     scrollContainerElement.scrollTop + (commonSubarray?.offset || 0) * props.rowPixelHeight;
  //   // props.onVisibleRowsChange([
  //   //   props.visibleRows[0] + commonSubarray?.offset,
  //   //   props.visibleRows[1] + commonSubarray?.offset,
  //   // ]);
  // }, [prevData, props.data, props.rowPixelHeight, props.visibleRows, scrollContainerElement]);

  const visibleRowsCount = props.visibleRows[1] - props.visibleRows[0] + 1;

  const visibleRows = Array.from({ length: visibleRowsCount }, (_, index) => {
    const recordIndex = index + props.visibleRows[0];
    const record = data.at(recordIndex) || null;
    return {
      record,
      recordIndex,
    };
  });

  return {
    columns: props.columns,
    rows: data,
    totalRows: props.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
  };
}
