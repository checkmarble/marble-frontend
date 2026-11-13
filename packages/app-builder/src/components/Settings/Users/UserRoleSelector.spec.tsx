import { cleanup, render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { type RoleBinding } from 'marble-api';
import { useState } from 'react';
import { Panel } from 'ui-design-system';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRoleSelector } from './UserRoleSelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => (options?.count ? `${key}:${options.count}` : key),
  }),
}));
vi.mock('@app-builder/contexts/FormatContext', () => ({ FormatContext: { useValue: () => ({ locale: 'en' }) } }));
vi.mock('@app-builder/services/organization/organization-detail', () => ({
  useOrganizationDetails: () => ({ org: { defaultScenarioTimezone: 'Europe/Paris' } }),
}));
mockResizeObserver();
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(cleanup);

function TestForm({ initial, onChange }: { initial: RoleBinding[]; onChange: (roles: RoleBinding[]) => void }) {
  const [roles, setRoles] = useState(initial);
  return (
    <UserRoleSelector
      roles={roles}
      options={[]}
      access="allowed"
      onChange={(next) => {
        onChange(next);
        setRoles(next);
      }}
    />
  );
}

describe('role conditions panel', () => {
  it('counts condition types rather than individual values', () => {
    render(
      <TestForm
        initial={[
          {
            role: 'ADMIN',
            conditions: {
              not_before: '2026-01-01T00:00:00Z',
              not_after: '2027-01-01T00:00:00Z',
              day_of_week: [1, 2, 7],
              time_of_day: [900, 1700],
              networks: ['192.0.2.1', '192.0.2.0/24'],
              used_second_factor: true,
            },
          },
        ]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'settings:users.role.conditions.count:5' })).toBeTruthy();
  });

  it('changes one role without losing the other bindings', async () => {
    const onChange = vi.fn();
    const other = { id: 'other', role: 'ANALYST', conditions: { used_second_factor: true } };
    render(
      <UserRoleSelector
        roles={[{ role: 'ADMIN' }, other]}
        options={[
          { value: 'ADMIN', label: 'Admin' },
          { value: 'VIEWER', label: 'Viewer' },
        ]}
        access="allowed"
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getAllByRole('combobox')[0]!);
    await userEvent.click(screen.getByRole('option', { name: 'Viewer' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'VIEWER' }, other]);
  });

  it('edits a draft and applies it only on save', async () => {
    const onChange = vi.fn();
    render(<TestForm initial={[{ role: 'ADMIN' }]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'settings:users.role.add_conditions' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'settings:users.role.conditions.days' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mon' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sun' }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'common:save' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'ADMIN', conditions: { day_of_week: [1, 7] } }]);
    expect(screen.getByRole('button', { name: 'settings:users.role.conditions.count:1' })).toBeTruthy();
  });

  it('discards unsaved changes and removes all conditions immediately via the header', async () => {
    const onChange = vi.fn();
    render(
      <TestForm
        initial={[{ role: 'ADMIN', conditions: { used_second_factor: true, day_of_week: [1, 7] } }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'settings:users.role.conditions.count:2' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'settings:users.role.conditions.second_factor' }));
    await userEvent.click(screen.getByRole('button', { name: 'common:cancel' }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'settings:users.role.conditions.count:2' }));
    expect(
      screen
        .getByRole('checkbox', { name: 'settings:users.role.conditions.second_factor' })
        .getAttribute('aria-checked'),
    ).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'settings:users.role.conditions.delete' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'ADMIN' }]);
    expect(screen.getByRole('button', { name: 'settings:users.role.add_conditions' })).toBeTruthy();
  });

  it('prevents saving an incomplete condition and converts date bounds in the organization timezone', async () => {
    const onChange = vi.fn();
    render(<TestForm initial={[{ role: 'ADMIN' }]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'settings:users.role.add_conditions' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'settings:users.role.conditions.enable_dates' }));
    expect(screen.getByRole('button', { name: 'common:save' }).hasAttribute('disabled')).toBe(true);
    await userEvent.type(screen.getByLabelText('settings:users.role.conditions.start_date'), '2026-07-01T10:30');
    await userEvent.click(screen.getByRole('button', { name: 'common:save' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'ADMIN', conditions: { not_before: '2026-07-01T08:30:00Z' } }]);
  });

  it('closes only the child panel on Escape and returns focus to its trigger', async () => {
    function Parent() {
      const [open, setOpen] = useState(true);
      return (
        <Panel.Root open={open} onOpenChange={setOpen}>
          <Panel.Container>
            <Panel.Content>
              <Panel.Header>Parent</Panel.Header>
              <TestForm initial={[{ role: 'ADMIN' }]} onChange={vi.fn()} />
            </Panel.Content>
          </Panel.Container>
        </Panel.Root>
      );
    }
    render(<Parent />);
    const trigger = screen.getByRole('button', { name: 'settings:users.role.add_conditions' });
    await userEvent.click(trigger);
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    await userEvent.keyboard('{Escape}');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(screen.getByRole('dialog')).getByText('Parent')).toBeTruthy();
    expect(document.activeElement).toBe(trigger);
  });

  it('preserves other bindings when removing a role and prevents removing the last', async () => {
    const onChange = vi.fn();
    const other = { id: 'other', role: 'ANALYST', conditions: { used_second_factor: true } };
    render(<TestForm initial={[{ role: 'ADMIN' }, other]} onChange={onChange} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'settings:users.role.delete' })[0]!);
    expect(onChange).toHaveBeenCalledWith([other]);
    expect(screen.getByRole('button', { name: 'settings:users.role.delete' }).hasAttribute('disabled')).toBe(true);
  });

  it('restores a condition within the draft when its checkbox is re-enabled', async () => {
    const onChange = vi.fn();
    render(<TestForm initial={[{ role: 'ADMIN', conditions: { time_of_day: [2200, 600] } }]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'settings:users.role.conditions.count:1' }));
    const toggle = screen.getByRole('checkbox', { name: 'settings:users.role.conditions.enable_time' });
    await userEvent.click(toggle);
    expect(screen.queryByLabelText('settings:users.role.conditions.start_time')).toBeNull();
    await userEvent.click(toggle);
    await userEvent.click(screen.getByRole('button', { name: 'common:save' }));
    expect(onChange).toHaveBeenCalledWith([{ role: 'ADMIN', conditions: { time_of_day: [2200, 600] } }]);
  });
});
