import { type AuthenticationClientRepository } from '@app-builder/repositories/AuthenticationRepository';
import { useTranslation } from 'react-i18next';
import { useAuthenticityToken } from 'remix-utils';

export function makeAuthenticationClientService(
  authenticationClientRepositoryPromise: Promise<AuthenticationClientRepository>
) {
  return {
    authenticationClientRepositoryPromise,
  };
}

export type AuthenticationClientService = ReturnType<
  typeof makeAuthenticationClientService
>;

export function useGoogleSignIn({
  authenticationClientRepositoryPromise,
}: AuthenticationClientService) {
  const { i18n } = useTranslation();
  const csrf = useAuthenticityToken();

  return async () => {
    try {
      const authenticationClientRepository =
        await authenticationClientRepositoryPromise;

      const idToken = await authenticationClientRepository.googleSignIn(
        i18n.language
      );
      return { idToken, csrf };
    } catch (error) {
      //TODO: handle errors correctly for UI
      console.error(error);
    }
  };
}
