import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Spinner } from "./Spinner";
import { ButtonIcon } from "./ButtonIcon";
import { Select } from "./Select";

export function PaginationControls(props: {
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  totalRows: number;
  firstFetching: boolean;
  setRowsPerPage: (value: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}) {
  const {
    currentPage,
    totalPages,
    totalRows,
    firstFetching,
    nextPage,
    prevPage,
    rowsPerPage,
    setRowsPerPage,
  } = props;
  const arrowLeftIcon = <IconArrowLeft />;
  const arrowRightIcon = <IconArrowRight />;

  return (
    <div className="flex flex-row items-center gap-2">
      <ButtonIcon icon={arrowLeftIcon} onClick={prevPage} />
      <div>
        {currentPage + 1} / {totalPages} ({totalRows} rows)
      </div>
      <ButtonIcon icon={arrowRightIcon} onClick={nextPage} />
      <Select value={rowsPerPage} options={[5, 10]} onChange={setRowsPerPage} />
      {firstFetching && <Spinner />}
    </div>
  );
}
