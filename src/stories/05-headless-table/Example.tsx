/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Table } from "./table/components/Table";
import { fetchData } from "./fetchData";
import { Resizer } from "./Resizer";
import { usePaginator } from "./usePaginator";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Column } from "./table/types/Column";
import { Row } from "./Row";

const columns: Column<Row>[] = [
  {
    id: "index",
    width: 50,
    BodyCell: ({ row }) => <div>{row.rowIndex}</div>,
    HeaderCell: () => <span>Index</span>,
  },
  {
    id: "name",
    width: 100,
    BodyCell: ({ row }) => <div className="truncate">{row.data.name}</div>,
    HeaderCell: () => <span className="truncate">Name</span>,
  },
  {
    id: "age",
    width: 100,
    BodyCell: ({ row }) => <div>{row.data.age}</div>,
    HeaderCell: () => <span>Age</span>,
  },
  {
    id: "email",
    width: "auto",
    BodyCell: ({ row }) => <span>{row.data.email}</span>,
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

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <Table
          data={paginator.data}
          columns={columns}
          rowsPerPage={paginator.rowsPerPage}
          totalRows={paginator.totalRecords}
          visibleRows={paginator.visibleRecords}
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
