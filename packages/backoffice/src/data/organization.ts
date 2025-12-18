import { PatchOrganizationFeaturesPayload } from '@bo/schemas/features';
import { OrgImportSpec } from '@bo/schemas/org-import';
import { CreateUserPayload } from '@bo/schemas/user';
import {
  createEmptyOrganizationFn,
  createOrganizationUserFn,
  getOrganizationFeaturesFn,
  getOrganizationFn,
  getOrganizationsFn,
  getOrganizationUsersFn,
  importOrganizationFn,
  patchOrganizationFeaturesFn,
} from '@bo/server-fns/organization';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

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

// -------- Mutations --------

export const patchOrganizationFeatures = () =>
  mutationOptions({
    mutationFn: (payload: { orgId: string; features: PatchOrganizationFeaturesPayload }) =>
      patchOrganizationFeaturesFn({ data: payload }),
    meta: {
      invalidates: (data: { orgId: string }) => [['organizations', data.orgId, 'features']],
    },
  });

export const createOrganizationUser = () =>
  mutationOptions({
    mutationFn: (payload: { orgId: string; userPayload: CreateUserPayload }) =>
      createOrganizationUserFn({ data: payload }),
    meta: {
      invalidates: (data: { orgId: string }) => [['organizations', data.orgId, 'users']],
    },
  });

export const createEmptyOrganization = () =>
  mutationOptions({
    mutationFn: (payload: { name: string }) => createEmptyOrganizationFn({ data: payload }),
    meta: {
      invalidates: () => [['organizations']],
    },
  });

export const importOrganization = () =>
  mutationOptions({
    mutationFn: (payload: OrgImportSpec) => importOrganizationFn({ data: payload }),
    meta: {
      invalidates: () => [['organizations']],
    },
  });
