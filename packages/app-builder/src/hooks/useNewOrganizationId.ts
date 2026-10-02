import { useChangeOrganizationIdMutation } from '@app-builder/queries/auth/new-organization-id';
import { logoutFn } from '@app-builder/server-fns/auth';
import { useClientServices } from '@app-builder/services/init-client';
import { useCsrfToken } from '@app-builder/utils/csrf-client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

export function useNewOrganizationId() {
  const clientServices = useClientServices();
  const changeOrganizationIdMutation = useChangeOrganizationIdMutation();
  const csrf = useCsrfToken();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { firebaseIdToken } = clientServices.authenticationClientService.authenticationClientRepository;

  const changeOrganizationId = (newOrganizationId: string) => {
    firebaseIdToken().then(
      (idToken: string) => {
        changeOrganizationIdMutation.mutate(
          { idToken, csrf, newOrganizationId },
          {
            onSuccess: async () => {
              // reset everything with new org in the token
              queryClient.removeQueries();
              router.clearCache();
              try {
                await router.navigate({ to: '/app-router', replace: true });
              } finally {
                await router.invalidate({ sync: true });
              }
            },
          },
        );
      },
      () => {
        void logoutFn({
          data: { redirectTo: `${window.location.pathname}${window.location.search}` },
        });
      },
    );
  };

  return changeOrganizationId;
}
