import { getVisibleRows, useVisibleRowsObserver } from "./useVisibleRowsObserver";
import { Column } from "../types/Column";
import { useState } from "react";

export interface UseTableProps<Row> {
  columns: Column<Row>[];
  data: Row[];
  rowsPerPage: number;
  totalRows: number;
  visibleRows: [start: number, end: number];
  rowPixelHeight: number;
  rowBuffer: number;
  onVisibleRowsChange: (range: [start: number, end: number]) => void;
}

export interface UseTable<Row> {
  columns: Column<Row>[];
  rows: Row[];
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: { record: Row | null; recordIndex: number }[];
  forceRecalculateVisibleRows: () => void;
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
}

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  useVisibleRowsObserver({
    element: scrollContainerElement,
    buffer: props.rowBuffer,
    totalRows: props.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    onVisibleRowsChange: props.onVisibleRowsChange,
  });

  const visibleRowsCount = props.visibleRows[1] - props.visibleRows[0] + 1;

  const visibleRows = Array.from({ length: visibleRowsCount }, (_, index) => {
    const recordIndex = index + props.visibleRows[0];
    const record = props.data.at(recordIndex) || null;
    return {
      record,
      recordIndex,
    };
  });

  const forceRecalculateRows = () => {
    return getVisibleRows({
      buffer: props.rowBuffer,
      totalRows: props.totalRows,
      rowPixelHeight: props.rowPixelHeight,
      scrollTop: scrollContainerElement?.scrollTop || 0,
      containerHeight: scrollContainerElement?.clientHeight || 0,
    });
  };

  return {
    columns: props.columns,
    rows: props.data,
    totalRows: props.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows,
    setScrollContainerElement,
    forceRecalculateVisibleRows: forceRecalculateRows,
  };
}
