import type { DataModelField } from '@app-builder/models/data-model';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataFieldValue } from './DataField';

vi.mock('@app-builder/utils/format', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@app-builder/utils/format')>();
  return {
    ...actual,
    useFormatLanguage: () => 'en',
    useFormatDateTime: () => (value: string | Date) => new Date(value).toISOString(),
  };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
afterEach(cleanup);

const field: DataModelField = {
  id: 'field',
  tableId: 'table',
  name: 'label',
  description: '',
  nullable: true,
  isEnum: false,
  dataType: 'String',
  unicityConstraint: 'no_unicity_constraint',
};

describe('DataFieldValue', () => {
  it('renders the value alone, without the field label', () => {
    const { container } = render(<DataFieldValue field={field} value="hello" />);
    expect(container.textContent).toBe('hello');
    expect(container.querySelector('label')).toBeNull();
  });

  it('renders a dash for a missing value', () => {
    const { container } = render(<DataFieldValue field={field} value={undefined} />);
    expect(container.textContent).toBe('-');
  });

  it('renders an enum as a tag', () => {
    render(
      <DataFieldValue
        field={{
          ...field,
          semanticType: 'enum',
          semanticSubType: 'key_color_value',
          enumValues: [{ key: 'TREATED', color: 'var(--color-enum-green)' }],
        }}
        value="TREATED"
      />,
    );
    expect(screen.getByTitle('TREATED').style.borderColor).toBe('var(--color-enum-green)');
  });

  it('scales an amount by its exponent and shows the currency it is given', () => {
    const { container } = render(
      <DataFieldValue
        field={{
          ...field,
          name: 'total',
          dataType: 'Float',
          semanticType: 'monetary_amount',
          currencyExponent: 2,
          decimalPrecision: 2,
        }}
        value={123456}
        currency="EUR"
      />,
    );
    expect(container.textContent).toBe('EUR1,234.56');
  });

  it('renders a boolean as yes/no when the field asks for it', () => {
    const { container } = render(
      <DataFieldValue field={{ ...field, dataType: 'Bool', booleanDisplay: 'yes_no' }} value={false} />,
    );
    expect(container.textContent).toBe('data:no');
  });

  it('renders a boolean as a read-only switch by default', () => {
    render(<DataFieldValue field={{ ...field, dataType: 'Bool' }} value={true} />);
    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(toggle.hasAttribute('disabled')).toBe(true);
  });

  it('renders a country with its name', () => {
    const { container } = render(<DataFieldValue field={{ ...field, semanticType: 'country' }} value="FR" />);
    expect(container.textContent).toContain('France');
  });
});
