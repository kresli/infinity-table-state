import { useLayoutEffect, useRef } from "react";
import { Column } from "./Column";
import { VirtualList, VirtualListCore } from "./VirtualList";

interface Props<Row> {
  data: Row[];
  columns: Column<Row>[];
  rowsPerPage: number;
  fetchingNextPage: boolean;
  totalRows: number;
  getRowId: (row: Row) => string;
  onNextPageRequest: () => void;
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

  // const rows = props.data.map((row) => {
  //   return (
  //     <div
  //       className="flex flex-row not-last-of-type:border-b border-slate-300 items-center shrink-0"
  //       key={props.getRowId(row)}
  //       style={{ height: 40 }}
  //     >
  //       {props.columns.map((column) => {
  //         return (
  //           <div
  //             key={column.id}
  //             className="flex-1 p-1 px-2"
  //             style={{ width: column.width, maxWidth: column.width }}
  //           >
  //             {row && <column.BodyCell row={row} />}
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // });

  return (
    <div className="border border-slate-400 flex flex-col w-full rounded h-full">
      <div className="flex flex-row">{headers}</div>
      <div className="flex flex-col overflow-y-scroll flex-1">
        <VirtualList rowPixelHeight={40} totalRows={props.totalRows}>
          {(index) => <div>row {index}</div>}
        </VirtualList>
        {/* {props.fetchingNextPage && <div className="p-2 flex justify-center">Loading...</div>} */}

        {/* {!props.fetchingNextPage && (
          <RequestPageInterceptor onIntersect={props.onNextPageRequest} />
        )} */}
      </div>
    </div>
  );
}

function RequestPageInterceptor(props: { onIntersect: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onIntersect = useRef(props.onIntersect);
  onIntersect.current = props.onIntersect;

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (isIntersecting) onIntersect.current();
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    observer.observe(ref.current!);
    return () => observer.disconnect();
  });

  return (
    <div ref={ref} className="p-2 flex justify-center">
      load rows
    </div>
  );
}
