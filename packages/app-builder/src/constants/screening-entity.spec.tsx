import { FormatContext } from '@app-builder/contexts/FormatContext';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createPropertyTransformer } from './screening-entity';

describe('screening entity property transformer', () => {
  it('re-renders one property when the next value holds more embedded dates', () => {
    const TransformProperty = createPropertyTransformer({ language: 'en', formatLanguage: 'en' });
    const view = (value: string) => (
      <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
        <TransformProperty property="notes" value={value} />
      </FormatContext.Provider>
    );

    const { rerender, container } = render(view('Listed on March 3, 2011'));
    expect(container.textContent).toContain('Listed on');

    // Moving to another hit re-renders the same element, so each date must be its own component.
    rerender(view('Listed on March 3, 2011, delisted on September 16, 2011'));
    expect(container.textContent).toContain('Listed on');
    expect(container.textContent).toContain('delisted on');
    // Embedded dates go through the date formatter.
    expect(container.textContent).not.toContain('March 3, 2011');
  });
});
