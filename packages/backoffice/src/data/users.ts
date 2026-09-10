import { type CreateGlobalUserPayload, type UpdateGlobalUserPayload } from '@bo/schemas/user';
import { createGlobalUserFn, getUsersFn, updateGlobalUserFn } from '@bo/server-fns/users';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const listUsersQueryOptions = () =>
  queryOptions({
    queryKey: ['users'],
    queryFn: getUsersFn,
  });

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
