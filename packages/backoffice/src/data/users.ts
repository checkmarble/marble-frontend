import {
  type CreateGlobalUserPayload,
  type OrganizationGrantTarget,
  type ReplaceOrganizationGrantPayload,
  type UpdateGlobalUserPayload,
} from '@bo/schemas/user';
import {
  createGlobalUserFn,
  getUserGrantsFn,
  getUsersFn,
  replaceOrganizationGrantFn,
  revokeOrganizationGrantFn,
  updateGlobalUserFn,
} from '@bo/server-fns/users';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const listUsersQueryOptions = () =>
  queryOptions({
    queryKey: ['users'],
    queryFn: getUsersFn,
  });

export const userGrantsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId, 'grants'],
    queryFn: () => getUserGrantsFn({ data: { userId } }),
  });

export type UserGrant = Awaited<ReturnType<typeof getUserGrantsFn>>[number];

// `['users']` also covers the user's grants query, and the users table shows grants too.
const grantInvalidations = ({ organizationId }: OrganizationGrantTarget) => [
  ['users'],
  ['organizations', organizationId, 'users'],
];

export const useCreateGlobalUserMutationOptions = () => {
  const createGlobalUser = useServerFn(createGlobalUserFn);

  return mutationOptions({
    mutationFn: (payload: CreateGlobalUserPayload) => createGlobalUser({ data: payload }),
    meta: {
      invalidates: () => [['users']],
    },
  });
};

export const useUpdateGlobalUserMutationOptions = () => {
  const updateGlobalUser = useServerFn(updateGlobalUserFn);

  return mutationOptions({
    mutationFn: (payload: UpdateGlobalUserPayload) => updateGlobalUser({ data: payload }),
    meta: {
      invalidates: () => [['users']],
    },
  });
};

export const useReplaceOrganizationGrantMutationOptions = () => {
  const replaceOrganizationGrant = useServerFn(replaceOrganizationGrantFn);

  return mutationOptions({
    mutationFn: (payload: ReplaceOrganizationGrantPayload) => replaceOrganizationGrant({ data: payload }),
    meta: {
      invalidates: grantInvalidations,
    },
  });
};

export const useRevokeOrganizationGrantMutationOptions = () => {
  const revokeOrganizationGrant = useServerFn(revokeOrganizationGrantFn);

  return mutationOptions({
    mutationFn: (payload: OrganizationGrantTarget) => revokeOrganizationGrant({ data: payload }),
    meta: {
      invalidates: grantInvalidations,
    },
  });
};
