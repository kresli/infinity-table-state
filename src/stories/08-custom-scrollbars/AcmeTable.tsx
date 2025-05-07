import { Resizer } from "./Resizer";
import { PagesLoadingStatus } from "./PagesLoadingStatus";
import { Row } from "./Row";
import { Table, useTable, Column } from "./table";
import { CSSProperties, useRef, useState } from "react";
import { apiGetPage } from "./helpers/fake-server";
import clsx from "clsx";
import { Scrollbar } from "./table/components/Scrollbar";

const defaultColumns: Column<Row>[] = [
  {
    id: "index",
    width: 50,
    BodyCell: ({ recordIndex }) => <div>{recordIndex}</div>,
    HeaderCell: () => <span>Index</span>,
  },
  {
    id: "name",
    width: 400,
    BodyCell: ({ record }) => <div className="truncate">{record?.name}</div>,
    HeaderCell: () => <span className="truncate">Name</span>,
  },
  {
    id: "age",
    width: 200,
    BodyCell: ({ record }) => <div>{record?.age}</div>,
    HeaderCell: () => <span>Age</span>,
  },
  {
    id: "email",
    width: 600,
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

  const tableStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  };

  const viewportStyle: CSSProperties = {
    height: "100%",
    overflow: "hidden",
    width: "100%",
    position: "relative",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    position: "relative",
    height: 32,
  };

  const bodyStyle: CSSProperties = {
    display: "grid",
    width: "fit-content",
    minWidth: "100%",
    gridTemplateRows: `repeat(${table.totalRows}, minmax(0, 1fr))`,
    minHeight: table.totalRows * table.rowPixelHeight,
  };

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <div
          className="grid gap-2 overflow-hidden h-full"
          style={{ gridTemplateColumns: "1fr auto", gridTemplateRows: "auto 1fr auto" }}
        >
          <div style={headerStyle} className="border border-slate-400 rounded overflow-hidden">
            <div
              className="flex flex-row overflow-hidden absolute h-full "
              style={{ left: table.gridPosition.x }}
            >
              {columns.map((column) => (
                <Table.HeaderCell
                  key={column.id}
                  column={column}
                  className="px-2 bg-slate-100 hover:bg-slate-200 relative h-full items-center flex"
                >
                  <column.HeaderCell />
                  <HeaderResizer minWidth={20} onWidthChange={onColumnResize(column.id)} />
                </Table.HeaderCell>
              ))}
            </div>
          </div>
          <div />
          <div style={tableStyle} className="border border-slate-400 rounded overflow-hidden">
            <div style={viewportStyle} ref={table.setViewportElement}>
              <div
                style={{
                  position: "absolute",
                  width: "fit-content",
                  minWidth: "100%",
                  height: "fit-content",
                  minHeight: "100%",
                  top: table.gridPosition.y,
                  left: table.gridPosition.x,
                }}
              >
                <div style={bodyStyle} ref={table.setGridElement}>
                  {table.visibleRows.map(({ record, recordIndex }) => (
                    <Table.BodyRow
                      key={recordIndex}
                      state={table}
                      row={record}
                      rowIndex={recordIndex}
                      className="outline outline-gray-300 not-last-of-type:border-b border-slate-300 items-center cursor-pointer"
                    >
                      {columns.map((column) => (
                        <Table.RowCell className="p-1 px-2" key={column.id} column={column}>
                          <column.BodyCell record={record} recordIndex={recordIndex} />
                        </Table.RowCell>
                      ))}
                    </Table.BodyRow>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Table.Scrollbar
            state={table}
            direction="vertical"
            className="w-3 h-full bg-slate-100 border border-slate-200 rounded-full hover:border-slate-300"
          >
            {({ position, size, onMouseDown }) => (
              <div
                onMouseDown={onMouseDown}
                className="absolute w-full"
                style={{ height: size, top: position }}
              >
                <div className="w-full h-full rounded-full py-1 px-0.5 group">
                  <div className="h-full bg-slate-300 w-full rounded group-hover:bg-slate-400" />
                </div>
              </div>
            )}
          </Table.Scrollbar>
          <Table.Scrollbar
            state={table}
            direction="horizontal"
            className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full hover:border-slate-300"
          >
            {({ position, size, onMouseDown }) => (
              <div
                onMouseDown={onMouseDown}
                className="absolute h-full"
                style={{ width: size, left: position }}
              >
                <div className="w-full h-full rounded-full px-1 py-0.5 group">
                  <div className="h-full bg-slate-300 w-full rounded group-hover:bg-slate-400" />
                </div>
              </div>
            )}
          </Table.Scrollbar>
        </div>
      </Resizer>
      <PagesLoadingStatus totalPages={table.totalRows} fetchingPageIndexes={fetchingPageIndexes} />
    </div>
  );
}

function HeaderResizer(props: { minWidth: number; onWidthChange: (width: number) => void }) {
  const { onMouseDown, resizing } = useDraggingGhoast(props);
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

function useDraggingGhoast(props: { minWidth: number; onWidthChange: (width: number) => void }) {
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
  return {
    onMouseDown,
    resizing,
  };
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
