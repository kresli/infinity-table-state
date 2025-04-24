import clsx from "clsx";

export function PagesLoadingStatus(props: {
  totalPages: number;
  fetchingPageIndexes: Set<number>;
}) {
  return (
    <div className="flex flex-row gap-2 border border-slate-400 rounded p-2 overflow-hidden">
      <div className="text-nowrap">fetching page</div>
      {Array.from({ length: props.totalPages }).map((_, pageIndex) => (
        <div
          key={pageIndex}
          className={clsx(
            props.fetchingPageIndexes.has(pageIndex) && "text-slate-600",
            !props.fetchingPageIndexes.has(pageIndex) && "text-slate-200"
          )}
        >
          {pageIndex + 1}
        </div>
      ))}
    </div>
  );
}
