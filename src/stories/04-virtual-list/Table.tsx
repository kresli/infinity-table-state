import { Column } from "./Column";
import { VirtualList } from "./VirtualList";

interface Props<Row> {
  data: Row[];
  columns: Column<Row>[];
  rowsPerPage: number;
  totalRows: number;
  onVisibleRowsChange: (range: [start: number, end: number]) => void;
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

  return (
    <div className="border border-slate-400 flex flex-col w-full rounded h-full">
      <div className="flex flex-row">{headers}</div>
      <VirtualList
        rowPixelHeight={40}
        totalRows={props.totalRows}
        buffer={5}
        onVisibleRowsChange={props.onVisibleRowsChange}
      >
        {(rowIndex) => {
          const data = props.data.at(rowIndex);
          return (
            <div
              className="flex flex-row not-last-of-type:border-b border-slate-300 items-center shrink-0"
              key={rowIndex}
              style={{ height: 40 }}
            >
              {props.columns.map((column) => {
                return (
                  <div
                    key={column.id}
                    className="flex-1 p-1 px-2"
                    style={{ width: column.width, maxWidth: column.width }}
                  >
                    {data && <column.BodyCell row={{ data, rowIndex }} />}
                  </div>
                );
              })}
            </div>
          );
        }}
      </VirtualList>
    </div>
  );
}
