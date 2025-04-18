import { Column } from "./Column";

interface Props<Row> {
  data: Row[];
  columns: Column<Row>[];
  rowsPerPage: number;
}

export function Table<Row>(props: Props<Row>) {
  const headers = props.columns.map((column) => {
    return (
      <div
        key={column.id}
        className="flex-1 border-b border-slate-400 py-1 px-2 bg-slate-100 rounded-t"
        style={{ width: column.width, maxWidth: column.width }}
      >
        <column.HeaderCell />
      </div>
    );
  });

  const rows = Array.from({ length: props.rowsPerPage }).map((_, index) => {
    const row = props.data.at(index);
    return (
      <div
        className="flex flex-row not-last-of-type:border-b border-slate-300 items-center"
        key={index}
        style={{ height: 40 }}
      >
        {props.columns.map((column) => {
          return (
            <div
              key={column.id}
              className="flex-1 p-1 px-2"
              style={{ width: column.width, maxWidth: column.width }}
            >
              {row && <column.BodyCell row={row} />}
            </div>
          );
        })}
      </div>
    );
  });

  return (
    <div className="border border-slate-400 flex flex-col w-full rounded">
      <div className="flex flex-row">{headers}</div>
      <div className="flex flex-col">{rows}</div>
    </div>
  );
}
