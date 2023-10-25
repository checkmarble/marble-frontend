import { type AuthenticationClientRepository } from '@app-builder/repositories/AuthenticationRepository';
import { getClientEnv } from '@app-builder/utils/environment.client';
import { marbleApi } from '@marble-api';
import { FirebaseError } from 'firebase/app';
import { useTranslation } from 'react-i18next';
import { useAuthenticityToken } from 'remix-utils';

export function makeAuthenticationClientService(
  authenticationClientRepository: AuthenticationClientRepository
) {
  return {
    authenticationClientRepository,
  };
}

export type AuthenticationClientService = ReturnType<
  typeof makeAuthenticationClientService
>;

export function useGoogleSignIn({
  authenticationClientRepository,
}: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useAuthenticityToken();

  return async () => {
    try {
      const idToken = await authenticationClientRepository.googleSignIn(
        language
      );
      return { idToken, csrf };
    } catch (error) {
      //TODO: handle errors correctly for UI
      console.error(error);
    }
  };
}

export function useEmailAndPasswordSignIn({
  authenticationClientRepository,
}: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useAuthenticityToken();

  return async (email: string, password: string) => {
    try {
      const idToken =
        await authenticationClientRepository.emailAndPasswordSignIn(
          language,
          email,
          password
        );
      return { idToken, csrf };
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
            throw new UserNotFoundError();
          case 'auth/wrong-password':
            throw new WrongPasswordError();
          case 'auth/invalid-login-credentials':
            throw new InvalidLoginCredentials();
        }
      }
      throw error;
    }
  };
}

export class UserNotFoundError extends Error {}
export class WrongPasswordError extends Error {}
export class InvalidLoginCredentials extends Error {}

export function useBackendInfo({
  authenticationClientRepository,
}: AuthenticationClientService) {
  const backendUrl = getClientEnv('MARBLE_API_DOMAIN');

  const accessToken = async () => {
    const firebaseIdToken =
      await authenticationClientRepository.firebaseIdToken();
    const token = await marbleApi.postToken(
      {
        authorization: `Bearer ${firebaseIdToken}`,
      },
      {
        baseUrl: backendUrl,
      }
    );

    return token.access_token;
  };

  return {
    accessToken,
    backendUrl,
  };
}
