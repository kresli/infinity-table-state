import { CSSProperties, useLayoutEffect } from "react";
import { DivProps } from "../types/DivProps";
import { UseTable } from "../hooks/use-table";

interface ViewportProps<Row> extends DivProps {
  state: UseTable<Row>;
}

export function Viewport<Row>(props: ViewportProps<Row>) {
  const positionStyle: CSSProperties = {
    position: "absolute",
    height: "fit-content",
    width: "fit-content",
    minWidth: "100%",
    minHeight: "100%",
    // top: props.state.viewportPosition.y,
    // left: props.state.viewportPosition.x,
  };
  const rootStyle: CSSProperties = {
    height: "100%",
    overflow: "hidden",
    width: "100%",
    position: "relative",
  };
  // useLayoutEffect(() => {
  //   if (!props.state.viewportElement) return;
  //   const { x, y } = props.state.viewportPosition;
  //   props.state.viewportElement.scrollTop = y;
  //   props.state.viewportElement.scrollLeft = x;
  // }, [props.state.viewportElement, props.state.viewportPosition]);
  return (
    <div style={rootStyle} ref={props.state.setViewportElement}>
      <div style={positionStyle}>{props.children}</div>
    </div>
  );
}
