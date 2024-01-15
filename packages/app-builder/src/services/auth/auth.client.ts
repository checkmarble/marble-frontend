import { type AuthenticationClientRepository } from '@app-builder/repositories/AuthenticationRepository';
import { getClientEnv } from '@app-builder/utils/environment.client';
import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';
import { marbleApi } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { useAuthenticityToken } from 'remix-utils/csrf/react';

export function makeAuthenticationClientService(
  authenticationClientRepository: AuthenticationClientRepository,
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
      const idToken =
        await authenticationClientRepository.googleSignIn(language);
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
      const result =
        await authenticationClientRepository.emailAndPasswordSignIn(
          language,
          email,
          password,
        );
      if (!result.emailVerified) {
        throw new EmailUnverified();
      }
      return { idToken: result.idToken, csrf };
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.USER_DELETED:
            throw new UserNotFoundError();
          case AuthErrorCodes.INVALID_PASSWORD:
            throw new WrongPasswordError();
          case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
            throw new InvalidLoginCredentials();
        }
      }
      throw error;
    }
  };
}

export class EmailUnverified extends Error {}
export class UserNotFoundError extends Error {}
export class WrongPasswordError extends Error {}
export class InvalidLoginCredentials extends Error {}

export function useEmailAndPasswordSignUp({
  authenticationClientRepository,
}: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useAuthenticityToken();

  return async (email: string, password: string) => {
    try {
      const idToken =
        await authenticationClientRepository.emailAndPassswordSignUp(
          language,
          email,
          password,
        );
      return { idToken, csrf };
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.EMAIL_EXISTS:
            throw new EmailExistsError();
          case AuthErrorCodes.WEAK_PASSWORD:
            throw new WeakPasswordError();
        }
      }
      throw error;
    }
  };
}

export class EmailExistsError extends Error {}
export class WeakPasswordError extends Error {}

export function useResendEmailVerification({
  authenticationClientRepository,
}: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();

  return async (logout: () => void) => {
    await authenticationClientRepository.resendEmailVerification(
      language,
      logout,
    );
  };
}

export function useSendPasswordResetEmail({
  authenticationClientRepository,
}: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();

  return async (email: string) => {
    await authenticationClientRepository.sendPasswordResetEmail(
      language,
      email,
    );
  };
}

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
      },
    );

    return token.access_token;
  };

  return {
    accessToken,
    backendUrl,
  };
}
