import { createRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

import { mergeRefs } from './form';

function render(element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);

  flushSync(() => root.render(element));

  return {
    container,
    unmount: () => flushSync(() => root.unmount()),
  };
}

describe('mergeRefs', () => {
  it('invokes callback-ref cleanups on unmount and delivers null to callbacks without cleanups', () => {
    const objectRef = createRef<HTMLDivElement>();
    const cleanup = vi.fn();
    const callbackWithCleanup = vi.fn((_node: HTMLDivElement | null) => cleanup);
    const callbackWithoutCleanup = vi.fn<(node: HTMLDivElement | null) => void>();

    const { container, unmount } = render(
      <div ref={mergeRefs([objectRef, callbackWithCleanup, callbackWithoutCleanup])} />,
    );

    const node = container.firstElementChild;
    expect(objectRef.current).toBe(node);
    expect(callbackWithCleanup).toHaveBeenCalledTimes(1);
    expect(callbackWithCleanup).toHaveBeenCalledWith(node);
    expect(callbackWithoutCleanup).toHaveBeenCalledTimes(1);
    expect(callbackWithoutCleanup).toHaveBeenCalledWith(node);
    expect(cleanup).not.toHaveBeenCalled();

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(objectRef.current).toBeNull();
    expect(callbackWithCleanup).toHaveBeenCalledTimes(1);
    expect(callbackWithoutCleanup).toHaveBeenCalledTimes(2);
    expect(callbackWithoutCleanup).toHaveBeenLastCalledWith(null);
  });
});
