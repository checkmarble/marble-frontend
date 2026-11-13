import { render, screen } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Card } from './Card';

function Panel({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <section className={className} data-testid="panel">
      {children}
    </section>
  );
}

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Hello</Card>);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders a div by default', () => {
    render(<Card>Hello</Card>);

    expect(screen.getByText('Hello').tagName).toBe('DIV');
  });

  it('renders the tag passed via the `as` prop', () => {
    render(<Card as="span">Hello</Card>);

    expect(screen.getByText('Hello').tagName).toBe('SPAN');
  });

  it('renders a custom component passed via the `as` prop', () => {
    render(<Card as={Panel}>Hello</Card>);

    const panel = screen.getByTestId('panel');
    expect(panel.tagName).toBe('SECTION');
    expect(panel).toHaveTextContent('Hello');
    expect(panel).toHaveClass('rounded-md');
  });

  it('forwards element-specific props to the rendered tag', () => {
    render(
      <Card as="form" aria-label="filters" onSubmit={(event) => event.preventDefault()}>
        Form card
      </Card>,
    );

    expect(screen.getByRole('form', { name: 'filters' }).tagName).toBe('FORM');
  });

  it('merges custom className with the card classes', () => {
    render(<Card className="custom-class">Hello</Card>);

    const element = screen.getByText('Hello');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('rounded-md');
  });

  it('forwards the ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Card as="article" ref={ref}>
        Hello
      </Card>,
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('ARTICLE');
  });
});
