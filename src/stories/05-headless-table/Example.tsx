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
          rowBuffer={5}
          rowPixelHeight={40}
        />
      </Resizer>
      <PagesLoadingStatus
        totalPages={paginator.totalPages}
        fetchingPageIndexes={paginator.fetchingPageIndexes}
      />
    </div>
  );
}
