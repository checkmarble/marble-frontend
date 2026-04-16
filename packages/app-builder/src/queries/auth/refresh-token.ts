import { refreshTokenFn } from '@app-builder/server-fns/auth';
import { useMutation } from '@tanstack/react-query';

export const useRefreshTokenMutation = () => {
  return useMutation({
    mutationKey: ['auth', 'refresh-token'],
    mutationFn: async ({ idToken, csrf }: { idToken: string; csrf: string }) => {
      return refreshTokenFn({ data: { idToken, csrf } });
    },
  });
};
