import { Projector } from "./projector";

test("projector instance", () => {
  const rect = new DOMRect();
  const projector = new Projector(rect, rect);
  expect(projector).toBeInstanceOf(Projector);
});

test("projectClientPositionRect", () => {
  const rect = new DOMRect(10, 10, 20, 20);
  const sourceRect = new DOMRect(0, 0, 100, 100);
  const targetRect = new DOMRect(0, 0, 200, 200);
  const projector = new Projector(sourceRect, targetRect);
  const projectedRect = projector.clientPositionLocal(rect);
  expect(projectedRect).toEqual({
    x: 20,
    y: 20,
    width: 40,
    height: 40,
    left: 20,
    top: 20,
    right: 60,
    bottom: 60,
  });
});

test("projectClientPositionRect with stretch", () => {
  const rect = new DOMRect(10, 10, 20, 20);
  const sourceRect = new DOMRect(0, 0, 100, 100);
  const targetRect = new DOMRect(0, 0, 300, 200);
  const projector = new Projector(sourceRect, targetRect);
  const projectedRect = projector.clientPositionLocal(rect);
  expect(projectedRect).toEqual({
    x: 30,
    y: 20,
    width: 60,
    height: 40,
    left: 30,
    top: 20,
    right: 90,
    bottom: 60,
  });
});

test("projectClientPositionRect with offset", () => {
  const rect = new DOMRect(10, 10, 20, 20);
  const sourceRect = new DOMRect(0, 0, 100, 100);
  const targetRect = new DOMRect(10, 10, 200, 200);
  const projector = new Projector(sourceRect, targetRect);
  const projectedRect = projector.clientPositionLocal(rect);
  expect(projectedRect).toEqual({
    x: 20,
    y: 20,
    width: 40,
    height: 40,
    left: 20,
    top: 20,
    right: 60,
    bottom: 60,
  });
});

test("both source and target offset are same", () => {
  const rect = new DOMRect(10, 10, 20, 20);
  const sourceRect = new DOMRect(10, 10, 100, 100);
  const targetRect = new DOMRect(10, 10, 200, 200);
  const projector = new Projector(sourceRect, targetRect);
  const projectedRect = projector.clientPositionLocal(rect);
  expect(projectedRect).toEqual({
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    left: 0,
    top: 0,
    right: 40,
    bottom: 40,
  });
});

test("substract", () => {
  const rect = new DOMRect(10, 10, 20, 20);
  const sourceRect = new DOMRect(0, 0, 100, 100);
  const targetRect = new DOMRect(0, 0, 200, 200);
  const projector = new Projector(sourceRect, targetRect);
  const projectedRect = projector.clientPositionLocal(rect);
  expect(projectedRect).toEqual({
    x: 20,
    y: 20,
    width: 40,
    height: 40,
    left: 20,
    top: 20,
    right: 60,
    bottom: 60,
  });
});

// test("projectClientPositionX", () => {
//   const sourceRect = new DOMRect(100, 0, 100, 100);
//   const targetRect = new DOMRect(100, 0, 200, 200);
//   const projector = new Projector(sourceRect, targetRect);
//   const projectedX = projector.projectClientPositionX(110);
//   expect(projectedX).toBe(20);
// });
