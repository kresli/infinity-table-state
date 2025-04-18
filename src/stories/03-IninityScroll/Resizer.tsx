import clsx from "clsx";
import { PropsWithChildren, useState } from "react";

export function Resizer(props: PropsWithChildren) {
  const minHeight = 100;
  const [height, setHeight] = useState(minHeight);
  const [active, setActive] = useState(false);
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(true);
    const startY = e.clientY;
    const startHeight = height;
    const mouseMove = (e: MouseEvent) => {
      const newHeight = startHeight + e.clientY - startY;
      setHeight(Math.max(minHeight, newHeight));
    };
    const mouseUp = () => {
      setActive(false);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
    };
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
  };
  return (
    <div className="flex flex-col gap-2 ">
      <div className="overflow-hidden" style={{ height, minHeight: height, maxHeight: height }}>
        {props.children}
      </div>
      <div
        className={clsx(
          "h-2 bg-gray-200 hover:bg-gray-400 cursor-row-resize rounded shrink-0",
          active && "bg-gray-400"
        )}
        onMouseDown={onMouseDown}
      />
    </div>
  );
}
