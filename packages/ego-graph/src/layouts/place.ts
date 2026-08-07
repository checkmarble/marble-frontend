import type { LayoutNode, Point } from '../types';

/** Translate a locally-laid-out subtree so `rootId`'s center lands on `targetCenter`. */
export function placeSubtreeAt(
  subtreeIds: string[],
  localPositions: Map<string, Point>,
  nodesById: Map<string, LayoutNode>,
  rootId: string,
  targetCenter: Point,
  positionById: Map<string, Point>,
): void {
  const localRoot = localPositions.get(rootId);
  const rootNode = nodesById.get(rootId);
  if (!localRoot || !rootNode) return;

  const localRootCenter = {
    x: localRoot.x + rootNode.width / 2,
    y: localRoot.y + rootNode.height / 2,
  };
  const dx = targetCenter.x - localRootCenter.x;
  const dy = targetCenter.y - localRootCenter.y;

  for (const nodeId of subtreeIds) {
    const local = localPositions.get(nodeId);
    if (!local) continue;
    positionById.set(nodeId, { x: local.x + dx, y: local.y + dy });
  }
}
