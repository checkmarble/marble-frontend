import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RolePermissionSelector } from './RolePermissionSelector';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(cleanup);

describe('RolePermissionSelector', () => {
  it('selects and deselects permissions without offering platform permissions', async () => {
    function TestSelector() {
      const [value, setValue] = useState<string[]>([]);
      return <RolePermissionSelector value={value} onChange={setValue} />;
    }
    render(<TestSelector />);
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
    render(<TestSelector />);
    const checkbox = screen.getByRole('checkbox', { name: 'NEW_BACKEND_PERMISSION' });
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });
});
