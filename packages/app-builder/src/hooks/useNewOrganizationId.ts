import { AppConfigContext } from '@app-builder/contexts/AppConfigContext';
import { useChangeOrganizationIdMutation } from '@app-builder/queries/auth/new-organization-id';
import { logoutFn } from '@app-builder/server-fns/auth';
import { useClientServices } from '@app-builder/services/init-client';
import { useCsrfToken } from '@app-builder/utils/csrf-client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

export function useNewOrganizationId() {
  const appConfig = AppConfigContext.useValue();
  const clientServices = useClientServices();
  const changeOrganizationIdMutation = useChangeOrganizationIdMutation();
  const csrf = useCsrfToken();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { firebaseIdToken } = clientServices.authenticationClientService.authenticationClientRepository;

  const onOrganizationChanged = {
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
  };

  const changeOrganizationId = (newOrganizationId: string) => {
    // OIDC sessions have no Firebase client user. Ask the server to refresh the
    // stored provider credentials for the new organization instead of logging out.
    if (appConfig.auth.provider === 'oidc') {
      changeOrganizationIdMutation.mutate({ csrf, newOrganizationId }, onOrganizationChanged);
      return;
    }

    firebaseIdToken().then(
      (idToken: string) => {
        changeOrganizationIdMutation.mutate({ idToken, csrf, newOrganizationId }, onOrganizationChanged);
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
