/**
 * Heaviest-first greedy: each item goes in the open slot whose nearest
 * already-placed neighbors have the smallest combined weight.
 */
export function greedySlotOrder(items: Array<{ id: string; weight: number }>): string[] {
  const n = items.length;
  if (n === 0) return [];

  const slots: Array<string | null> = Array.from({ length: n }, () => null);
  const slotWeight = Array.from({ length: n }, () => 0);
  const sorted = [...items].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));

  for (const item of sorted) {
    let bestSlot = -1;
    let bestScore = Infinity;

    for (let s = 0; s < n; s++) {
      if (slots[s] !== null) continue;

      let leftW = 0;
      let leftDist = 0;
      let rightW = 0;
      let rightDist = 0;
      for (let d = 1; d < n; d++) {
        const left = (s - d + n) % n;
        if (slots[left] !== null) {
          leftW = slotWeight[left]!;
          leftDist = d;
          break;
        }
      }
      for (let d = 1; d < n; d++) {
        const right = (s + d) % n;
        if (slots[right] !== null) {
          rightW = slotWeight[right]!;
          rightDist = d;
          break;
        }
      }

      // Distance-weighted so opposite empty slots beat adjacent ones when only
      // one neighbor is placed (plain sum would tie and pick the next index).
      const score = (leftDist > 0 ? leftW / leftDist : 0) + (rightDist > 0 ? rightW / rightDist : 0);
      if (score < bestScore || (score === bestScore && (bestSlot < 0 || s < bestSlot))) {
        bestScore = score;
        bestSlot = s;
      }
    }

    slots[bestSlot] = item.id;
    slotWeight[bestSlot] = item.weight;
  }

  return slots as string[];
}

/**
 * Subtree size including `id` itself.
 *
 * `weightOf` lets a single node stand for more than one — return the member
 * count for a node representing a folded branch, so the ring reserves the room
 * its contents would have needed.
 */
export function descendantCount(children: Map<string, string[]>, id: string, weightOf: (id: string) => number): number {
  let count = weightOf(id);
  for (const child of children.get(id) ?? []) {
    count += descendantCount(children, child, weightOf);
  }
  return count;
}
