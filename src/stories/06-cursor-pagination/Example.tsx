import { useRef, useState } from "react";
import { AcmeTable } from "./AcmeTable";

export function Example() {
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null);
  const deletedRowsIndexes = useRef(new Set<number>());

  const onRowHover = (id: number | string, hover: boolean) => {
    setHoveredRowId((hoveredRowId) => {
      if (hover) return id;
      if (hoveredRowId === id) return null;
      return hoveredRowId;
    });
  };

  return (
    <div className="w-full h-auto flex flex-col">
      <div className="overflow-hidden flex-row flex gap-2 ">
        <div className="flex-1 overflow-hidden">
          <AcmeTable
            onRowHover={onRowHover}
            hoveredRowId={hoveredRowId}
            deletedRowsIndexesRef={deletedRowsIndexes}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <AcmeTable
            onRowHover={onRowHover}
            hoveredRowId={hoveredRowId}
            deletedRowsIndexesRef={deletedRowsIndexes}
          />
        </div>
      </div>
    </div>
  );
}
