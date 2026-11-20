import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserRoleSelector } from './UserRoleSelector';
import { UserRoleField } from './UserRoleField';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
mockResizeObserver();
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

describe('UserRoleSelector', () => {
  it('shows the first binding and selects a single new role without an ID', async () => {
    const onChange = vi.fn();
    render(
      <UserRoleSelector
        roles={[{ id: 'binding-id', role: 'ADMIN' }, { role: 'ANALYST' }]}
        options={[
          { value: 'ADMIN', label: 'settings:users.role.admin' },
          { value: 'ANALYST', label: 'settings:users.role.analyst' },
        ]}
        disabled={false}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'settings:users.role.admin' }));
    await userEvent.click(screen.getByRole('option', { name: 'settings:users.role.analyst' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'ANALYST' }]);
  });

  it('selects a custom role by name as the only binding', async () => {
    const onChange = vi.fn();
    render(
      <UserRoleSelector
        roles={[{ role: 'ADMIN' }]}
        options={[
          { value: 'ADMIN', label: 'Admin' },
          { value: 'org/fraud.analyst', label: 'Fraud analyst' },
        ]}
        disabled={false}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'Admin' }));
    await userEvent.click(screen.getByRole('option', { name: 'Fraud analyst' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'org/fraud.analyst' }]);
  });

  it('allows changing an assigned custom role in the role field', async () => {
    const onChange = vi.fn();
    render(
      <UserRoleField
        value="org/fraud.analyst"
        userRoles={[
          { value: 'ADMIN', label: 'Admin' },
          { value: 'org/fraud.analyst', label: 'Fraud analyst' },
        ]}
        access="allowed"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('combobox').textContent).toContain('Fraud analyst');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Admin' }));
    expect(onChange).toHaveBeenCalledWith('ADMIN');
  });
});
