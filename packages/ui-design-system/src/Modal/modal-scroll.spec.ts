// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { getModalScrollBorders, getModalScrollElement } from './modal-scroll';

function setScrollDimensions(
  element: HTMLElement,
  { scrollHeight, clientHeight }: Pick<Element, 'scrollHeight' | 'clientHeight'>,
) {
  Object.defineProperties(element, {
    scrollHeight: {
      configurable: true,
      value: scrollHeight,
    },
    clientHeight: {
      configurable: true,
      value: clientHeight,
    },
  });
}

describe('getModalScrollBorders', () => {
  it('returns no borders when content fits', () => {
    expect(getModalScrollBorders(0, 100, 100)).toEqual({
      showTitleBorder: false,
      showFooterBorder: false,
    });
  });

  it('shows footer border at top when content overflows', () => {
    expect(getModalScrollBorders(0, 200, 100)).toEqual({
      showTitleBorder: false,
      showFooterBorder: true,
    });
  });

  it('shows both borders when scrolled in the middle', () => {
    expect(getModalScrollBorders(50, 200, 100)).toEqual({
      showTitleBorder: true,
      showFooterBorder: true,
    });
  });

  it('shows title border only when scrolled to bottom', () => {
    expect(getModalScrollBorders(100, 200, 100)).toEqual({
      showTitleBorder: true,
      showFooterBorder: false,
    });
  });
});

describe('getModalScrollElement', () => {
  it('uses the root element when it is the scroll container', () => {
    const root = document.createElement('div');
    root.style.overflowY = 'auto';
    setScrollDimensions(root, { scrollHeight: 200, clientHeight: 100 });

    expect(getModalScrollElement(root)).toBe(root);
  });

  it('uses an overflowing descendant when the root does not scroll', () => {
    const root = document.createElement('div');
    const body = document.createElement('div');
    body.style.overflowY = 'auto';
    root.append(body);
    setScrollDimensions(root, { scrollHeight: 100, clientHeight: 100 });
    setScrollDimensions(body, { scrollHeight: 200, clientHeight: 100 });

    expect(getModalScrollElement(root)).toBe(body);
  });
});
