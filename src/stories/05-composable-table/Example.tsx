/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { columns } from "./columns";
import { Table } from "./Table";
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
    initialPageIndex: 0,
    initialTotalRecords: 0,
    initialRowsPerPage: 10,
    fetchPageData: (pageIndex, pageSize) => fetchData(pageIndex, pageSize),
  });

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <Table
          data={paginator.data}
          columns={columns}
          rowsPerPage={paginator.rowsPerPage}
          totalRows={paginator.totalRecords}
          onVisibleRowsChange={paginator.onVisibleRecordsChange}
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
