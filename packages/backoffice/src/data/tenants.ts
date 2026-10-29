import { type MergeTenantsPayload, type RenameTenantPayload } from '@bo/schemas/tenant';
import {
  type CreateTenantOidcDomainPayload,
  type DeleteTenantOidcDomainPayload,
  type PutTenantOidcConfigurationPayload,
} from '@bo/schemas/tenant-oidc';
import {
  createTenantOidcDomainFn,
  deleteTenantOidcConfigurationFn,
  deleteTenantOidcDomainFn,
  listTenantOidcDomainsFn,
  listTenantsFn,
  mergeTenantsFn,
  putTenantOidcConfigurationFn,
  renameTenantFn,
} from '@bo/server-fns/tenants';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import type { OrganizationDto } from 'marble-api/generated/marblecore-api';

export type Tenant = Awaited<ReturnType<typeof listTenantsFn>>[number];
export type TenantOidcConfiguration = NonNullable<Tenant['oidc_configuration']>;
export type TenantOidcDomain = Awaited<ReturnType<typeof listTenantOidcDomainsFn>>[number];
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

export const listTenantOidcDomainsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ['tenants', tenantId, 'domains'],
    queryFn: () => listTenantOidcDomainsFn({ data: { tenantId } }),
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

export const usePutTenantOidcConfigurationMutationOptions = () => {
  const putTenantOidcConfiguration = useServerFn(putTenantOidcConfigurationFn);

  return mutationOptions({
    mutationFn: (payload: PutTenantOidcConfigurationPayload) => putTenantOidcConfiguration({ data: payload }),
    meta: {
      invalidates: () => [['tenants']],
    },
  });
};

export const useDeleteTenantOidcConfigurationMutationOptions = () => {
  const deleteTenantOidcConfiguration = useServerFn(deleteTenantOidcConfigurationFn);

  return mutationOptions({
    mutationFn: (tenantId: string) => deleteTenantOidcConfiguration({ data: { tenantId } }),
    meta: {
      invalidates: () => [['tenants']],
    },
  });
};

export const useCreateTenantOidcDomainMutationOptions = () => {
  const createTenantOidcDomain = useServerFn(createTenantOidcDomainFn);

  return mutationOptions({
    mutationFn: (payload: CreateTenantOidcDomainPayload) => createTenantOidcDomain({ data: payload }),
    meta: {
      invalidates: ({ tenantId }: CreateTenantOidcDomainPayload) => [['tenants', tenantId, 'domains']],
    },
  });
};

export const useDeleteTenantOidcDomainMutationOptions = () => {
  const deleteTenantOidcDomain = useServerFn(deleteTenantOidcDomainFn);

  return mutationOptions({
    mutationFn: (payload: DeleteTenantOidcDomainPayload) => deleteTenantOidcDomain({ data: payload }),
    meta: {
      invalidates: ({ tenantId }: DeleteTenantOidcDomainPayload) => [['tenants', tenantId, 'domains']],
    },
  });
};
