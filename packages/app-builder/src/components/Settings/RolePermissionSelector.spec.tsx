import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { useState } from 'react';
import { Tooltip } from 'ui-design-system';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RolePermissionSelector } from './RolePermissionSelector';

mockResizeObserver();
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(cleanup);

describe('RolePermissionSelector', () => {
  it('selects and deselects permissions without offering platform permissions', async () => {
    function TestSelector() {
      const [value, setValue] = useState<string[]>([]);
      return <RolePermissionSelector value={value} onChange={setValue} />;
    }
    render(<TestSelector />, { wrapper: Tooltip.Provider });
    const checkbox = screen.getByRole('checkbox', { name: 'CASE_READ_WRITE' });
    expect(screen.queryByRole('checkbox', { name: 'ORGANIZATIONS_CREATE' })).toBeNull();
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
  });

  it('keeps unrecognized existing permissions available after they are deselected', async () => {
    function TestSelector() {
      const [value, setValue] = useState<string[]>(['NEW_BACKEND_PERMISSION']);
      return (
        <RolePermissionSelector value={value} onChange={setValue} existingPermissions={['NEW_BACKEND_PERMISSION']} />
      );
    }
    render(<TestSelector />, { wrapper: Tooltip.Provider });
    const checkbox = screen.getByRole('checkbox', { name: 'NEW_BACKEND_PERMISSION' });
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });

  it('describes each known permission in a tooltip and skips unrecognized ones', async () => {
    render(<RolePermissionSelector value={[]} onChange={vi.fn()} existingPermissions={['NEW_BACKEND_PERMISSION']} />, {
      wrapper: Tooltip.Provider,
    });
    const hintName = 'settings:custom_roles.permission_description_for';
    const rowOf = (permission: string) =>
      screen.getByRole('checkbox', { name: permission }).closest('label')!.parentElement!;
    expect(within(rowOf('NEW_BACKEND_PERMISSION')).queryByRole('button', { name: hintName })).toBeNull();
    expect(screen.getAllByRole('button', { name: hintName })).toHaveLength(screen.getAllByRole('checkbox').length - 1);

    within(rowOf('INBOX_EDITOR')).getByRole('button', { name: hintName }).focus();
    expect((await screen.findByRole('tooltip')).textContent).toContain(
      'settings:custom_roles.permission_description.INBOX_EDITOR',
    );
  });
});
