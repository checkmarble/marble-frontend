import type { LayoutNode, Point } from '../types';

export function centerOf(node: LayoutNode, position: Point): Point {
  return { x: position.x + node.width / 2, y: position.y + node.height / 2 };
}

export function topLeftFromCenter(center: Point, width: number, height: number): Point {
  return { x: center.x - width / 2, y: center.y - height / 2 };
}

/** Half-extent of an axis-aligned box perpendicular to angle `theta`. */
export function aabbHalfPerp(width: number, height: number, theta: number): number {
  return (width / 2) * Math.abs(Math.sin(theta)) + (height / 2) * Math.abs(Math.cos(theta));
}

/** Half-extent of an axis-aligned box along angle `theta`. */
export function aabbHalfRadial(width: number, height: number, theta: number): number {
  return (width / 2) * Math.abs(Math.cos(theta)) + (height / 2) * Math.abs(Math.sin(theta));
}
