import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

function VirtualList() {
  return <div></div>;
}

const meta: Meta<typeof VirtualList> = {
  title: "Components/VirtualList",
  component: VirtualList,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof VirtualList>;

// Basic example
export const Default: Story = {
  args: {},
  render: VirtualContainer,
};

// Example with custom styling
export const CustomStyling: Story = {
  args: {
    ...Default.args,
    className: "custom-virtual-list",
    itemClassName: "custom-item",
  },
};

function VirtualContainer() {
  const [scrollTop, setScrollTop] = useState(0);
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => setScrollTop((prev) => prev - e.deltaY);
  const height = 500;
  const totalRows = 20;
  const rowHeight = 50;

  return (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div style={{ width: 500, height }} className="outline-4 relative" onWheel={onWheel}>
        <div
          className="absolute outline-4 outline-orange-200 w-full bg-slate-50/50"
          style={{ top: scrollTop }}
        >
          <List
            scrollTop={scrollTop}
            containerHeight={height}
            totalRows={totalRows}
            rowPixelHeight={rowHeight}
          />
        </div>
      </div>
    </div>
  );
}

function List(props: {
  scrollTop: number;
  containerHeight: number;
  totalRows: number;
  rowPixelHeight: number;
}) {
  const { totalRows, rowPixelHeight, containerHeight, scrollTop } = props;
  const absouluteFirstVisibleRowIndex = Math.floor(-scrollTop / rowPixelHeight);

  const firstVisibleRowIndex = Math.max(0, absouluteFirstVisibleRowIndex);
  const lastVisibleRowIndex = Math.min(
    totalRows - 1,
    absouluteFirstVisibleRowIndex + Math.ceil(containerHeight / rowPixelHeight)
  );

  const visibleRowsCount = lastVisibleRowIndex - firstVisibleRowIndex + 1;

  const renderedRows = Array.from(
    { length: visibleRowsCount },
    (_, index) => index + firstVisibleRowIndex
  );

  console.log(totalRows);

  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))`,
        minHeight: totalRows * rowPixelHeight,
      }}
    >
      {renderedRows.map((rowIndex) => (
        <div
          key={rowIndex}
          className="outline outline-gray-300 bg-green-200/20"
          style={{
            gridRowStart: rowIndex + 1, // gridRowStart is 1-based index
            minHeight: rowPixelHeight,
            maxHeight: rowPixelHeight,
            height: rowPixelHeight,
          }}
        >
          Row {rowIndex}
        </div>
      ))}
    </div>
  );
}
