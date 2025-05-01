import type { Meta, StoryObj } from "@storybook/react";
import { use, useLayoutEffect, useRef, useState } from "react";
import { useLiveRef } from "./table/hooks/use-live-ref";

const meta: Meta<typeof VirtualContainer> = {
  title: "Components/08-Scrollbar",
  component: VirtualContainer,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof VirtualContainer>;

export const Default: Story = {
  args: {
    containerHeight: 500,
    totalRows: 20,
    rowHeight: 50,
    buffer: 1,
  },
  render: (props) => <VirtualContainer {...props} />,
};

function VirtualContainer(props: {
  containerHeight: number;
  totalRows: number;
  rowHeight: number;
  buffer: number;
}) {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [contentElement, setContentElement] = useState<HTMLDivElement | null>(null);
  const [scrollbarElement, setScrollbarElement] = useState<HTMLDivElement | null>(null);

  const scroller = useScroller({
    containerElement,
    contentElement,
    scrollbarElement,
  });

  console.log(scroller.scrollbar.scrollLeft);

  return (
    <div className="fixed w-full h-full flex items-center justify-center flex-col gap-2">
      <div
        ref={setContainerElement}
        style={{ height: 100, width: 400 }}
        className="relative bg-gray-200 border"
      >
        <div
          ref={setContentElement}
          style={{ width: 800, left: scroller.container.scrollLeft }}
          className="absolute h-full bg-amber-200"
        />
      </div>
      <div
        ref={setScrollbarElement}
        style={{
          width: 128,
          height: 24,
        }}
        className="bg-gray-200 border relative"
      >
        <div
          style={{
            height: "100%",
            width: scroller.scrollbar.width,
            left: scroller.scrollbar.scrollLeft,
          }}
          className="absolute bg-blue-400 border border-blue-800 hover:bg-blue-500"
        />
      </div>
    </div>
  );
}

function projectToSize(
  point: [x: number, y: number],
  sourceSize: [width: number, height: number],
  targetSize: [width: number, height: number]
): [x: number, y: number] {
  const [sourceWidth, sourceHeight] = sourceSize;
  const [targetWidth, targetHeight] = targetSize;
  const [x, y] = point;
  const xRatio = targetWidth / sourceWidth;
  const yRatio = targetHeight / sourceHeight;
  return [x * xRatio, y * yRatio];
}

function useScroller(props: {
  containerElement: HTMLDivElement | null;
  contentElement: HTMLDivElement | null;
  scrollbarElement: HTMLDivElement | null;
}) {
  const contentElementRef = useLiveRef(props.contentElement);
  const [scrollState, setScrollState] = useState({
    container: {
      scrollTop: 0,
      scrollLeft: 0,
    },
    scrollbar: {
      scrollTop: 0,
      scrollLeft: 0,
      width: 0,
    },
  });
  // useWheel(props.containerElement, (event) => {
  //     event.preventDefault();
  //     const contentElement = contentElementRef.current;
  //     const containerElement = props.containerElement;
  //     const scrollbarElement = props.scrollbarElement;
  //     if (!contentElement || !containerElement || !scrollbarElement) return;
  //     setScrollState((prev) => {
  //       const { deltaX, deltaY } = event;
  //       const
  //     });
  //   });
  useWheel(props.containerElement, (event) => {
    event.preventDefault();

    const content = contentElementRef.current;
    const container = props.containerElement;
    const scrollbar = props.scrollbarElement;
    if (!content || !container || !scrollbar) return;

    const contentRect = content.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scrollbarRect = scrollbar.getBoundingClientRect();

    const contentToScrollbarRatio = contentRect.width / scrollbarRect.width;
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;

    setScrollState((prev) => {
      const container = calculateScrolls({
        prev: prev.container,
        deltaX,
        deltaY,
        bounds: {
          minLeft: containerRect.width - contentRect.width,
          maxLeft: 0,
          minTop: 0,
          maxTop: contentRect.height,
        },
      });

      const scrollbar = calculateScrolls({
        prev: prev.scrollbar,
        deltaX: -deltaX / contentToScrollbarRatio,
        deltaY: 0,
        bounds: {
          minLeft: 0,
          maxLeft: scrollbarRect.width - containerRect.width / contentToScrollbarRatio,
          minTop: 0,
          maxTop: 0,
        },
      });

      return {
        container,
        scrollbar: {
          ...scrollbar,
          width: containerRect.width / contentToScrollbarRatio,
        },
      };
    });
  });
  return scrollState;
}

type ScrollBounds = {
  minLeft: number;
  maxLeft: number;
  minTop: number;
  maxTop: number;
};

type ScrollInput = {
  prev: { scrollLeft: number; scrollTop: number };
  deltaX: number;
  deltaY: number;
  bounds: ScrollBounds;
};

function calculateScrolls({ prev, deltaX, deltaY, bounds }: ScrollInput) {
  const scrollLeft = clamp(prev.scrollLeft + deltaX, bounds.minLeft, bounds.maxLeft);
  const scrollTop = clamp(prev.scrollTop + deltaY, bounds.minTop, bounds.maxTop);
  return { scrollLeft, scrollTop };
}

function useWheel<T extends HTMLElement>(element: T | null, cb: (event: WheelEvent) => void) {
  const ref = useLiveRef(cb);
  useLayoutEffect(() => {
    if (!element) return;
    const onWheel = (event: WheelEvent) => ref.current(event);
    element.addEventListener("wheel", onWheel);
    return () => void element.removeEventListener("wheel", onWheel);
  }, [element, ref]);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
