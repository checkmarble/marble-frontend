import { describe, expect, it } from 'vitest';

import { getModalScrollBorders } from './modal-scroll';

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
