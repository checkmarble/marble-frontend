import { afterEach, describe, expect, it, vi } from 'vitest';
import { findFocusElement, focusFirstControl, highlight, type TracfinFocusTarget } from './focus-target';

const target = (extra: Partial<TracfinFocusTarget>): TracfinFocusTarget => ({
  section: 'declaration',
  blockId: null,
  fieldId: null,
  valueId: null,
  parentValueId: null,
  ...extra,
});

function render(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  return container;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

const PAGE = `
  <div data-tracfin-block="b1">
    <div data-tracfin-field-block="b1" data-tracfin-field="/ds/a">
      <ul>
        <li data-tracfin-value="v1"><input aria-label="one" /></li>
        <li data-tracfin-value="v2"><input aria-label="two" /></li>
      </ul>
      <div data-tracfin-field-block="b1" data-tracfin-field="/ds/a/@type" data-tracfin-parent-value="v2">
        <li data-tracfin-value="t2"><input aria-label="type of two" /></li>
      </div>
    </div>
  </div>`;

describe('findFocusElement', () => {
  it('finds the occurrence, then the field, then the block, as precisely as the screen allows', () => {
    const container = render(PAGE);
    expect(findFocusElement(container, target({ blockId: 'b1', fieldId: '/ds/a', valueId: 'v2' }))).toMatchObject({
      precision: 'value',
    });
    const occurrence = findFocusElement(container, target({ blockId: 'b1', fieldId: '/ds/a', valueId: 'v2' }));
    expect(occurrence?.element.getAttribute('data-tracfin-value')).toBe('v2');
    // An occurrence that is not on screen falls back to its field.
    expect(findFocusElement(container, target({ blockId: 'b1', fieldId: '/ds/a', valueId: 'gone' }))?.precision).toBe(
      'field',
    );
    // A field with no row (a child block the draft does not have yet) falls back to the block.
    expect(findFocusElement(container, target({ blockId: 'b1', fieldId: '/ds/missing' }))?.precision).toBe('block');
    expect(findFocusElement(container, target({ blockId: 'b1' }))?.precision).toBe('block');
  });

  it('picks the attribute of the right owner occurrence', () => {
    const container = render(PAGE);
    const match = findFocusElement(
      container,
      target({ blockId: 'b1', fieldId: '/ds/a/@type', parentValueId: 'v2', valueId: 't2' }),
    );
    expect(match).toMatchObject({ precision: 'value' });
    expect(match?.element.getAttribute('data-tracfin-value')).toBe('t2');
  });

  it('is null when nothing on screen matches, and compares ids in code (no selector injection)', () => {
    const container = render(PAGE);
    expect(findFocusElement(container, target({ blockId: 'nope', fieldId: '/ds/a' }))).toBeNull();
    expect(findFocusElement(container, target({ blockId: 'b1"] , [x="' }))).toBeNull();
    expect(findFocusElement(container, target({}))).toBeNull();
  });
});

describe('focusFirstControl and highlight', () => {
  it('focuses the first enabled control of the element, or the element itself', () => {
    const container = render('<div id="a"><input disabled /><input aria-label="x" /></div><div id="b">text</div>');
    const control = focusFirstControl(container.querySelector<HTMLElement>('#a')!);
    expect(document.activeElement).toBe(control);
    expect(control.getAttribute('aria-label')).toBe('x');
    const bare = container.querySelector<HTMLElement>('#b')!;
    expect(focusFirstControl(bare)).toBe(bare);
    expect(document.activeElement).toBe(bare);
  });

  it('marks the element for a while only', () => {
    vi.useFakeTimers();
    const element = render('<div id="a"></div>').querySelector<HTMLElement>('#a')!;
    highlight(element, 1000);
    expect(element.getAttribute('data-tracfin-highlight')).toBe('true');
    vi.advanceTimersByTime(1000);
    expect(element.hasAttribute('data-tracfin-highlight')).toBe(false);
  });
});
