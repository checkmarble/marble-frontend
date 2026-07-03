import { describe, expect, it } from 'vitest';

import { findStopIndexForMaxLines, hasLineClampOverflow } from './lineClamp';

function createElements({ scrollHeight, clientHeight }: { scrollHeight: number; clientHeight: number }) {
  const clampElement = document.createElement('div');
  const typingElement = document.createElement('div');

  Object.defineProperty(clampElement, 'scrollHeight', { value: scrollHeight, configurable: true });
  Object.defineProperty(clampElement, 'clientHeight', { value: clientHeight, configurable: true });

  return { clampElement, typingElement };
}

describe('lineClamp', () => {
  it('should detect overflow', () => {
    const { clampElement } = createElements({ scrollHeight: 100, clientHeight: 50 });
    expect(hasLineClampOverflow(clampElement)).toBe(true);
  });

  it('should not detect overflow when content fits', () => {
    const { clampElement } = createElements({ scrollHeight: 50, clientHeight: 50 });
    expect(hasLineClampOverflow(clampElement)).toBe(false);
  });

  it('should find the last fitting index', () => {
    const fullText = 'abcdefghij';
    const { clampElement, typingElement } = createElements({ scrollHeight: 100, clientHeight: 50 });

    let currentLength = 8;
    Object.defineProperty(clampElement, 'scrollHeight', {
      configurable: true,
      get() {
        return typingElement.textContent && typingElement.textContent.length > 5 ? 100 : 50;
      },
    });

    expect(findStopIndexForMaxLines(clampElement, typingElement, fullText, currentLength)).toBe(5);
    expect(typingElement.textContent).toBe('abcde');
  });
});
