/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { columns } from "./columns";
import { Table } from "./Table";
import { EffectCallback, useEffect, useState } from "react";
import { fetchData } from "./fetchData";
import { Row } from "./Row";
import { Resizer } from "./Resizer";

export interface PaginatorData<Row> {
  index: number;
  pageSize: number;
  totalRecords: number;
  records: Row[];
}

function getRowId(row: Row) {
  return row.id;
}

export function Example() {
  const rowsPerPage = 10;

  const [pages, setPages] = useState<Row[][]>([]);
  const [fetchingPageIndex, setFetchingPageIndex] = useState(-1);

  const data = pages.flat();

  const fetchNextPage = async () => {
    const currentPageIndex = pages.length - 1;
    const nextPageIndex = currentPageIndex + 1;
    setFetchingPageIndex((prev) => Math.max(prev, nextPageIndex));
    const data = await fetchData(nextPageIndex, rowsPerPage);
    setPages((prev) => {
      const newPages = [...prev];
      newPages[nextPageIndex] = data.records;
      return newPages;
    });
  };

  useOnMount(() => void fetchNextPage());

  const fetchingNextPage = fetchingPageIndex === pages.length;

  return (
    <div className="flex flex-col gap-2">
      <Resizer>
        <Table
          data={data}
          columns={columns}
          rowsPerPage={rowsPerPage}
          onNextPageRequest={fetchNextPage}
          fetchingNextPage={fetchingNextPage}
          getRowId={getRowId}
        />
      </Resizer>
    </div>
  );
}

function useOnMount<T extends EffectCallback>(fn: T) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, []);
}
