import { type MergeTenantsPayload, type RenameTenantPayload } from '@bo/schemas/tenant';
import { listTenantsFn, mergeTenantsFn, renameTenantFn } from '@bo/server-fns/tenants';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import type { OrganizationDto } from 'marble-api/generated/marblecore-api';

export type Tenant = Awaited<ReturnType<typeof listTenantsFn>>[number];
export type TenantOrganization = Pick<OrganizationDto, 'id' | 'name'>;
export type OrganizationsByTenant = ReadonlyMap<string, TenantOrganization[]>;

export const groupOrganizationsByTenant = (organizations: OrganizationDto[]): OrganizationsByTenant => {
  const grouped = new Map<string, TenantOrganization[]>();
  const sorted = [...organizations].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  for (const { id, name, tenant_id } of sorted) {
    grouped.set(tenant_id, [...(grouped.get(tenant_id) ?? []), { id, name }]);
  }
  return grouped;
};

export const listTenantsQueryOptions = () =>
  queryOptions({
    queryKey: ['tenants'],
    queryFn: listTenantsFn,
  });

export const useRenameTenantMutationOptions = () => {
  const renameTenant = useServerFn(renameTenantFn);

  return mutationOptions({
    mutationFn: (payload: RenameTenantPayload) => renameTenant({ data: payload }),
    meta: {
      invalidates: () => [['tenants']],
    },
  });
};

export const useMergeTenantsMutationOptions = () => {
  const mergeTenants = useServerFn(mergeTenantsFn);

  return mutationOptions({
    mutationFn: (payload: MergeTenantsPayload) => mergeTenants({ data: payload }),
    meta: {
      invalidates: () => [['tenants'], ['organizations']],
    },
  });
};
