import { render } from '@testing-library/react';

import UiDesignSystem from './UiDesignSystem';

describe('UiDesignSystem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiDesignSystem />);
    expect(baseElement).toBeTruthy();
  });
});
