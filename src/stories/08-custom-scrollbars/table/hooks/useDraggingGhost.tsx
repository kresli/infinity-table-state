import { useState, useRef } from "react";

export function useDraggingGhost(props: {}) {
  const [resizing, setResizing] = useState(false);
  const ghostRef = useRef<Ghost>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = e.currentTarget.parentElement?.clientWidth || 0;
    let newWidth = startWidth;
    ghostRef.current = createGhost();
    const onMouseMove = (e: MouseEvent) => {
      const width = Math.max(startWidth + e.clientX - startX, props.minWidth);
      newWidth = width;
      props.onWidthChange(width);
      setResizing(true);
      ghostRef.current!.moveTo(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      props.onWidthChange(newWidth);
      setResizing(false);
      ghostRef.current?.remove();
      ghostRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  return {
    onMouseDown,
    resizing,
  };
}
interface Ghost {
  remove: () => void;
  moveTo: (x: number, y: number) => void;
}
function createGhost() {
  const width = 1000;
  const height = 1000;
  const ghost = document.createElement("div");
  ghost.style.position = "fixed";
  ghost.style.zIndex = "9999";
  // ghost.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  ghost.style.width = "1000px";
  ghost.style.height = "1000px";
  document.body.appendChild(ghost);
  return {
    remove: () => {
      document.body.removeChild(ghost);
    },
    // who knows what will happen if on overflow scroll
    moveTo: (x: number, y: number) => {
      ghost.style.left = `${x - width / 2}px`;
      ghost.style.top = `${y - height / 2}px`;
    },
  };
}
