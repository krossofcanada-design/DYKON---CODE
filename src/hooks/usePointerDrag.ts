/* Tracks pointer gestures and separates dragging from ordinary clicks. */

import { useRef } from 'react';
import type { PointerEvent } from 'react';

export interface Point {
  x: number;
  y: number;
}

export function usePointerDrag(
  onMove: (point: Point) => void,
  onDrop: (point: Point) => void,
  onCancel: () => void
) {
  const start = useRef<Point | null>(null);
  const dragging = useRef(false);
  const suppressClick = useRef(false);

  return {
    /* Captures the pointer and records where a possible drag starts. */
    onPointerDown(event: PointerEvent<HTMLButtonElement>) {
      if (!event.isPrimary || event.button !== 0) return;
      start.current = { x: event.clientX, y: event.clientY };
      dragging.current = false;
      suppressClick.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    /* Starts dragging after the movement threshold and reports the pointer position. */
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      if (!start.current) return;
      const point = { x: event.clientX, y: event.clientY };
      if (Math.hypot(point.x - start.current.x, point.y - start.current.y) > 7)
        dragging.current = true;
      if (dragging.current) onMove(point);
    },
    /* Drops a dragged item and resets the pointer tracking. */
    onPointerUp(event: PointerEvent<HTMLButtonElement>) {
      if (!start.current) return;
      suppressClick.current = dragging.current;
      if (dragging.current) onDrop({ x: event.clientX, y: event.clientY });
      start.current = null;
      dragging.current = false;
    },
    /* Clears an interrupted drag and notifies the caller. */
    onPointerCancel() {
      start.current = null;
      dragging.current = false;
      suppressClick.current = true;
      onCancel();
    },
    /* Prevents a completed drag from also triggering a click. */
    onClickCapture(event: React.MouseEvent<HTMLButtonElement>) {
      if (suppressClick.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
      }
    },
  };
}
