import type { Meta, StoryObj } from "@storybook/react";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { useLiveRef } from "./table/hooks/use-live-ref";

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
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);
  const [contentPos, setContentPos] = useState<Point>({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!containerElement || !contentElement) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const containerRect = containerElement.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();
      setContentPos((prev) => {
        const newX = Math.max(
          Math.min(prev.x - e.deltaX, 0),
          -contentRect.width + containerRect.width
        );
        const newY = Math.max(
          Math.min(prev.y - e.deltaY, 0),
          -contentRect.height + containerRect.height
        );
        return { x: newX, y: newY };
      });
    };
    containerElement.addEventListener("wheel", onWheel);
    return () => {
      containerElement.removeEventListener("wheel", onWheel);
    };
  }, [containerElement, contentElement]);

  return (
    <div className="fixed w-full h-full flex items-center justify-center flex-col gap-2">
      <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: "1fr auto" }}>
        <div
          ref={setContainerElement}
          style={{
            width: 500,
            height: 300,
          }}
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
          direction="vertical"
          contentElement={contentElement}
          containerElement={containerElement}
        />
        <Scrollbar
          direction="horizontal"
          contentElement={contentElement}
          containerElement={containerElement}
        />
      </div>
    </div>
  );
}

function Scrollbar(props: {
  direction: "horizontal" | "vertical";
  contentElement: HTMLElement | null;
  containerElement: HTMLDivElement | null;
}) {
  const [{ a, d }, setThumb] = useState({ a: { x: 0, y: 0 }, d: { x: 0, y: 0 } });
  const height = 10;
  const isHorizontal = props.direction === "horizontal";

  useMutationObserver(props.containerElement, () => {
    if (!props.containerElement || !props.contentElement) return;
    const contentRect = props.contentElement.getBoundingClientRect();
    const containerRect = props.containerElement.getBoundingClientRect();

    const topLeft = { x: containerRect.x, y: containerRect.y };
    const bottomRight = { x: containerRect.right, y: containerRect.bottom };

    const thumbA = projectPoint(topLeft, contentRect, containerRect);
    const thumbD = projectPoint(bottomRight, contentRect, containerRect);

    setThumb({ a: thumbA, d: thumbD });
  });

  return (
    <div
      style={{
        width: props.direction === "horizontal" ? "100%" : height,
        height: props.direction === "horizontal" ? height : "100%",
      }}
      className="w-full h-4 bg-gray-200 relative"
    >
      <div
        className="h-4 absolute bg-blue-600"
        style={{
          left: isHorizontal ? a.x : 0,
          top: isHorizontal ? 0 : a.y,
          width: isHorizontal ? d.x - a.x : "100%",
          height: isHorizontal ? "100%" : d.y - a.y,
        }}
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
