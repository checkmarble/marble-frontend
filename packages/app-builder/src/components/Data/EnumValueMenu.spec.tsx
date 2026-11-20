import type { DataModelField, EnumValue } from '@app-builder/models/data-model';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EnumValueMenu } from './EnumValueMenu';

vi.mock('@app-builder/utils/format', () => ({ useFormatLanguage: () => 'en' }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { value?: string }) => (options?.value ? `${key} ${options.value}` : key),
  }),
}));
mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

const field: DataModelField = {
  id: 'status',
  tableId: 'table',
  name: 'status',
  description: '',
  nullable: false,
  isEnum: false,
  semanticType: 'enum',
  dataType: 'String',
  unicityConstraint: 'no_unicity_constraint',
  values: ['known', 'other'],
};
const keyed: DataModelField = {
  ...field,
  semanticSubType: 'key_color_value',
  enumValues: [{ key: 'approved', color: 'var(--color-enum-green)' }],
};
const many: DataModelField = {
  ...field,
  values: Array.from({ length: 80 }, (_, i) => `code-${String(i).padStart(2, '0')}`),
};

function Menu({
  multiple,
  definition = field,
  initial = [],
}: {
  multiple: boolean;
  definition?: DataModelField;
  initial?: EnumValue[];
}) {
  const [values, setValues] = useState(initial);
  return (
    <>
      <output data-testid="values">{JSON.stringify(values)}</output>
      {multiple ? (
        <EnumValueMenu multiple field={definition} selectedValues={values} onChange={setValues} />
      ) : (
        <EnumValueMenu field={definition} selectedValues={values} onChange={(value) => setValues([value])} />
      )}
    </>
  );
}

const searchInput = () => screen.getByPlaceholderText<HTMLInputElement>('scenarios:value_switch.search_values');
const optionNames = () => screen.getAllByRole('option').map((option) => option.textContent);

describe('EnumValueMenu search', () => {
  it('clears the search after adding a custom value with Enter', async () => {
    render(<Menu multiple />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(searchInput(), 'custom{Enter}');
    expect(screen.getByTestId('values').textContent).toBe('["custom"]');
    expect(searchInput().value).toBe('');
    expect(optionNames()).toEqual(['known', 'other', 'custom']);
  });

  it('clears the search after picking a filtered value', async () => {
    render(<Menu multiple />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(searchInput(), 'oth');
    expect(screen.queryByRole('option', { name: 'known' })).toBeNull();
    await userEvent.click(screen.getByRole('option', { name: 'other' }));
    expect(screen.getByTestId('values').textContent).toBe('["other"]');
    expect(searchInput().value).toBe('');
    expect(optionNames()).toEqual(['known', 'other']);
  });

  it('clears the search after picking from a virtualized list', async () => {
    render(<Menu multiple definition={many} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('option', { name: 'code-00' })).toBeDefined();
    await userEvent.type(searchInput(), 'code-79');
    expect(screen.queryByRole('option', { name: 'code-00' })).toBeNull();
    await userEvent.click(screen.getByRole('option', { name: 'code-79' }));
    expect(screen.getByTestId('values').textContent).toBe('["code-79"]');
    expect(searchInput().value).toBe('');
    expect(screen.getByRole('option', { name: 'code-00' })).toBeDefined();
  });

  it('clears the search after removing a stale value', async () => {
    render(<Menu multiple definition={keyed} initial={['stale']} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(searchInput(), 'stale');
    const stale = screen.getAllByRole('option').find((option) => option.querySelector('[title="stale"]'));
    if (!stale) throw new Error('Missing stale option');
    await userEvent.click(stale);
    expect(screen.getByTestId('values').textContent).toBe('[]');
    expect(searchInput().value).toBe('');
  });

  it('opens on an empty search after closing with a typed one', async () => {
    render(<Menu multiple />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(searchInput(), 'zzz');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button'));
    expect(searchInput().value).toBe('');
    expect(optionNames()).toEqual(['known', 'other']);
  });

  it('keeps the search in single mode', async () => {
    render(<Menu multiple={false} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(searchInput(), 'oth');
    await userEvent.click(screen.getByRole('option', { name: 'other' }));
    expect(screen.getByTestId('values').textContent).toBe('["other"]');
    expect(searchInput().value).toBe('oth');
  });
});

describe('EnumValueMenu options', () => {
  const country: DataModelField = { ...field, values: [], semanticSubType: 'country' };

  it('offers a custom value on a closed catalog only when asked to', async () => {
    const { unmount } = render(<EnumValueMenu multiple field={country} selectedValues={[]} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(searchInput(), 'UK');
    expect(screen.queryByText('scenarios:value_switch.use_custom_value UK')).toBeNull();
    unmount();

    const onChange = vi.fn();
    render(<EnumValueMenu multiple allowCustomValues field={country} selectedValues={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    // "UK" also matches Ukraine: the custom value is offered after the catalog matches.
    await userEvent.type(searchInput(), 'UK');
    await userEvent.click(screen.getByText('scenarios:value_switch.use_custom_value UK'));
    expect(onChange).toHaveBeenCalledWith(['UK']);
  });

  it('stops new picks once maxSelected values are picked, but keeps them removable', async () => {
    const onChange = vi.fn();
    render(<EnumValueMenu multiple maxSelected={1} field={field} selectedValues={['known']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('option', { name: 'other' }).getAttribute('aria-disabled')).toBe('true');
    await userEvent.type(searchInput(), 'custom');
    expect(screen.queryByText('scenarios:value_switch.use_custom_value custom')).toBeNull();
    await userEvent.clear(searchInput());
    await userEvent.click(screen.getByRole('option', { name: 'known' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
