import { useRef } from 'react';
import type { PointerEvent } from 'react';

export interface Point { x: number; y: number }

export function usePointerDrag(onMove: (point: Point) => void, onDrop: (point: Point) => void, onCancel: () => void) {
  const start = useRef<Point | null>(null);
  const dragging = useRef(false);
  const suppressClick = useRef(false);

  return {
    onPointerDown(event: PointerEvent<HTMLButtonElement>) {
      if (!event.isPrimary || event.button !== 0) return;
      start.current = { x: event.clientX, y: event.clientY };
      dragging.current = false;
      suppressClick.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      if (!start.current) return;
      const point = { x: event.clientX, y: event.clientY };
      if (Math.hypot(point.x - start.current.x, point.y - start.current.y) > 7) dragging.current = true;
      if (dragging.current) onMove(point);
    },
    onPointerUp(event: PointerEvent<HTMLButtonElement>) {
      if (!start.current) return;
      suppressClick.current = dragging.current;
      if (dragging.current) onDrop({ x: event.clientX, y: event.clientY });
      start.current = null;
      dragging.current = false;
    },
    onPointerCancel() {
      start.current = null;
      dragging.current = false;
      suppressClick.current = true;
      onCancel();
    },
    onClickCapture(event: React.MouseEvent<HTMLButtonElement>) {
      if (suppressClick.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }
    },
  };
}
