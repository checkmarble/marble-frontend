import { SetLanguagePayload, setLanguageFn } from '@app-builder/server-fns/user';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useSetLanguageMutation = () => {
  const setLanguage = useServerFn(setLanguageFn);

  return useMutation({
    mutationKey: ['settings', 'set-language'],
    mutationFn: async (payload: SetLanguagePayload) => setLanguage({ data: payload }),
  });
};
