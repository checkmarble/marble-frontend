import { type TableModel } from '@app-builder/models';
import { OrganizationDetailsContextProvider } from '@app-builder/services/organization/organization-detail';
import { act, renderHook } from '@testing-library/react';
import { type ComponentProps, type ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useColumnPrefs } from './column-prefs';

type OrganizationDetails = Omit<ComponentProps<typeof OrganizationDetailsContextProvider>, 'children'>;

const table = (name: string) =>
  ({ name, fields: [{ name: 'id' }, { name: 'amount' }, { name: 'status' }] }) as TableModel;

function inOrganization(orgId: string) {
  const details = { org: { id: orgId }, currentUser: {}, organizations: [] } as unknown as OrganizationDetails;
  return ({ children }: { children: ReactNode }) => (
    <OrganizationDetailsContextProvider {...details}>{children}</OrganizationDetailsContextProvider>
  );
}

describe('useColumnPrefs', () => {
  beforeEach(() => localStorage.clear());

  it('persists the columns of a table and restores them on the next mount', () => {
    const saved = { visible: ['status', 'id'], pinned: ['status'] };
    const first = renderHook(() => useColumnPrefs(table('transactions')), { wrapper: inOrganization('org-1') });

    expect(first.result.current[0]).toEqual({ visible: ['id', 'amount', 'status'], pinned: [] });
    act(() => first.result.current[1](saved));
    expect(first.result.current[0]).toEqual(saved);
    first.unmount();

    const second = renderHook(() => useColumnPrefs(table('transactions')), { wrapper: inOrganization('org-1') });
    expect(second.result.current[0]).toEqual(saved);
  });

  it('keeps preferences separate per table and per organization', () => {
    const { result } = renderHook(() => useColumnPrefs(table('transactions')), { wrapper: inOrganization('org-1') });
    act(() => result.current[1]({ visible: ['status'], pinned: [] }));

    const otherTable = renderHook(() => useColumnPrefs(table('accounts')), { wrapper: inOrganization('org-1') });
    const otherOrg = renderHook(() => useColumnPrefs(table('transactions')), { wrapper: inOrganization('org-2') });

    expect(otherTable.result.current[0].visible).toEqual(['id', 'amount', 'status']);
    expect(otherOrg.result.current[0].visible).toEqual(['id', 'amount', 'status']);
  });
});
