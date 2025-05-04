import type { Meta, StoryObj } from "@storybook/react";
import { CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { useLiveRef } from "./table/hooks/use-live-ref";
import { Projector } from "./table/utils/projector";
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
        <div>i</div>
        <ScrollbarHorizontal
          contentRect={contentRect}
          viewportRect={viewportRect}
          contentPos={contentPos}
          onContentPos={updateContentPosition}
        />
      </div>
    </div>
  );
}

function ScrollbarHorizontal(props: {
  contentRect: DOMRect;
  viewportRect: DOMRect;
  contentPos: Point;
  onContentPos: (position: Point) => void;
}) {
  const { contentRect, viewportRect } = props;
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const height = 10;

  const trackRect = useClientRect(trackRef.current);
  const thumbRect = useClientRect(thumbRef.current);

  const contentToTrack = new Projector(contentRect, trackRect);
  const trackToContent = new Projector(trackRect, contentRect);

  const thumb = contentToTrack.projectClientPositionRect(viewportRect);

  const onMouseDown = useOnDrag((downEvt) => {
    downEvt.preventDefault();
    const downEventClientX = downEvt.clientX;
    const xOffset = downEventClientX - thumbRect.x;
    return (e: MouseEvent) => {
      const x = e.clientX - xOffset;
      const y = 0;
      const position = trackToContent.projectClientPositionPoint({ x, y });
      props.onContentPos({ x: -position.x, y: position.y });
    };
  });

  const thumbStyle: CSSProperties = {
    left: thumb.x,
    top: 0,
    width: thumb.width,
    height: "100%",
  };

  return (
    <div
      ref={trackRef}
      style={{ width: "100%", height }}
      className="w-full h-4 bg-gray-200 relative"
    >
      <div
        ref={thumbRef}
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

function projectPoint(point: Point, fromRect: DOMRect, toRect: DOMRect): Point {
  if (!fromRect.width || !fromRect.height) return { x: 0, y: 0 };
  const relativeX = (point.x - fromRect.left) / fromRect.width;
  const relativeY = (point.y - fromRect.top) / fromRect.height;
  return {
    x: relativeX * toRect.width,
    y: relativeY * toRect.height,
  };
}
