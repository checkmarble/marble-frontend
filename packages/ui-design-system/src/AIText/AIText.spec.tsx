import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AIText } from './AIText';

function getTypingElement() {
  return document.querySelector('.whitespace-pre-wrap');
}

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

function mockLineClampOverflow(overflowAfterLength: number) {
  const clampElement = document.querySelector('.p-sm > div');
  if (!clampElement) return;

  Object.defineProperty(clampElement, 'scrollHeight', {
    configurable: true,
    get() {
      const typingElement = clampElement.querySelector('.whitespace-pre-wrap');
      const length = typingElement?.textContent?.length ?? 0;
      return length > overflowAfterLength ? 100 : 40;
    },
  });
  Object.defineProperty(clampElement, 'clientHeight', { configurable: true, value: 40 });
}

describe('AIText', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render successfully', () => {
    setupAnimationFrame();
    render(<AIText text="Hello" />);
    expect(getTypingElement()).toHaveTextContent('');
  });

  it('should reveal text progressively based on pace', () => {
    const { tick } = setupAnimationFrame();
    render(<AIText text="Hello world" pace={10} />);

    act(() => tick(5));
    expect(getTypingElement()).toHaveTextContent('');

    act(() => tick(10));
    expect(getTypingElement()).toHaveTextContent('Hello');

    act(() => tick(10));
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should restart from the beginning when text changes', () => {
    const { tick } = setupAnimationFrame();
    const { rerender } = render(<AIText text="Hello there" pace={10} />);

    act(() => tick(15));
    expect(getTypingElement()).toHaveTextContent('Hello');

    rerender(<AIText text="World now" pace={10} />);
    expect(getTypingElement()).toHaveTextContent('');

    act(() => tick(15));
    expect(getTypingElement()).toHaveTextContent('World');
  });

  it('should apply line clamp when maxLines is provided', () => {
    setupAnimationFrame();
    render(<AIText text="Hello" maxLines={3} />);

    const clampedElement = document.querySelector('.p-sm > div');
    expect(clampedElement).toHaveStyle({
      display: '-webkit-box',
      webkitLineClamp: '3',
      overflow: 'hidden',
    });
  });

  it('should stop animation when max lines is reached', () => {
    const { tick } = setupAnimationFrame();
    const longText = 'alpha beta gamma delta epsilon zeta';

    render(<AIText text={longText} pace={10} maxLines={2} />);
    mockLineClampOverflow(11);

    act(() => tick(100));

    expect(getTypingElement()).toHaveTextContent('alpha beta');
    expect(screen.queryByText(longText)).not.toBeInTheDocument();
  });
});
