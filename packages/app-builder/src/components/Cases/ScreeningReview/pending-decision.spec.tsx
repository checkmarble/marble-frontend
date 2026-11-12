import { FormatContext } from '@app-builder/contexts/FormatContext';
import { SCREENING_REVIEW_UNDO_DELAY_MS } from '@app-builder/models/screening-review';
import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCaseWriteQueue, usePendingDecision, type WriteOptions } from './pending-decision';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A write per item that waits until the test settles it. */
function controlledWrites() {
  const started: { id: string; options: WriteOptions; resolve: () => void; reject: () => void }[] = [];
  const write = (item: { id: string }, options: WriteOptions) =>
    new Promise<string>((resolve, reject) => {
      started.push({ id: item.id, options, resolve: () => resolve(item.id), reject: () => reject(new Error(item.id)) });
    });
  const finish = (id: string) => started.find((entry) => entry.id === id)!.resolve();
  return { started, write, finish, ids: () => started.map((entry) => entry.id) };
}

describe('createCaseWriteQueue', () => {
  it('writes up to the limit of cases at once, one item at a time per case, and settles every item', async () => {
    const queue = createCaseWriteQueue(3);
    const items = ['a', 'b', 'c', 'd', 'e'].flatMap((caseId) => [
      { caseId, id: `${caseId}1` },
      { caseId, id: `${caseId}2` },
    ]);
    const running = new Set<string>();
    let maxCases = 0;
    let sameCaseOverlap = false;

    const results = await queue.run(items, async (item) => {
      if (running.has(item.caseId)) sameCaseOverlap = true;
      running.add(item.caseId);
      maxCases = Math.max(maxCases, running.size);
      await new Promise((resolve) => setTimeout(resolve, 1));
      running.delete(item.caseId);
      if (item.id === 'c2') throw new Error('network');
      return item.id;
    });

    expect(maxCases).toBe(3);
    expect(sameCaseOverlap).toBe(false);
    expect(results.size).toBe(items.length);
    expect(results.get(items[5]!)).toMatchObject({ status: 'rejected' });
    expect(results.get(items[4]!)).toEqual({ status: 'fulfilled', value: 'c1' });
  });

  it('keeps the order of a case across runs: a later single write waits for the batch before it', async () => {
    const queue = createCaseWriteQueue(3);
    const { write, finish, ids } = controlledWrites();
    const batch = queue.run(
      [
        { caseId: 'a', id: 'a1' },
        { caseId: 'a', id: 'a2' },
      ],
      write,
    );
    const single = queue.run([{ caseId: 'a', id: 'a3' }], write);
    const other = queue.run([{ caseId: 'b', id: 'b1' }], write);
    await tick();
    expect(ids()).toEqual(['a1', 'b1']);
    finish('a1');
    await tick();
    expect(ids()).toEqual(['a1', 'b1', 'a2']);
    finish('a2');
    await tick();
    expect(ids()).toEqual(['a1', 'b1', 'a2', 'a3']);
    finish('a3');
    finish('b1');
    expect((await batch).size).toBe(2);
    expect([...(await single).values()]).toEqual([{ status: 'fulfilled', value: 'a3' }]);
    expect((await other).size).toBe(1);
  });

  it('starts every queued item at once with keepalive on unload, and keeps the running ones', async () => {
    const queue = createCaseWriteQueue(1);
    const { started, write } = controlledWrites();
    void queue.run(
      [
        { caseId: 'a', id: 'a1' },
        { caseId: 'a', id: 'a2' },
        { caseId: 'b', id: 'b1' },
      ],
      write,
    );
    await tick();
    expect(started.map(({ id, options }) => [id, options.keepalive])).toEqual([['a1', false]]);
    queue.unload();
    expect(started.map(({ id, options }) => [id, options.keepalive])).toEqual([
      ['a1', false],
      ['a2', true],
      ['b1', true],
    ]);
    void queue.run([{ caseId: 'c', id: 'c1' }], write);
    expect(started.at(-1)).toMatchObject({ id: 'c1', options: { keepalive: true } });
    // Back from the back-forward cache: the queue applies its limits again.
    queue.resume();
    void queue.run([{ caseId: 'd', id: 'd1' }], write);
    await tick();
    expect(started.some(({ id }) => id === 'd1')).toBe(false);
  });
});

describe('usePendingDecision', () => {
  afterEach(() => {
    vi.useRealTimers();
    toast.remove();
  });

  function renderPendingDecision() {
    return renderHook(() => usePendingDecision({ undoLabel: 'Undo' }), {
      wrapper: ({ children }) => (
        <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>{children}</FormatContext.Provider>
      ),
    });
  }

  it('keeps flush waiting for a write that the timer already started, and stays unsaved meanwhile', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const request = Promise.withResolvers<void>();
    const write = vi.fn(async () => {
      await request.promise;
    });
    const { result } = renderPendingDecision();
    act(() => result.current.schedule({ message: 'Decided', undo: vi.fn(), write }));
    expect(result.current.hasUnsaved()).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(SCREENING_REVIEW_UNDO_DELAY_MS);
    });
    expect(write).toHaveBeenCalledTimes(1);
    expect(result.current.undoable).toBe(false);
    expect(result.current.hasUnsaved()).toBe(true);

    let flushed = false;
    const flush = result.current.flush().then(() => {
      flushed = true;
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(flushed).toBe(false);
    request.resolve();
    await act(() => flush);
    expect(flushed).toBe(true);
    expect(result.current.hasUnsaved()).toBe(false);
  });

  it('holds one undoable decision: a new one writes the previous at once, undo drops only the latest', async () => {
    const first = { message: 'First', undo: vi.fn(), write: vi.fn(() => Promise.resolve()) };
    const second = { message: 'Second', undo: vi.fn(), write: vi.fn(() => Promise.resolve()) };
    const { result } = renderPendingDecision();
    act(() => result.current.schedule(first));
    act(() => result.current.schedule(second));
    expect(first.write).toHaveBeenCalledTimes(1);
    act(() => result.current.undo());
    expect(second.undo).toHaveBeenCalledTimes(1);
    expect(second.write).not.toHaveBeenCalled();
    expect(first.undo).not.toHaveBeenCalled();
    act(() => result.current.undo());
    expect(second.undo).toHaveBeenCalledTimes(1);
  });

  it('writes the undoable decision with keepalive on pagehide, after queued items of a running batch', async () => {
    const { started, write } = controlledWrites();
    const items = ['a', 'b', 'c', 'd'].map((caseId) => ({ caseId, id: caseId }));
    const { result } = renderPendingDecision();
    act(() =>
      result.current.schedule({
        message: 'Batch',
        undo: vi.fn(),
        write: async (writeItems) => {
          await writeItems(items, write);
        },
      }),
    );
    act(() =>
      result.current.schedule({
        message: 'Single',
        undo: vi.fn(),
        write: async (writeItems) => {
          await writeItems([{ caseId: 'e', id: 'e' }], write);
        },
      }),
    );
    await act(() => tick());
    // Three cases at once: d waits in the queue.
    expect(started.map(({ id }) => id)).toEqual(['a', 'b', 'c']);
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(started.map(({ id, options }) => [id, options.keepalive])).toEqual([
      ['a', false],
      ['b', false],
      ['c', false],
      ['d', true],
      ['e', true],
    ]);
    window.dispatchEvent(new Event('pageshow'));
  });
});
