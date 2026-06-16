import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Typo } from './Typo';

describe('Typo', () => {
  it('should render its children', () => {
    render(<Typo>Hello</Typo>);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should render a <p> by default (text variant)', () => {
    render(<Typo>Hello</Typo>);

    expect(screen.getByText('Hello').tagName).toBe('P');
  });

  it.each([
    ['title1', 'H1'],
    ['title2', 'H2'],
    ['subtitle1', 'H3'],
    ['subtitle2', 'H4'],
    ['text', 'P'],
  ] as const)('should render variant %s as <%s> by default', (variant, tagName) => {
    render(<Typo variant={variant}>Hello</Typo>);

    expect(screen.getByText('Hello').tagName).toBe(tagName);
  });

  it('should render as the element passed via the `as` prop', () => {
    render(
      <Typo as="span" variant="title1">
        Hello
      </Typo>,
    );

    expect(screen.getByText('Hello').tagName).toBe('SPAN');
  });

  it('should merge custom className with variant classes', () => {
    render(<Typo className="custom-class">Hello</Typo>);

    const element = screen.getByText('Hello');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('text-tiny');
  });

  it('should forward additional props to the rendered element', () => {
    render(<Typo data-testid="typo-el">Hello</Typo>);

    expect(screen.getByTestId('typo-el')).toBeInTheDocument();
  });

  it('should forward the ref to the rendered element', () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<Typo ref={ref}>Hello</Typo>);

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    expect(ref.current).toHaveTextContent('Hello');
  });
});
