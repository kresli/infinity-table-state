import { ReactNode, CSSProperties } from "react";

export function VirtualRow(props: {
  index: number;
  rowPixelHeight: number;
  children: (index: number) => ReactNode;
}) {
  const style: CSSProperties = {
    gridRowStart: props.index + 1, // gridRowStart is 1-based index
    minHeight: props.rowPixelHeight,
    maxHeight: props.rowPixelHeight,
    height: props.rowPixelHeight,
  };
  return (
    <div className="outline outline-gray-300 bg-green-200/20" style={style}>
      {props.children(props.index)}
    </div>
  );
}
