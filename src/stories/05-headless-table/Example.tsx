/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Table } from "./table/components/Table";
import { fetchData } from "./fetchData";
import { Resizer } from "./Resizer";
import { usePaginator } from "./usePaginator";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Column } from "./table/types/Column";
import { Row } from "./Row";
import { useRef } from "react";
import { useTable } from "./table/hooks/useTable";

const columns: Column<Row>[] = [
  {
    id: "index",
    width: 50,
    BodyCell: ({ recordIndex }) => <div>{recordIndex}</div>,
    HeaderCell: () => <span>Index</span>,
  },
  {
    id: "name",
    width: 100,
    BodyCell: ({ record }) => <div className="truncate">{record.name}</div>,
    HeaderCell: () => <span className="truncate">Name</span>,
  },
  {
    id: "age",
    width: 100,
    BodyCell: ({ record }) => <div>{record.age}</div>,
    HeaderCell: () => <span>Age</span>,
  },
  {
    id: "email",
    width: "auto",
    BodyCell: ({ record }) => <span>{record.email}</span>,
    HeaderCell: () => <span>Email</span>,
  },
];

export function Example() {
  const paginator = usePaginator<Row>({
    initialPageIndex: 0,
    initialTotalRecords: 0,
    initialRowsPerPage: 10,
    fetchPageData: (pageIndex, pageSize) => fetchData(pageIndex, pageSize),
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const table = useTable({
    columns,
    data: paginator.data,
    rowsPerPage: paginator.rowsPerPage,
    totalRows: paginator.totalRecords,
    visibleRows: paginator.visibleRecords,
    rowPixelHeight: 40,
    rowBuffer: 5,
    onVisibleRowsChange: paginator.onVisibleRecordsChange,
    scrollContainerElement: scrollContainerRef.current,
  });

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <div className="border border-slate-400 flex flex-col w-full rounded h-full">
          <div className="flex flex-row">
            {table.columns.map((column) => {
              return (
                <div
                  key={column.id}
                  className="flex-1 border-b border-slate-400 py-1 px-2 bg-slate-100 rounded-t"
                  style={{ width: column.width, maxWidth: column.width }}
                >
                  <column.HeaderCell />
                </div>
              );
            })}
          </div>
          <div className="w-full h-full overflow-auto" ref={scrollContainerRef}>
            <div
              className="grid w-full"
              style={{
                gridTemplateRows: `repeat(${table.totalRows}, minmax(0, 1fr))`,
                minHeight: table.totalRows * table.rowPixelHeight,
              }}
            >
              {table.visibleRows.map(({ record, recordIndex }) => (
                <div
                  key={recordIndex}
                  className="outline outline-gray-300 bg-green-200/20"
                  style={{
                    gridRowStart: recordIndex + 1, // gridRowStart is 1-based index
                    minHeight: table.rowPixelHeight,
                    maxHeight: table.rowPixelHeight,
                    height: table.rowPixelHeight,
                  }}
                >
                  <div
                    className="flex flex-row not-last-of-type:border-b border-slate-300 items-center shrink-0"
                    key={recordIndex}
                    style={{ height: 40 }}
                  >
                    {table.columns.map((column) => {
                      return (
                        <div
                          key={column.id}
                          className="flex-1 p-1 px-2"
                          style={{ width: column.width, maxWidth: column.width }}
                        >
                          {record && <column.BodyCell record={record} recordIndex={recordIndex} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Resizer>
      <PagesLoadingStatus
        totalPages={paginator.totalPages}
        fetchingPageIndexes={paginator.fetchingPageIndexes}
      />
    </div>
  );
}
