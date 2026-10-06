import { dashboardQueryKey } from '@bo/data/dashboard';
import { PatchOrganizationFeaturesPayload } from '@bo/schemas/features';
import { OrgImportSpec } from '@bo/schemas/org-import';
import { CreateUserPayload } from '@bo/schemas/user';
import {
  applyOrganizationArchetypeFn,
  createEmptyOrganizationFn,
  createOrganizationUserFn,
  getOrganizationClientObjectFn,
  getOrganizationDataModelFn,
  getOrganizationFeaturesFn,
  getOrganizationFn,
  getOrganizationsFn,
  getOrganizationUsersFn,
  importOrganizationFn,
  listOrganizationArchetypesFn,
  patchOrganizationFeaturesFn,
} from '@bo/server-fns/organization';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

// ------- Queries -------

export const listOrganizationsQueryOptions = () =>
  queryOptions({
    queryKey: ['organizations'],
    queryFn: getOrganizationsFn,
  });

export const getOrganizationQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ['organizations', orgId],
    queryFn: () => getOrganizationFn({ data: { orgId } }),
  });

export const listOrganizationUsersQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ['organizations', orgId, 'users'],
    queryFn: () => getOrganizationUsersFn({ data: { orgId } }),
  });

export const listOrganizationFeatures = (orgId: string) =>
  queryOptions({
    queryKey: ['organizations', orgId, 'features'],
    queryFn: () => getOrganizationFeaturesFn({ data: { orgId } }),
  });

export const getOrganizationDataModelQueryOptions = (orgId: string) =>
  queryOptions({
    queryKey: ['organizations', orgId, 'data-model'],
    queryFn: () => getOrganizationDataModelFn({ data: { orgId } }),
  });

export const getOrganizationClientObjectQueryOptions = ({
  orgId,
  tableName,
  objectId,
}: {
  orgId: string;
  tableName: string;
  objectId: string;
}) =>
  queryOptions({
    queryKey: ['organizations', orgId, 'client-data', tableName, objectId],
    queryFn: () => getOrganizationClientObjectFn({ data: { orgId, tableName, objectId } }),
  });

export const listOrganizationArchetypes = () =>
  queryOptions({
    queryKey: ['organization-archetypes'],
    queryFn: listOrganizationArchetypesFn,
  });

// -------- Mutations --------

export const applyOrganizationArchetype = () =>
  mutationOptions({
    mutationFn: (payload: {
      name: string;
      org_name: string;
      environment: 'production' | 'staging';
      admins: { email: string; first_name?: string; last_name?: string }[];
    }) => applyOrganizationArchetypeFn({ data: payload }),
    meta: {
      invalidates: () => [['organizations'], ['tenants'], ['users'], dashboardQueryKey],
    },
  });

export const patchOrganizationFeatures = () =>
  mutationOptions({
    mutationFn: (payload: { orgId: string; features: PatchOrganizationFeaturesPayload }) =>
      patchOrganizationFeaturesFn({ data: payload }),
    meta: {
      invalidates: (data: { orgId: string }) => [['organizations', data.orgId, 'features']],
    },
  });

export const createEmptyOrganization = () =>
  mutationOptions({
    mutationFn: (payload: { name: string; environment: 'production' | 'staging' }) =>
      createEmptyOrganizationFn({ data: payload }),
    meta: {
      invalidates: () => [['organizations'], ['tenants'], dashboardQueryKey],
    },
  });

export const importOrganization = () =>
  mutationOptions({
    mutationFn: (payload: OrgImportSpec) => importOrganizationFn({ data: payload }),
    meta: {
      invalidates: () => [['organizations'], ['tenants'], ['users'], dashboardQueryKey],
    },
  });

// -------- Mutation hooks --------

/**
 * `useServerFn` is required here: TanStack Start does not rethrow redirects on the client
 * (it only rethrows `Error` instances), so a redirect thrown by `needAuth` on an expired
 * session would otherwise resolve as mutation *data* and read as a success.
 */
export const useCreateOrganizationUserMutationOptions = () => {
  const createOrganizationUser = useServerFn(createOrganizationUserFn);

  return mutationOptions({
    mutationFn: (payload: { orgId: string; userPayload: CreateUserPayload }) =>
      createOrganizationUser({ data: payload }),
    meta: {
      invalidates: (data: { orgId: string }) => [['organizations', data.orgId, 'users'], ['users'], dashboardQueryKey],
    },
  });
};
