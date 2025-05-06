import { CSSProperties, useRef, useState } from "react";
import { useClientRect } from "../hooks/useClientRect";
import { ScrollProjector } from "../utils/projector";
import { useOnDrag } from "../hooks/use-on-drag";
import { UseTable } from "../hooks/use-table";
import { useMutationObserver } from "../hooks/use-mutation-observer";

interface ScrollbarProps<Row> extends React.HTMLProps<HTMLDivElement> {
  state: UseTable<Row>;
  direction: "horizontal" | "vertical";
}

export function Scrollbar<Row>(props: ScrollbarProps<Row>) {
  const { viewportElement, gridElement: contentElement } = props.state;
  const [contentRect, setContentRect] = useState<DOMRect>(() => new DOMRect());
  const [viewportRect, setViewportRect] = useState<DOMRect>(() => new DOMRect());

  useMutationObserver(viewportElement, () => {
    if (!viewportElement || !contentElement) return;
    const contentRect = contentElement.getBoundingClientRect();
    const viewportRect = viewportElement.getBoundingClientRect();
    setContentRect(contentRect);
    setViewportRect(viewportRect);
  });

  const onScrollChange = (value: number) => {
    const isHorizontal = props.direction === "horizontal";
    const prevValue = props.state.gridPosition;
    const updatedValue = {
      x: isHorizontal ? value : prevValue.x,
      y: isHorizontal ? prevValue.y : value,
    };
    props.state.setGridPosition(updatedValue);
  };

  return (
    <ScrollbarInner
      contentRect={contentRect}
      onScrollChange={onScrollChange}
      thumbMinSize={20}
      viewportRect={viewportRect}
      {...props}
    />
  );
}

function ScrollbarInner(props: {
  contentRect: DOMRect;
  viewportRect: DOMRect;
  thumbMinSize: number;
  direction: "horizontal" | "vertical";
  onScrollChange: (value: number) => void;
}) {
  const { contentRect, viewportRect, thumbMinSize, onScrollChange } = props;
  const isHorizontal = props.direction === "horizontal";
  const trackRef = useRef<HTMLDivElement>(null);
  const height = 10;

  const trackRect = useClientRect(trackRef.current);

  const proj = new ScrollProjector({
    contentSize: isHorizontal ? contentRect.width : contentRect.height,
    trackSize: isHorizontal ? trackRect.width : trackRect.height,
    viewportSize: isHorizontal ? viewportRect.width : viewportRect.height,
    thumbMinSize,
  });

  const contentStart = isHorizontal ? contentRect.x : contentRect.y;
  const viewportStart = isHorizontal ? viewportRect.x : viewportRect.y;

  const scrollOffset = viewportStart - contentStart;
  const thumbPosition = proj.contentToTrack(scrollOffset);
  const thumbSize = proj.getThumbSize();

  const onMouseDown = useOnDrag((downEvt) => {
    downEvt.preventDefault();
    const initialClientPosition = isHorizontal ? downEvt.clientX : downEvt.clientY;
    const initialThumbPosition = thumbPosition;

    return (moveEvt: MouseEvent) => {
      moveEvt.preventDefault();
      const clientPosition = isHorizontal ? moveEvt.clientX : moveEvt.clientY;
      const delta = clientPosition - initialClientPosition;
      const trackSize = isHorizontal ? trackRect.width : trackRect.height;
      const trackPos = Math.min(Math.max(initialThumbPosition + delta, 0), trackSize - thumbSize);
      const newScrollOffset = proj.trackToContent(trackPos);
      onScrollChange(-newScrollOffset);
    };
  });

  const thumbStyle: CSSProperties = {
    left: isHorizontal ? thumbPosition : 0,
    top: isHorizontal ? 0 : thumbPosition,
    width: isHorizontal ? thumbSize : "100%",
    height: isHorizontal ? "100%" : thumbSize,
  };

  const trackStyle: CSSProperties = {
    width: isHorizontal ? "100%" : height,
    height: isHorizontal ? height : "100%",
  };

  return (
    <div ref={trackRef} style={trackStyle} className="w-full h-4 bg-gray-200 relative">
      <div
        onMouseDown={onMouseDown}
        className="h-4 absolute bg-blue-600 hover:bg-blue-700"
        style={thumbStyle}
      />
    </div>
  );
}
