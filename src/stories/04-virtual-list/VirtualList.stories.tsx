import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta<typeof VirtualContainer> = {
  title: "Components/VirtualList",
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
  },
  render: VirtualContainer,
};

function VirtualContainer(props: {
  containerHeight: number;
  totalRows: number;
  rowHeight: number;
}) {
  const { containerHeight: height, totalRows, rowHeight } = props;
  const [scrollTop, setScrollTop] = useState(0);
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => setScrollTop((prev) => prev - e.deltaY);

  return (
    <div className="fixed w-full h-full flex items-center justify-center">
      <div style={{ width: 500, height }} className="outline-4 relative" onWheel={onWheel}>
        <div
          className="absolute outline-4 outline-orange-200 w-full bg-slate-50/50"
          style={{ top: scrollTop }}
        >
          <VirtualList
            scrollTop={scrollTop}
            containerHeight={height}
            totalRows={totalRows}
            rowPixelHeight={rowHeight}
          >
            {(index) => <div>Row {index}</div>}
          </VirtualList>
        </div>
      </div>
    </div>
  );
}

function VirtualList(props: {
  scrollTop: number;
  containerHeight: number;
  totalRows: number;
  rowPixelHeight: number;
  children: (index: number) => React.ReactNode;
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
          {props.children(rowIndex)}
        </div>
      ))}
    </div>
  );
}
