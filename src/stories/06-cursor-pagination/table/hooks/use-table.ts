import { Column } from "../types/Column";
import { useState } from "react";
import { useClientRectObserver } from "./use-client-rect-observer";
import { useAbortController } from "./use-abort-controller";
import { useWheel } from "./use-wheel";
import { TablePagination } from "../types/TablePagination";
import { Id } from "../types/Id";
import { updateTableState } from "../utils/update-table-state";
import { PageResponse } from "../types/PageResponse";
import { Entry } from "../types/Entry";

export interface UseTableProps<Row> {
  columns: Column<Row>[];
  rowPixelHeight: number;
  rowBuffer: number;
  onFetchPages: (pageIndexes: number[], pageSize: number) => Promise<PageResponse<Row>[]>;
  getItemId: (item: Row) => Id;
}

export interface UseTable<Row> {
  columns: Column<Row>[];
  totalRows: number;
  rowPixelHeight: number;
  visibleRows: Entry<Row>[];
  setScrollContainerElement: (element: HTMLDivElement | null) => void;
  refechVisibleRows: () => Promise<void>;
}

const defaultPagination: TablePagination<never> = {
  pages: [],
  totalRows: 10,
  rowsPerPage: 10,
  visibleRows: [],
};

export function useTable<Row>(props: UseTableProps<Row>): UseTable<Row> {
  const [scrollContainerElement, setScrollContainerElement] = useState<HTMLDivElement | null>(null);
  const abortController = useAbortController();

  const [pagination, setPagination] = useState<TablePagination<Row>>(defaultPagination);

  const updateState = async (params: { deltaY: number }) => {
    const controller = abortController.resetController();
    if (!scrollContainerElement) return;
    await updateTableState<Row>({
      pagination,
      scrollElement: scrollContainerElement,
      deltaY: params.deltaY,
      rowBuffer: props.rowBuffer,
      rowPixelHeight: props.rowPixelHeight,
      abortSignal: controller.signal,
      onFetchPages: props.onFetchPages,
      getItemId: props.getItemId,
      onPaginationChange: setPagination,
    });
    abortController.resetController(controller);
  };

  useWheel(scrollContainerElement, (e) => updateState({ deltaY: e.deltaY }));
  useClientRectObserver(scrollContainerElement, () => updateState({ deltaY: 0 }));

  const refechVisibleRows = async () => await updateState({ deltaY: 0 });

  return {
    columns: props.columns,
    totalRows: pagination.totalRows,
    rowPixelHeight: props.rowPixelHeight,
    visibleRows: pagination.visibleRows,
    setScrollContainerElement,
    refechVisibleRows,
  };
}
