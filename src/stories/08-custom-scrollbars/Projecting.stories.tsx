import type { Meta, StoryObj } from "@storybook/react";
import { useLayoutEffect, useRef, useState } from "react";

const meta: Meta<typeof ProjectCanvas> = {
  title: "Components/08-Projecting",
  component: () => null,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ProjectCanvas>;

export const Projecting: Story = {
  render: () => <ProjectCanvas />,
};

function ProjectCanvas() {
  const [mouse, setMouse] = useState<Point>({ x: 0, y: 0 });
  const [overElement, setOverElement] = useState<HTMLElement | null>(null);

  const onOverCanvas = (isOver: boolean, element: HTMLElement) => {
    setOverElement((prev) => {
      if (!isOver && prev === element) return null;
      return isOver ? element : prev;
    });
  };

  useLayoutEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
      });
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className="fixed w-full h-full flex items-center justify-center flex-col gap-2">
      <Canvas
        sourceElement={overElement}
        mouse={mouse}
        onHoverOver={onOverCanvas}
        width={300}
        height={100}
      />
      <Canvas
        sourceElement={overElement}
        mouse={mouse}
        onHoverOver={onOverCanvas}
        width={50}
        height={100}
      />
    </div>
  );
}

function Canvas(props: {
  mouse: { x: number; y: number };
  sourceElement: HTMLElement | null;
  width: number;
  height: number;
  onHoverOver: (isOver: boolean, element: HTMLElement) => void;
}) {
  const [color] = useState(() => getRandomRgbColor());

  const divRef = useRef<HTMLDivElement>(null);

  const onHoverOver = (isOver: boolean) => () => {
    if (!divRef.current) return;
    props.onHoverOver(isOver, divRef.current);
  };

  let point: Point = { x: 0, y: 0 };

  if (divRef.current && props.sourceElement) {
    if (divRef.current === props.sourceElement) {
      point.x = props.mouse.x - divRef.current.getBoundingClientRect().left;
      point.y = props.mouse.y - divRef.current.getBoundingClientRect().top;
    } else if (props.sourceElement) {
      const sourceRect = props.sourceElement.getBoundingClientRect();
      const targetRect = divRef.current.getBoundingClientRect();
      console.log("sourceRect", {
        targetRect,
        sourceRect,
      });
      point = projectPoint(props.mouse, sourceRect, targetRect || new DOMRect());
    }
  }

  return (
    <div
      ref={divRef}
      onMouseOver={onHoverOver(true)}
      onMouseOut={onHoverOver(false)}
      style={{
        width: props.width,
        height: props.height,
      }}
      className="bg-amber-200 border relative"
    >
      <div
        style={{ left: point.x, top: point.y, width: 10, height: 10, backgroundColor: color }}
        className="absolute border border-blue-800 pointer-events-none"
      />
    </div>
  );
}

interface Point {
  x: number;
  y: number;
}

function getRandomRgbColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function projectPoint(point: Point, fromRect: DOMRect, toRect: DOMRect): Point {
  const relativeX = (point.x - fromRect.left) / fromRect.width;
  const relativeY = (point.y - fromRect.top) / fromRect.height;
  return {
    x: relativeX * toRect.width,
    y: relativeY * toRect.height,
  };
}
