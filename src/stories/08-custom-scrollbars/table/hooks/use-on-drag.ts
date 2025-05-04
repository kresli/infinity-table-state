import { useLiveRef } from "./use-live-ref";

type OnMouseMove = (event: MouseEvent) => void;

type OnMouseDown = (event: React.MouseEvent) => OnMouseMove;

export function useOnDrag(onDragStart: OnMouseDown) {
  const onDragStartRef = useLiveRef(onDragStart);
  const onMouseDown = (downEvent: React.MouseEvent) => {
    const mouseMoveCallback = onDragStartRef.current(downEvent);
    const onMouseMove = (moveEvent: MouseEvent) => mouseMoveCallback(moveEvent);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  return onMouseDown;
}
