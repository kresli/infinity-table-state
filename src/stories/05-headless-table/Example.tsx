/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { fetchData } from "./fetchData";
import { Resizer } from "./Resizer";
import { usePaginator } from "./usePaginator";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Column } from "./table/types/Column";
import { Row } from "./Row";
import { useTable } from "./table/hooks/useTable";
import { Table } from "./table";

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

  const table = useTable({
    columns,
    data: paginator.data,
    rowsPerPage: paginator.rowsPerPage,
    totalRows: paginator.totalRecords,
    visibleRows: paginator.visibleRecords,
    rowPixelHeight: 40,
    rowBuffer: 5,
    onVisibleRowsChange: paginator.onVisibleRecordsChange,
  });

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <Table className="border border-slate-400 rounded">
          <Table.Header state={table}>
            {(column) => (
              <Table.HeaderCell
                key={column.id}
                column={column}
                className="border-b border-slate-400 py-1 px-2 bg-slate-100 rounded-t"
              >
                <column.HeaderCell />
              </Table.HeaderCell>
            )}
          </Table.Header>
          <Table.Body state={table}>
            {(row, rowIndex) => (
              <Table.BodyRow
                key={rowIndex}
                state={table}
                row={row}
                rowIndex={rowIndex}
                className="outline outline-gray-300 bg-green-200/20 not-last-of-type:border-b border-slate-300 items-center"
              >
                {(column) => (
                  <Table.RowCell className="p-1 px-2" key={column.id} column={column}>
                    {row && <column.BodyCell record={row} recordIndex={rowIndex} />}
                  </Table.RowCell>
                )}
              </Table.BodyRow>
            )}
          </Table.Body>
        </Table>
      </Resizer>
      <PagesLoadingStatus
        totalPages={paginator.totalPages}
        fetchingPageIndexes={paginator.fetchingPageIndexes}
      />
    </div>
  );
}
