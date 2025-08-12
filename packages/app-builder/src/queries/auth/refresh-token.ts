import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { serialize } from 'object-to-formdata';

const endpoint = getRoute('/ressources/auth/refresh');

export const useRefreshTokenMutation = () => {
  return useMutation({
    mutationKey: ['auth', 'refresh-token'],
    mutationFn: async ({ idToken, csrf }: { idToken: string; csrf: string }) => {
      return fetch(endpoint, {
        method: 'POST',
        body: serialize({ idToken, csrf }),
      });
    },
  });
};
