import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { describe, expect, it, vi } from 'vitest';

import { makeGetOrganizationRepository } from './OrganizationRepository';

describe('organization repository', () => {
  it('sends role bindings when replacing an organization grant', async () => {
    const replaceOrganizationGrant = vi.fn().mockResolvedValue(undefined);
    const repository = makeGetOrganizationRepository()(
      { replaceOrganizationGrant } as unknown as MarbleCoreApi,
      'org-id',
    );
    const roles = [{ id: 'binding-id', role: 'ADMIN' }];

    await repository.grantAccess({ tenantId: 'tenant-id', userId: 'user-id', roles });

    expect(replaceOrganizationGrant).toHaveBeenCalledWith(
      'tenant-id',
      'user-id',
      { roles },
      { organizationId: 'org-id' },
    );
  });
});
