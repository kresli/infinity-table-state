import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { VirtualListCore } from "./VirtualList";

const meta: Meta<typeof VirtualContainer> = {
  title: "Components/04-VirtualList",
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
  render: VirtualContainer,
};

function VirtualContainer(props: {
  containerHeight: number;
  totalRows: number;
  rowHeight: number;
  buffer: number;
}) {
  const { containerHeight: height, totalRows, rowHeight, buffer } = props;
  const [scrollTop, setScrollTop] = useState(0);
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => setScrollTop((prev) => prev - e.deltaY);

  return (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div style={{ width: 500, height }} className="outline-4 relative" onWheel={onWheel}>
        <div
          className="absolute outline-4 outline-orange-200 w-full bg-slate-50/50"
          style={{ top: scrollTop }}
        >
          <VirtualListCore
            scrollTop={-scrollTop}
            containerHeight={height}
            totalRows={totalRows}
            rowPixelHeight={rowHeight}
            buffer={buffer}
          >
            {(index) => <div>Row {index}</div>}
          </VirtualListCore>
        </div>
      </div>
    </div>
  );
}
