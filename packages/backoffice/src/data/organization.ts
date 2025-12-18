import { getOrganizationFn, getOrganizationsFn, getOrganizationUsersFn } from '@bo/server-fns/organization';
import { queryOptions } from '@tanstack/react-query';

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
