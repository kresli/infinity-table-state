import { Resizer } from "./Resizer";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Row } from "./Row";
import { Table, useTable, Column } from "./table";
import { useRef, useState } from "react";
import { apiGetPage } from "./helpers/fake-server";
import clsx from "clsx";

const defaultColumns: Column<Row>[] = [
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
  const [columns, setColumns] = useState<Column<Row>[]>(defaultColumns);

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

  const onColumnResize = (columnId: string) => (newWidth: number) => {
    setColumns((prev) =>
      prev.map((column) => (column.id === columnId ? { ...column, width: newWidth } : column))
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <Table className="border border-slate-400 rounded overflow-hidden">
          <Table.Header state={table}>
            {(column) => (
              <Table.HeaderCell
                key={column.id}
                column={column}
                className="border-b border-slate-400 py-1 px-2 bg-slate-100 rounded-t hover:bg-slate-200 relative"
              >
                <column.HeaderCell />
                <HeaderResizer minWidth={20} onWidthChange={onColumnResize(column.id)} />
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
                className="outline outline-gray-300 not-last-of-type:border-b border-slate-300 items-center cursor-pointer"
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

function HeaderResizer(props: { minWidth: number; onWidthChange: (width: number) => void }) {
  const [resizing, setResizing] = useState(false);
  const ghostRef = useRef<Ghost>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = e.currentTarget.parentElement?.clientWidth || 0;
    let newWidth = startWidth;
    ghostRef.current = createGhost();
    const onMouseMove = (e: MouseEvent) => {
      const width = Math.max(startWidth + e.clientX - startX, props.minWidth);
      newWidth = width;
      props.onWidthChange(width);
      setResizing(true);
      ghostRef.current!.moveTo(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      props.onWidthChange(newWidth);
      setResizing(false);
      ghostRef.current?.remove();
      ghostRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      className={clsx(
        "absolute top-0 -right-1 w-2 h-full bg-blue-400 z-1 opacity-0 hover:opacity-100 cursor-col-resize",
        resizing && "opacity-100"
      )}
      onMouseDown={onMouseDown}
    />
  );
}

interface Ghost {
  remove: () => void;
  moveTo: (x: number, y: number) => void;
}

function createGhost() {
  const width = 1000;
  const height = 1000;
  const ghost = document.createElement("div");
  ghost.style.position = "fixed";
  ghost.style.zIndex = "9999";
  // ghost.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  ghost.style.width = "1000px";
  ghost.style.height = "1000px";
  document.body.appendChild(ghost);
  return {
    remove: () => {
      document.body.removeChild(ghost);
    },
    // who knows what will happen if on overflow scroll
    moveTo: (x: number, y: number) => {
      ghost.style.left = `${x - width / 2}px`;
      ghost.style.top = `${y - height / 2}px`;
    },
  };
}
