import { type AuthenticationClientRepository } from '@app-builder/repositories/AuthenticationRepository';
import { getClientEnv } from '@app-builder/utils/environment';
import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';
import { marblecoreApi } from 'marble-api';
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
      if (error instanceof FirebaseError) {
        switch (error.code) {
          // Fired when the user close the popup without logging in, this shouldn't raise an error on our side
          case AuthErrorCodes.POPUP_CLOSED_BY_USER:
          case AuthErrorCodes.EXPIRED_POPUP_REQUEST:
          case AuthErrorCodes.USER_CANCELLED:
            return;
          case AuthErrorCodes.NEED_CONFIRMATION:
            throw new AccountExistsWithDifferentCredential();
          case AuthErrorCodes.POPUP_BLOCKED:
            throw new PopupBlockedByClient();
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
        }
      }
      throw error;
    }
  };
}

export function useMicrosoftSignIn({
  authenticationClientRepository,
}: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useAuthenticityToken();

  return async () => {
    try {
      const idToken =
        await authenticationClientRepository.microsoftSignIn(language);
      return { idToken, csrf };
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          // Fired when the user close the popup without logging in, this shouldn't raise an error on our side
          case AuthErrorCodes.POPUP_CLOSED_BY_USER:
          case AuthErrorCodes.EXPIRED_POPUP_REQUEST:
          case AuthErrorCodes.USER_CANCELLED:
            return;
          case AuthErrorCodes.NEED_CONFIRMATION:
            throw new AccountExistsWithDifferentCredential();
          case AuthErrorCodes.POPUP_BLOCKED:
            throw new PopupBlockedByClient();
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
        }
      }
      throw error;
    }
  };
}

export class AccountExistsWithDifferentCredential extends Error {}
export class PopupBlockedByClient extends Error {}
export class NetworkRequestFailed extends Error {}

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
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
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
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
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
  const backendUrl = getClientEnv('MARBLE_API_DOMAIN_CLIENT');

  const getAccessToken = async () => {
    try {
      const firebaseIdToken =
        await authenticationClientRepository.firebaseIdToken();
      const token = await marblecoreApi.postToken(
        {
          authorization: `Bearer ${firebaseIdToken}`,
        },
        {
          baseUrl: backendUrl,
        },
      );

      return { accessToken: token.access_token, success: true as const };
    } catch (error) {
      return { error, success: false as const };
    }
  };

  return {
    getAccessToken,
    backendUrl,
  };
}
