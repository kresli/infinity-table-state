import { columns } from "./columns";
import { Table } from "./Table";
import { useEffect, useState } from "react";
import { PaginationControls } from "./PaginationControls";
import { fetchData } from "./fetchData";
import { Row } from "./Row";

export interface PaginatorData<Row> {
  index: number;
  pageSize: number;
  totalRecords: number;
  records: Row[];
}

export function Example() {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<Row[][]>([]);

  useEffect(() => {
    fetchData(currentPage, rowsPerPage).then((data) => {
      setTotalRows(data.totalRecords);
      setPages((prev) => {
        const newPages = [...prev];
        newPages[currentPage] = data.records;
        return newPages;
      });
    });
  }, [currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const onPageChange = (change: number) =>
    setCurrentPage((v) => {
      const newPage = v + change;
      return Math.max(0, Math.min(newPage, totalPages - 1));
    });

  const nextPage = () => onPageChange(1);
  const prevPage = () => onPageChange(-1);
  const currentPageRows = pages[currentPage] || [];
  const firstFetching = !currentPageRows.length;

  return (
    <div className="flex flex-col gap-2">
      <Table data={currentPageRows} columns={columns} rowsPerPage={rowsPerPage} />
      <PaginationControls
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalRows}
        firstFetching={firstFetching}
        nextPage={nextPage}
        prevPage={prevPage}
      />
    </div>
  );
}
