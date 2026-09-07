import {
  DimensionValueInput,
  DimensionValuesSelect,
} from '@app-builder/components/AstBuilder/edition/EditModal/modals/ValueSwitch/ValueSwitch';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import type { DataModelField } from '@app-builder/models/data-model';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useState } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';
import { DataField } from './DataVisualisation/DataField';
import { EnumTag } from './EnumTag';
import { adaptFieldToTableField } from './SemanticTables/EditTable/adapt-field';
import { EnumValuesSettings } from './SemanticTables/Shared/FieldDetailPanel';
import type { TableField } from './SemanticTables/Shared/semanticData-types';

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
  values: ['known'],
};
const keyed: DataModelField = {
  ...field,
  semanticSubType: 'key_color_value',
  enumValues: [
    { key: 'approved', color: 'green', value: 'Approved' },
    { key: 'other', color: 'gray', value: 'Other' },
  ],
};

function Editor({
  multiple,
  definition = field,
  initial = ['known'],
}: {
  multiple: boolean;
  definition?: DataModelField;
  initial?: string[];
}) {
  const [values, setValues] = useState(initial);
  const dimension = { type: 'field' as const, field: NewPayloadAstNode('status'), values };
  return (
    <>
      <output data-testid="values">{JSON.stringify(values)}</output>
      {multiple ? (
        <DimensionValuesSelect
          field={definition}
          dimension={dimension}
          knownValues={[]}
          onChange={(next) => setValues(next.map(String))}
        />
      ) : (
        <DimensionValueInput
          field={definition}
          dimension={dimension}
          knownValues={[]}
          value={values[0] ?? ''}
          unavailableValues={[]}
          onChange={(next) => setValues([String(next)])}
        />
      )}
    </>
  );
}

describe('shared enum tags', () => {
  it('renders ordinary enums explicitly purple', () => {
    const { container } = render(<EnumTag field={field} value="known" />);
    expect(container.querySelector('span')?.className).toContain('text-purple-primary');
  });
  it('renders configured outlines and presentation-only fallback labels', () => {
    render(<EnumTag field={keyed} value="stale" />);
    expect(screen.getByText('Other').style.color).toBe('gray');
    expect(screen.getByText('Other').style.borderColor).toBe('gray');
    expect(screen.getByText('Other').title).toBe('stale');
  });
  it('renders unknown countries neutrally', () => {
    render(<EnumTag field={{ ...field, semanticSubType: 'country' }} value="ZZZ" />);
    expect(screen.getByText('ZZZ').className).toContain('text-grey-placeholder');
  });
  it.each([{ ...field, isEnum: true, semanticType: undefined }, field, { ...field, dataType: 'Int' as const }])(
    'DataField recognizes enums and preserves numeric display',
    (definition) => {
      render(<DataField field={definition} value={10000} />);
      expect(screen.getByText('10000').className).toContain('text-purple-primary');
    },
  );
});

describe.each([false, true])('ValueSwitch enum selector (multiple=%s)', (multiple) => {
  it('searches and creates a rule-local value', async () => {
    render(<Editor multiple={multiple} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(screen.getByPlaceholderText('scenarios:value_switch.search_values'), 'custom');
    await userEvent.click(screen.getByRole('option', { name: 'scenarios:value_switch.use_custom_value custom' }));
    expect(screen.getByTestId('values').textContent).toBe(JSON.stringify(multiple ? ['known', 'custom'] : ['custom']));
  });
  it('searches labels while storing configured keys', async () => {
    render(<Editor multiple={multiple} definition={keyed} initial={[]} />);
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(screen.getByPlaceholderText('scenarios:value_switch.search_values'), 'Approved');
    await userEvent.click(screen.getByRole('option', { name: 'Approved' }));
    expect(screen.getByTestId('values').textContent).toBe('["approved"]');
  });
  it.each([keyed, { ...field, semanticSubType: 'country' as const }])(
    'does not create custom values for closed enums',
    async (definition) => {
      render(<Editor multiple={multiple} definition={definition} initial={['stale']} />);
      expect(screen.getByTestId('values').textContent).toBe('["stale"]');
      await userEvent.click(screen.getByRole('button'));
      await userEvent.type(screen.getByPlaceholderText('scenarios:value_switch.search_values'), 'not-a-value');
      expect(screen.queryByRole('option')).toBeNull();
      expect(screen.getByTestId('values').textContent).toBe('["stale"]');
    },
  );
  it('keeps stale values visible without offering them as new selections', async () => {
    render(<Editor multiple={multiple} definition={keyed} initial={['stale']} />);
    await userEvent.click(screen.getByRole('button'));
    const stale = screen.getAllByRole('option').find((option) => option.querySelector('[title="stale"]'));
    expect(stale).toBeDefined();
    if (!stale) throw new Error('Missing stale option');
    if (multiple) {
      await userEvent.click(stale);
      expect(screen.getByTestId('values').textContent).toBe('[]');
      expect(screen.getAllByRole('option').some((option) => option.querySelector('[title="stale"]'))).toBe(false);
    } else expect(stale.getAttribute('aria-disabled')).toBe('true');
  });
});

function MetadataEditor() {
  const [value, setValue] = useState<TableField>(adaptFieldToTableField(keyed));
  return (
    <>
      <output data-testid="metadata">{JSON.stringify(value.enumValues)}</output>
      <EnumValuesSettings
        field={value}
        disabled={false}
        onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
      />
    </>
  );
}

describe('enum metadata controls', () => {
  it('flags duplicate user-entered keys', async () => {
    render(<MetadataEditor />);
    const input = screen.getAllByPlaceholderText('data:upload_data.field_enum_key_placeholder')[1]!;
    await userEvent.clear(input);
    await userEvent.type(input, 'approved');
    expect(screen.getAllByText('data:upload_data.field_enum_value_unique_error')).toHaveLength(2);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
  it('keeps user-entered keys independent of labels and promotes the previous fallback on deletion', async () => {
    render(<MetadataEditor />);
    await userEvent.click(screen.getByRole('button', { name: 'data:upload_data.field_enum_add_value' }));
    const original = screen.getByTestId('metadata').textContent ?? '[]';
    const originalEntries = z.array(z.object({ key: z.string(), value: z.string() })).parse(JSON.parse(original));
    expect(originalEntries.at(-1)!.key).toBe('');
    const keyInput = screen.getAllByPlaceholderText('data:upload_data.field_enum_key_placeholder').at(-1)!;
    await userEvent.type(keyInput, 'COMPLETED');
    expect(document.activeElement).toBe(keyInput);
    const input = screen.getAllByPlaceholderText('data:upload_data.field_enum_value_placeholder').at(-1)!;
    await userEvent.type(input, 'New label');
    await userEvent.clear(input);
    await userEvent.type(input, 'Renamed label');
    const editedEntries = z
      .array(z.object({ key: z.string(), value: z.string() }))
      .parse(JSON.parse(screen.getByTestId('metadata').textContent ?? '[]'));
    expect(editedEntries.at(-1)!.key).toBe('COMPLETED');
    expect(editedEntries.at(-1)!.value).toBe('Renamed label');
    expect(screen.getAllByText('data:upload_data.enum_fallback')).toHaveLength(1);
    await userEvent.click(screen.getAllByRole('button', { name: 'data:upload_data.field_enum_remove_value' }).at(-1)!);
    expect(JSON.parse(screen.getByTestId('metadata').textContent ?? '[]')).toEqual(keyed.enumValues);
    expect(screen.getAllByText('data:upload_data.enum_fallback')).toHaveLength(1);
  });
});
