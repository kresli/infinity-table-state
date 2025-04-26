import { fetchData } from "./fetchData";
import { Resizer } from "./Resizer";
import { usePaginator } from "./usePaginator";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Column } from "./table/types/Column";
import { Row } from "./Row";
import { useTable } from "./table/hooks/useTable";
import { Table } from "./table";
import { useRef } from "react";

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
  const rowPixelHeight = 40;
  const rowBuffer = 5;
  const deletedRows = useRef(new Set<number>());

  const paginator = usePaginator<Row>({
    initialPageIndex: 0,
    initialTotalRecords: 0,
    initialRowsPerPage: 10,
    fetchPageData: (pageIndex, pageSize) => fetchData(pageIndex, pageSize, deletedRows.current),
  });

  const table = useTable<Row>({
    columns,
    rowPixelHeight,
    rowBuffer,
    getItemId: (item) => item.id,
    onFetchPages: async (pageIndexes) => {
      console.log("pageIndexes", pageIndexes);
      const pages = await Promise.all(
        pageIndexes.map((pageIndex) => paginator.fetchPage(pageIndex))
      );
      return pages.map((page) => ({
        pageIndex: page.index,
        pageSize: page.pageSize,
        totalRecords: page.totalRecords,
        records: page.records,
      }));
    },
  });

  // useOnMount(() => table.refetchVisibleRows());

  return (
    <div className="flex flex-col gap-2">
      {/* <Toolbar
        deletedRowsRef={deletedRows}
        onDeleteRows={() => {
          deletedRows.current.add(deletedRows.current.size);
          table.refetchVisibleRows();
        }}
      /> */}
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

// function Toolbar(props: { deletedRowsRef: RefObject<Set<number>>; onDeleteRows: () => void }) {
//   return (
//     <div>
//       <Button
//         onClick={() => {
//           // const ids = Array.from({ length: 1 }).map((_, i) => i);
//           // const max = Math.max(...[...props.deletedRowsRef.current, 0]);
//           // for (const id of ids) {
//           //   // console.log("deletedRows", max + id);
//           //   props.deletedRowsRef.current.add(max + id);
//           // }
//           // console.log("deletedRows", props.deletedRowsRef.current);
//           // props.onDeleteRows(ids);
//         }}
//       >
//         Remove 20 above
//       </Button>
//     </div>
//   );
// }

// function Button(props: PropsWithChildren<{ onClick: () => void }>) {
//   return (
//     <button
//       onClick={props.onClick}
//       className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer active:bg-blue-700"
//     >
//       {props.children}
//     </button>
//   );
// }
