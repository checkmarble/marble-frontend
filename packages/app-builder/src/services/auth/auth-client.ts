import { type ReauthResult, useFirebaseAuthClient } from '@app-builder/services/auth/firebase-auth-client';
import { useCsrfToken } from '@app-builder/utils/csrf-client';
import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes, type MultiFactorResolver, type TotpSecret } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export class AccountExistsWithDifferentCredential extends Error {}
export class PopupBlockedByClient extends Error {}
export class NetworkRequestFailed extends Error {}
export class EmailUnverified extends Error {}
export class WrongPasswordError extends Error {}
export class InvalidLoginCredentials extends Error {}
export class TooManyRequest extends Error {}
export class InvalidVerificationCode extends Error {}
export class RequiresRecentLogin extends Error {}

function throwMappedMfaError(error: unknown): never {
  console.error('[auth] MFA operation failed', error);
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case AuthErrorCodes.INVALID_CODE:
      case AuthErrorCodes.MISSING_CODE:
      case AuthErrorCodes.CODE_EXPIRED:
        throw new InvalidVerificationCode();
      case AuthErrorCodes.CREDENTIAL_TOO_OLD_LOGIN_AGAIN:
        throw new RequiresRecentLogin();
      case AuthErrorCodes.NETWORK_REQUEST_FAILED:
        throw new NetworkRequestFailed();
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        throw new TooManyRequest();
    }
  }
  throw error;
}

export function useGetEnrolledMfaFactors() {
  const authClient = useFirebaseAuthClient();
  return () => authClient.getEnrolledMfaFactors();
}

export function useStartTotpEnrollment() {
  const authClient = useFirebaseAuthClient();
  return async () => {
    try {
      return await authClient.startTotpEnrollment();
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useFinalizeTotpEnrollment() {
  const authClient = useFirebaseAuthClient();
  return async (secret: TotpSecret, verificationCode: string, displayName: string) => {
    try {
      await authClient.finalizeTotpEnrollment(secret, verificationCode, displayName);
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useUnenrollMfaFactor() {
  const authClient = useFirebaseAuthClient();
  return async (factorUid: string) => {
    try {
      await authClient.unenrollMfaFactor(factorUid);
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useGetCurrentUserProviderIds() {
  const authClient = useFirebaseAuthClient();
  return () => authClient.getCurrentUserProviderIds();
}

export function useReauthenticateWithPassword() {
  const authClient = useFirebaseAuthClient();
  return async (password: string): Promise<ReauthResult> => {
    try {
      return await authClient.reauthenticateWithPassword(password);
    } catch (error) {
      console.error('[auth] password reauthentication failed', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.USER_DELETED:
          case AuthErrorCodes.INVALID_PASSWORD:
          case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
            throw new InvalidLoginCredentials();
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
          case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
            throw new TooManyRequest();
        }
      }
      throw error;
    }
  };
}

// Resolves to the reauth result (possibly requiring an MFA challenge), or `{ cancelled: true }`
// when the user dismissed the popup.
export function useReauthenticateWithOAuth() {
  const authClient = useFirebaseAuthClient();
  return async (providerId: 'google.com' | 'microsoft.com'): Promise<ReauthResult | { cancelled: true }> => {
    try {
      return await authClient.reauthenticateWithOAuth(providerId);
    } catch (error) {
      console.error('[auth] OAuth reauthentication failed', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.POPUP_CLOSED_BY_USER:
          case AuthErrorCodes.EXPIRED_POPUP_REQUEST:
          case AuthErrorCodes.USER_CANCELLED:
            return { cancelled: true };
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

function useOAuthSignIn(signIn: 'googleSignIn' | 'microsoftSignIn') {
  const authClient = useFirebaseAuthClient();
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useCsrfToken();

  return async () => {
    try {
      const result = await authClient[signIn](language);
      if ('mfaRequired' in result) {
        return { mfaRequired: true as const, resolver: result.resolver };
      }
      return { mfaRequired: false as const, idToken: result.idToken, refreshToken: result.refreshToken, csrf };
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
          case AuthErrorCodes.INVALID_IDP_RESPONSE:
            throw new InvalidLoginCredentials();
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
        }
      }
      throw error;
    }
  };
}

export function useGoogleSignIn() {
  return useOAuthSignIn('googleSignIn');
}

export function useMicrosoftSignIn() {
  return useOAuthSignIn('microsoftSignIn');
}

export function useEmailAndPasswordSignIn() {
  const authClient = useFirebaseAuthClient();
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useCsrfToken();

  return async (email: string, password: string) => {
    try {
      const result = await authClient.emailAndPasswordSignIn(language, email, password);
      if ('mfaRequired' in result) {
        return { mfaRequired: true as const, resolver: result.resolver };
      }
      if (!result.emailVerified) {
        throw new EmailUnverified();
      }
      return { mfaRequired: false as const, idToken: result.idToken, refreshToken: result.refreshToken, csrf };
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.USER_DELETED:
          case AuthErrorCodes.INVALID_PASSWORD:
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

export function useResolveMfaTotpSignIn() {
  const authClient = useFirebaseAuthClient();
  const csrf = useCsrfToken();

  return async (resolver: MultiFactorResolver, enrollmentId: string, verificationCode: string) => {
    try {
      const { idToken, refreshToken } = await authClient.resolveMfaTotpSignIn(resolver, enrollmentId, verificationCode);
      return { idToken, refreshToken, csrf };
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useResendEmailVerification() {
  const authClient = useFirebaseAuthClient();
  const {
    i18n: { language },
  } = useTranslation();

  return async (logout: () => void) => {
    try {
      await authClient.resendEmailVerification(language, logout);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
          case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
            throw new TooManyRequest();
        }
      }
      throw error;
    }
  };
}

export function useSendPasswordResetEmail() {
  const authClient = useFirebaseAuthClient();
  const {
    i18n: { language },
  } = useTranslation();

  return async (email: string) => {
    try {
      await authClient.sendPasswordResetEmail(language, email);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            throw new NetworkRequestFailed();
          case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
            throw new TooManyRequest();
        }
      }
      throw error;
    }
  };
}
