import { render } from '@testing-library/react';

import UiDesignSystem from './Button';

describe('UiDesignSystem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiDesignSystem />);
    expect(baseElement).toBeTruthy();
  });
});
