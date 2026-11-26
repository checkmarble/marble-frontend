import { CreateRolePanel, CustomRolesPage, Route } from '@app-builder/routes/_app/_builder/settings/roles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mockIntersectionObserver, mockResizeObserver } from 'jsdom-testing-mocks';
import { type ReactNode, useState } from 'react';
import { Panel, Tooltip } from 'ui-design-system';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider>{children}</Tooltip.Provider>
    </QueryClientProvider>
  );
}

const api = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), updateSections: vi.fn() }));
mockResizeObserver();
mockIntersectionObserver();
vi.mock('@app-builder/server-fns/custom-roles', () => ({
  createCustomRoleFn: api.create,
  updateCustomRolePermissionsFn: api.update,
  updateCustomRoleSectionsFn: api.updateSections,
}));
vi.mock('@tanstack/react-start', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-start')>()),
  useServerFn: (fn: unknown) => fn,
}));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useRouter: () => ({ invalidate: vi.fn() }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  api.create.mockReset();
  api.update.mockReset();
  api.updateSections.mockReset();
});
afterEach(cleanup);

describe('custom role listing', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows an empty state and creation action in the table', () => {
    vi.spyOn(Route, 'useLoaderData').mockReturnValue({ roles: [], error: false });
    render(<CustomRolesPage />, { wrapper: Providers });
    expect(screen.getByText('settings:custom_roles.empty').closest('td')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'settings:custom_roles.create' })).toBeTruthy();
  });

  it('shows a retry message instead of the empty state when loading fails', () => {
    vi.spyOn(Route, 'useLoaderData').mockReturnValue({ roles: [], error: true });
    render(<CustomRolesPage />, { wrapper: Providers });
    expect(screen.queryByText('settings:custom_roles.empty')).toBeNull();
    expect(screen.getByRole('button', { name: 'settings:custom_roles.retry' })).toBeTruthy();
  });

  it('opens the selected role in the permissions panel', async () => {
    vi.spyOn(Route, 'useLoaderData').mockReturnValue({
      roles: [
        { name: 'Analyst', slug: 'org/analyst', permissions: ['CASE_READ_WRITE'], sections: { settings: false } },
      ],
      error: false,
    });
    render(<CustomRolesPage />, { wrapper: Providers });
    const edit = screen.getByRole('button', { name: 'settings:custom_roles.edit_for' });
    edit.focus();
    expect((await screen.findByRole('tooltip')).textContent).toContain('settings:custom_roles.edit');
    await userEvent.click(edit);
    expect((screen.getByRole('textbox', { name: 'settings:custom_roles.name' }) as HTMLInputElement).value).toBe(
      'Analyst',
    );
    expect(screen.getByRole('checkbox', { name: 'CASE_READ_WRITE' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.queryByRole('checkbox', { name: 'navigation:settings' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /settings:custom_roles\.sections/ }));
    expect(screen.getByRole('checkbox', { name: 'navigation:settings' }).getAttribute('aria-checked')).toBe('false');
    expect(screen.getByRole('checkbox', { name: 'navigation:scenarios' }).getAttribute('aria-checked')).toBe('true');
  });
});

describe('editing custom role permissions', () => {
  function renderPanel(onSuccess = vi.fn()) {
    render(
      <Panel.Root open>
        <Panel.Container>
          <CreateRolePanel
            role={{
              name: 'Analyst',
              slug: 'org/analyst',
              permissions: ['CASE_READ_WRITE', 'NEW_PERMISSION'],
              sections: { data_model: false },
            }}
            roleCreated={false}
            onRoleCreated={vi.fn()}
            onSavingChange={vi.fn()}
            onSuccess={onSuccess}
          />
        </Panel.Container>
      </Panel.Root>,
      { wrapper: Providers },
    );
    return onSuccess;
  }

  it('prefills and locks identity, saves selected permissions, and does not create a role', async () => {
    api.update.mockResolvedValue(undefined);
    api.updateSections.mockResolvedValue(undefined);
    const onSuccess = renderPanel();
    expect((screen.getByRole('textbox', { name: 'settings:custom_roles.name' }) as HTMLInputElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole('textbox', { name: 'settings:custom_roles.slug' }) as HTMLInputElement).value).toBe(
      'org/analyst',
    );
    const existing = screen.getByRole('checkbox', { name: 'NEW_PERMISSION' });
    expect(existing.getAttribute('aria-checked')).toBe('true');
    await userEvent.click(screen.getByRole('checkbox', { name: 'CASE_READ_WRITE' }));
    await userEvent.click(screen.getByRole('button', { name: 'common:save' }));
    await waitFor(() =>
      expect(api.update).toHaveBeenCalledWith({ data: { role: 'org/analyst', permissions: ['NEW_PERMISSION'] } }),
    );
    expect(api.create).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('saves the visible sections with the full visibility map', async () => {
    api.update.mockResolvedValue(undefined);
    api.updateSections.mockResolvedValue(undefined);
    const onSuccess = renderPanel();
    await userEvent.click(screen.getByRole('button', { name: /settings:custom_roles\.sections/ }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'navigation:settings' }));
    await userEvent.click(screen.getByRole('button', { name: 'common:save' }));
    await waitFor(() =>
      expect(api.updateSections).toHaveBeenCalledWith({
        data: {
          role: 'org/analyst',
          sections: expect.objectContaining({ data_model: false, settings: false, scenarios: true }),
        },
      }),
    );
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('submits an empty selection and keeps the panel open after a failed save', async () => {
    api.update.mockRejectedValue(new Error('Forbidden'));
    const onSuccess = renderPanel();
    await userEvent.click(screen.getByRole('checkbox', { name: 'CASE_READ_WRITE' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'NEW_PERMISSION' }));
    await userEvent.click(screen.getByRole('button', { name: 'common:save' }));
    await waitFor(() => expect(api.update).toHaveBeenCalledWith({ data: { role: 'org/analyst', permissions: [] } }));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'common:save' })).toBeTruthy();
  });
});
