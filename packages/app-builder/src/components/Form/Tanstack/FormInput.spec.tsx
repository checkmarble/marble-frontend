import { createRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Icon } from 'ui-icons';
import { describe, expect, it } from 'vitest';

import { FormInput } from './FormInput';

function render(element: ReactNode) {
  const container = document.createElement('div');
  const root = createRoot(container);

  flushSync(() => root.render(element));

  return {
    container,
    unmount: () => flushSync(() => root.unmount()),
  };
}

describe('React 19 ref props', () => {
  it('passes FormInput ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();

    const { container, unmount } = render(<FormInput ref={ref} name="field" type="text" />);

    expect(ref.current).toBe(container.querySelector('input'));
    unmount();
  });

  it('passes Icon ref to the SVG element', () => {
    const ref = createRef<SVGSVGElement>();

    const { container, unmount } = render(<Icon ref={ref} icon="tick" />);

    expect(ref.current).toBe(container.querySelector('svg'));
    unmount();
  });
});
