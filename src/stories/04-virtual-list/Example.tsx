/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { columns } from "./columns";
import { Table } from "./Table";
import { EffectCallback, useEffect } from "react";
import { fetchData } from "./fetchData";
import { Resizer } from "./Resizer";
import clsx from "clsx";
import { usePaginator } from "./usePaginator";

export interface PaginatorData<Record> {
  index: number;
  pageSize: number;
  totalRecords: number;
  records: Record[];
}

export function Example() {
  const paginator = usePaginator({
    fetchPageData: (pageIndex, pageSize) => fetchData(pageIndex, pageSize),
  });

  const onVisibleRowsChange = (range: [start: number, end: number]) => {
    const [start, end] = range;
    const startPageIndex = Math.floor(start / paginator.rowsPerPage);
    const endPageIndex = Math.floor(end / paginator.rowsPerPage);
    for (let i = startPageIndex; i <= endPageIndex; i++) {
      paginator.fetchPage(i);
    }
  };

  useOnMount(() => void paginator.fetchPage(0));

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <Table
          data={paginator.data}
          columns={columns}
          rowsPerPage={paginator.rowsPerPage}
          totalRows={paginator.totalRecords}
          onVisibleRowsChange={onVisibleRowsChange}
        />
      </Resizer>
      <PagesLoadingStatus
        totalPages={paginator.totalPages}
        fetchingPageIndexes={paginator.fetchingPageIndexes}
      />
    </div>
  );
}

function PagesLoadingStatus(props: { totalPages: number; fetchingPageIndexes: Set<number> }) {
  return (
    <div className="flex flex-row gap-2 border border-slate-400 rounded p-2 overflow-hidden">
      <div className="text-nowrap">fetching page</div>
      {Array.from({ length: props.totalPages }).map((_, pageIndex) => (
        <div
          key={pageIndex}
          className={clsx(
            props.fetchingPageIndexes.has(pageIndex) && "text-slate-600",
            !props.fetchingPageIndexes.has(pageIndex) && "text-slate-200"
          )}
        >
          {pageIndex + 1}
        </div>
      ))}
    </div>
  );
}

function useOnMount<T extends EffectCallback>(fn: T) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, []);
}
