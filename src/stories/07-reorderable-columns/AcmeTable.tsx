import { Resizer } from "./Resizer";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Row } from "./Row";
import { Table, useTable, Column } from "./table";
import { useState } from "react";
import { apiGetPage } from "./helpers/fake-server";

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
    BodyCell: ({ record }) => <div className="truncate">{record?.name}</div>,
    HeaderCell: () => <span className="truncate">Name</span>,
  },
  {
    id: "age",
    width: 100,
    BodyCell: ({ record }) => <div>{record?.age}</div>,
    HeaderCell: () => <span>Age</span>,
  },
  {
    id: "email",
    width: "auto",
    BodyCell: ({ record }) => <div className="text-nowrap">{record?.email}</div>,
    HeaderCell: () => <span>Email</span>,
  },
];

function getItemId(row: Row) {
  return row.id;
}

export function AcmeTable() {
  const rowPixelHeight = 40;
  const rowBuffer = 5;
  const [fetchingPageIndexes, setFetchingPageIndexes] = useState(new Set<number>());

  const onFetchPages = async (pageIndexes: number[], pageSize: number) => {
    setFetchingPageIndexes((prev) => new Set([...prev, ...pageIndexes]));
    const pages = await Promise.all(
      pageIndexes.map((pageIndex) => apiGetPage(pageIndex, pageSize))
    );
    setFetchingPageIndexes((prev) => {
      const newSet = new Set(prev);
      pageIndexes.forEach((pageIndex) => newSet.delete(pageIndex));
      return newSet;
    });
    return pages.map((page) => ({
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      totalRecords: page.totalRecords,
      records: page.records,
    }));
  };

  const table = useTable<Row>({
    columns,
    rowPixelHeight,
    rowBuffer,
    getItemId,
    onFetchPages,
  });

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <Table className="border border-slate-400 rounded overflow-hidden">
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
                className={
                  "outline outline-gray-300 not-last-of-type:border-b border-slate-300 items-center cursor-pointer"
                }
              >
                {(column) => (
                  <Table.RowCell className="p-1 px-2" key={column.id} column={column}>
                    <column.BodyCell record={row} recordIndex={rowIndex} />
                  </Table.RowCell>
                )}
              </Table.BodyRow>
            )}
          </Table.Body>
        </Table>
      </Resizer>
      <PagesLoadingStatus totalPages={table.totalRows} fetchingPageIndexes={fetchingPageIndexes} />
    </div>
  );
}
