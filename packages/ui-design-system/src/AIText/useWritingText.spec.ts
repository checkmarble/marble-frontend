import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWritingText } from './useWritingText';

function setupAnimationFrame() {
  let time = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextId = 1;

  vi.spyOn(performance, 'now').mockImplementation(() => time);

  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = nextId++;
    callbacks.set(id, cb);
    return id;
  });

  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id);
  });

  const tick = (elapsedMs: number) => {
    time += elapsedMs;
    const pending = [...callbacks.entries()];
    callbacks.clear();
    for (const [, cb] of pending) {
      cb(time);
    }
  };

  return { tick };
}

describe('useWritingText', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should stop at the requested index', () => {
    const { tick } = setupAnimationFrame();
    const { result } = renderHook(() => useWritingText('Hello world', 10));

    act(() => tick(50));
    expect(result.current.text).toBe('Hello');

    act(() => {
      result.current.stopAt(3);
    });

    expect(result.current.text).toBe('Hel');
    expect(result.current.isTruncated).toBe(true);
    expect(result.current.isDone).toBe(true);

    act(() => tick(100));
    expect(result.current.text).toBe('Hel');
  });
});
