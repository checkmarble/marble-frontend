import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserRoleSelector } from './UserRoleSelector';

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
        options={['ADMIN', 'ANALYST']}
        disabled={false}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'settings:users.role.admin' }));
    await userEvent.click(screen.getByRole('option', { name: 'settings:users.role.analyst' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'ANALYST' }]);
  });
});
