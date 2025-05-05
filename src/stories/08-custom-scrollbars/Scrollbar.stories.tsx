import type { Meta, StoryObj } from "@storybook/react";
import { CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { useLiveRef } from "./table/hooks/use-live-ref";
import { ScrollProjector } from "./table/utils/projector";
import { useClientRect } from "./table/hooks/useClientRect";
import { useOnDrag } from "./table/hooks/use-on-drag";
import { clamp } from "./table/utils/clamp";
import { useWheel } from "./table/hooks/use-wheel";

const meta: Meta<typeof ProjectCanvas> = {
  title: "Components/08-Scrollbar",
  component: ProjectCanvas,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ProjectCanvas>;

export const ScrollbarExmaple: Story = {
  render: () => <ProjectCanvas />,
};

function ProjectCanvas() {
  const [viewportElement, setViewportElement] = useState<HTMLDivElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);
  const [contentPos, setContentPos] = useState<Point>({ x: 0, y: 0 });
  const [contentRect, setContentRect] = useState<DOMRect>(() => new DOMRect());
  const [viewportRect, setViewportRect] = useState<DOMRect>(() => new DOMRect());

  const updateContentPosition = (point: Point) => {
    const x = clamp(point.x, -contentRect.width + viewportRect.width, 0);
    const y = clamp(point.y, -contentRect.height + viewportRect.height, 0);
    setContentPos({ x, y });
  };

  useMutationObserver(viewportElement, () => {
    if (!viewportElement || !contentElement) return;
    const contentRect = contentElement.getBoundingClientRect();
    const viewportRect = viewportElement.getBoundingClientRect();
    setContentRect(contentRect);
    setViewportRect(viewportRect);
  });

  useWheel(viewportElement, (e) => {
    if (!viewportElement || !contentElement) return;
    e.preventDefault();
    updateContentPosition({
      x: contentPos.x - e.deltaX,
      y: contentPos.y - e.deltaY,
    });
  });

  const viewportStyle: CSSProperties = {
    width: 500,
    height: 300,
  };

  return (
    <div className="fixed w-full h-full flex items-center justify-center flex-col gap-2">
      <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: "1fr auto" }}>
        <div
          ref={setViewportElement}
          style={viewportStyle}
          className="bg-amber-200 border relative overflow-clip"
        >
          <div className="absolute" style={{ left: contentPos.x, top: contentPos.y }}>
            <div
              ref={setContentElement}
              style={{ width: 1000, height: 600 }}
              className="grid grid-cols-10"
            >
              {Array.from({ length: 100 }).map((_, index) => (
                <div
                  className="border border-black/20 flex justify-center items-center"
                  key={index}
                >
                  {index}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Scrollbar
          contentRect={contentRect}
          viewportRect={viewportRect}
          onScrollChange={(y) => updateContentPosition({ x: contentPos.x, y })}
          thumbMinSize={200}
          direction="vertical"
        />
        <Scrollbar
          contentRect={contentRect}
          viewportRect={viewportRect}
          onScrollChange={(x) => updateContentPosition({ x, y: contentPos.y })}
          thumbMinSize={10}
          direction="horizontal"
        />
      </div>
    </div>
  );
}

function Scrollbar(props: {
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

function useMutationObserver(element: HTMLElement | null, callback: () => void) {
  const callbackRef = useLiveRef(callback);
  useLayoutEffect(() => {
    if (!element) return;
    const observer = new MutationObserver(() => callbackRef.current());
    observer.observe(element, { attributes: true, childList: true, subtree: true });
    callbackRef.current();
    return () => observer.disconnect();
  }, [callbackRef, element]);
}

interface Point {
  x: number;
  y: number;
}
