import { useState } from "react";
import { useClientRectObserver } from "./use-client-rect-observer";
import { useAbortController } from "./use-abort-controller";
import { useWheel } from "./use-wheel";
import { TablePagination } from "../types/TablePagination";
import { Id } from "../types/Id";
import { onScrollFetch } from "../utils/on-scroll-fetch";
import { PageResponse } from "../types/PageResponse";
import { Entry } from "../types/Entry";

export interface UseTableProps<Row> {
  rowPixelHeight: number;
  rowBuffer: number;
  onFetchPages: (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;
  getItemId: (item: Row) => Id;
}

export interface UseTable<Row> {
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: Entry<Row>[];
  viewportElement: HTMLDivElement | null;
  gridElement: HTMLDivElement | null;
  gridPosition: { x: number; y: number };
  setViewportElement: (element: HTMLDivElement | null) => void;
  setGridElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
  setGridPosition: (position: { x: number; y: number }) => void;
}

const defaultPagination: TablePagination<never> = {
  pages: [],
  totalRows: 10,
  rowsPerPage: 10,
  visibleRows: [],
};

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [viewportElement, setViewportElement] = useState<HTMLDivElement | null>(null);
  const [gridElement, setGridElement] = useState<HTMLDivElement | null>(null);
  const [gridPosition, setGridPosition] = useState({ x: 0, y: 0 });
  const abortController = useAbortController();

  const [pagination, setPagination] = useState<TablePagination<Row>>(defaultPagination);

  const updateState = async (params: { deltaY: number }) => {
    const controller = abortController.resetController();
    if (!viewportElement) return;
    await onScrollFetch<Row>({
      pagination,
      scrollTop: gridPosition.y - params.deltaY,
      rowBuffer: props.rowBuffer,
      rowPixelHeight: props.rowPixelHeight,
      abortSignal: controller.signal,
      viewportHeight: viewportElement.clientHeight,
      setScrollTop: (scrollTop) => updateViewportPosition({ y: scrollTop }),
      onFetchPages: props.onFetchPages,
      getItemId: props.getItemId,
      onPaginationChange: setPagination,
    });
    abortController.resetController(controller);
  };

  useWheel(viewportElement, (e) => updateState({ deltaY: e.deltaY }));
  useClientRectObserver(viewportElement, () => updateState({ deltaY: 0 }));

  const refechVisibleRows = async () => await updateState({ deltaY: 0 });

  const updateViewportPosition = (position: { x?: number; y?: number }) => {
    setGridPosition((prev) => ({
      x: Math.min(0, position.x ?? prev.x),
      y: Math.min(0, position.y ?? prev.y),
    }));
  };

  return {
    totalRows: pagination.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows: pagination.visibleRows,
    viewportElement,
    gridElement,
    gridPosition,
    setViewportElement,
    refechVisibleRows,
    setGridElement,
    setGridPosition: updateViewportPosition,
  };
}
