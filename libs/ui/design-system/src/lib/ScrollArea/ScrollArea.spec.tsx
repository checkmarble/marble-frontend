import { render } from '@testing-library/react';

import ScrollArea from './ScrollArea';

describe('ScrollArea', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ScrollArea />);
    expect(baseElement).toBeTruthy();
  });
});
