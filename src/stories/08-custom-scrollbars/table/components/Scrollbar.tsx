import { CSSProperties, useRef, useState } from "react";
import { useClientRect } from "../hooks/useClientRect";
import { ScrollProjector } from "../utils/projector";
import { useOnDrag } from "../hooks/use-on-drag";
import { UseTable } from "../hooks/use-table";
import { useMutationObserver } from "../hooks/use-mutation-observer";
import { DivProps } from "../types/DivProps";

type OnMouseDown = (e: React.MouseEvent) => void;

type ScrollbarChildrenProps = (props: {
  position: number;
  size: number;
  onMouseDown: OnMouseDown;
}) => React.ReactNode;

interface ScrollbarProps<Row> extends Omit<DivProps, "children"> {
  state: UseTable<Row>;
  direction: "horizontal" | "vertical";
  children: ScrollbarChildrenProps;
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
  style?: CSSProperties;
  className?: string;
  children: ScrollbarChildrenProps;
  onScrollChange: (value: number) => void;
}) {
  const { contentRect, viewportRect, thumbMinSize, onScrollChange } = props;
  const isHorizontal = props.direction === "horizontal";
  const trackRef = useRef<HTMLDivElement>(null);

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

  // const draggingGhost = useDraggingGhost({
  //   minWidth: 100,
  //   onWidthChange,
  // });

  const onMouseDown = useOnDrag((downEvt) => {
    downEvt.preventDefault();
    downEvt.stopPropagation();
    const initialClientPosition = isHorizontal ? downEvt.clientX : downEvt.clientY;
    const initialThumbPosition = thumbPosition;

    return (moveEvt) => {
      moveEvt.preventDefault();
      const clientPosition = isHorizontal ? moveEvt.clientX : moveEvt.clientY;
      const delta = clientPosition - initialClientPosition;
      const trackSize = isHorizontal ? trackRect.width : trackRect.height;
      const trackPos = Math.min(Math.max(initialThumbPosition + delta, 0), trackSize - thumbSize);
      const newScrollOffset = proj.trackToContent(trackPos);
      onScrollChange(-newScrollOffset);
    };
  });

  const onTrackMouseDown = useOnDrag((downEvt) => {
    downEvt.preventDefault();
    const onUpdate = (evt: MouseEvent | React.MouseEvent) => {
      evt.preventDefault();
      const clientPosition = isHorizontal ? evt.clientX : evt.clientY;
      const viewportOffset = isHorizontal ? viewportRect.x : viewportRect.y;
      const newScrollOffset = proj.trackToContent(clientPosition - viewportOffset - thumbSize / 2);
      onScrollChange(-newScrollOffset);
    };
    onUpdate(downEvt);
    return (moveEvt) => onUpdate(moveEvt);
  });

  const trackStyle: CSSProperties = {
    position: "relative",
    ...props.style,
  };

  return (
    <div
      ref={trackRef}
      style={trackStyle}
      className={props.className}
      onMouseDown={onTrackMouseDown}
    >
      {props.children({
        position: thumbPosition,
        size: thumbSize,
        onMouseDown,
      })}
    </div>
  );
}
