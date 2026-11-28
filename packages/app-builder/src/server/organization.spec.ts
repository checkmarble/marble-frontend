import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { describe, expect, it, vi } from 'vitest';

import { grantAccess } from './organization';

describe('grantAccess', () => {
  it('sends role bindings when replacing an organization grant', async () => {
    const replaceOrganizationGrant = vi.fn().mockResolvedValue(undefined);
    const api = { replaceOrganizationGrant } as unknown as MarbleCoreApi;
    const roles = [{ id: 'binding-id', role: 'ADMIN' }];

    await grantAccess(api, 'org-id', { tenantId: 'tenant-id', userId: 'user-id', roles });

    expect(replaceOrganizationGrant).toHaveBeenCalledWith(
      'tenant-id',
      'user-id',
      { roles },
      { organizationId: 'org-id' },
    );
  });
});
