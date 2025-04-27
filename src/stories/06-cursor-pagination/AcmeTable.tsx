import { fetchData } from "./fetchData";
import { Resizer } from "./Resizer";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Column } from "./table/types/Column";
import { Row } from "./Row";
import { useTable } from "./table/hooks/useTable";
import { Table } from "./table";
import { PropsWithChildren, useState } from "react";
import clsx from "clsx";

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
    BodyCell: ({ record }) => <div className="text-nowrap">{record.email}</div>,
    HeaderCell: () => <span>Email</span>,
  },
];

type Id = string | number;

interface AcmeTableProps {
  hoveredRowId: Id | null;
  deletedRowsIndexesRef: React.RefObject<Set<number>>;
  onRowHover: (id: number | string, hover: boolean) => void;
}

function getItemId(row: Row) {
  return row.id;
}

export function AcmeTable(props: AcmeTableProps) {
  const rowPixelHeight = 40;
  const rowBuffer = 5;
  const [fetchingPageIndexes, setFetchingPageIndexes] = useState(new Set<number>());
  const [selectedRowsIndexes, setSelectedRowsIndexes] = useState(new Set<number>());

  const onFetchPages = async (pageIndexes: number[], pageSize: number) => {
    setFetchingPageIndexes((prev) => new Set([...prev, ...pageIndexes]));
    const pages = await Promise.all(
      pageIndexes.map((pageIndex) =>
        fetchData(pageIndex, pageSize, props.deletedRowsIndexesRef.current)
      )
    );
    setFetchingPageIndexes((prev) => {
      const newSet = new Set(prev);
      pageIndexes.forEach((pageIndex) => newSet.delete(pageIndex));
      return newSet;
    });
    return pages.map((page) => ({
      pageIndex: page.index,
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

  const onToggleSelectedRow = (rowIndex: number) => {
    console.log("onToggleSelectedROw", rowIndex);
    setSelectedRowsIndexes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  };

  const onDeleteSelectedRows = () => {
    props.deletedRowsIndexesRef.current = new Set([
      ...props.deletedRowsIndexesRef.current,
      ...selectedRowsIndexes,
    ]);
    setSelectedRowsIndexes(new Set());
    return table.refechVisibleRows();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={onDeleteSelectedRows}
          disabled={selectedRowsIndexes.size === 0}
          label="Delete selected"
        />
        <Button onClick={table.refechVisibleRows} label="Refresh" />
      </div>
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
                className={clsx(
                  "outline outline-gray-300 not-last-of-type:border-b border-slate-300 items-center cursor-pointer",
                  row?.id === props.hoveredRowId && "bg-green-200/50",
                  row?.id !== props.hoveredRowId && "bg-green-200/20",
                  row && selectedRowsIndexes.has(rowIndex) && "bg-blue-200/50!"
                )}
                onMouseOver={() => row && props.onRowHover(row.id, true)}
                onMouseLeave={() => row && props.onRowHover(row.id, false)}
                onClick={() => row && onToggleSelectedRow(rowIndex)}
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
      <PagesLoadingStatus totalPages={table.totalRows} fetchingPageIndexes={fetchingPageIndexes} />
    </div>
  );
}

function Button(
  props: PropsWithChildren<{
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    label: string;
  }>
) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    await props.onClick();
    setLoading(false);
  };
  return (
    <button
      onClick={onClick}
      className={clsx(
        "bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 cursor-pointer active:bg-blue-700 flex flex-row gap-2 items-center",
        props.disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {loading && (
        <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      )}
      <div>{props.label}</div>
    </button>
  );
}
