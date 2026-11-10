import { describe, expect, it } from 'vitest';
import { runByCase } from './pending-decision';

describe('runByCase', () => {
  it('writes up to the limit of cases at once, one item at a time per case, and settles every item', async () => {
    const items = ['a', 'b', 'c', 'd', 'e'].flatMap((caseId) => [
      { caseId, id: `${caseId}1` },
      { caseId, id: `${caseId}2` },
    ]);
    const running = new Set<string>();
    let maxCases = 0;
    let sameCaseOverlap = false;

    const results = await runByCase(
      items,
      async (item) => {
        if (running.has(item.caseId)) sameCaseOverlap = true;
        running.add(item.caseId);
        maxCases = Math.max(maxCases, running.size);
        await new Promise((resolve) => setTimeout(resolve, 1));
        running.delete(item.caseId);
        if (item.id === 'c2') throw new Error('network');
        return item.id;
      },
      3,
    );

    expect(maxCases).toBe(3);
    expect(sameCaseOverlap).toBe(false);
    expect(results.size).toBe(items.length);
    expect(results.get(items[5]!)).toMatchObject({ status: 'rejected' });
    expect(results.get(items[4]!)).toEqual({ status: 'fulfilled', value: 'c1' });
  });
});
