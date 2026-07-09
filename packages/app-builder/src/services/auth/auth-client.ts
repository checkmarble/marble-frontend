import {
  type AuthenticationClientRepository,
  type ReauthResult,
} from '@app-builder/repositories/AuthenticationRepository';
import { useCsrfToken } from '@app-builder/utils/csrf-client';
import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes, type MultiFactorResolver, type TotpSecret } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

export function makeAuthenticationClientService(authenticationClientRepository: AuthenticationClientRepository) {
  return {
    authenticationClientRepository,
  };
}

export type AuthenticationClientService = ReturnType<typeof makeAuthenticationClientService>;

export class AccountExistsWithDifferentCredential extends Error {}
export class PopupBlockedByClient extends Error {}
export class NetworkRequestFailed extends Error {}
export class EmailUnverified extends Error {}
export class UserNotFoundError extends Error {}
export class WrongPasswordError extends Error {}
export class InvalidLoginCredentials extends Error {}
export class EmailExistsError extends Error {}
export class WeakPasswordError extends Error {}
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

export function useGetEnrolledMfaFactors({ authenticationClientRepository }: AuthenticationClientService) {
  return () => authenticationClientRepository.getEnrolledMfaFactors();
}

export function useStartTotpEnrollment({ authenticationClientRepository }: AuthenticationClientService) {
  return async () => {
    try {
      return await authenticationClientRepository.startTotpEnrollment();
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useFinalizeTotpEnrollment({ authenticationClientRepository }: AuthenticationClientService) {
  return async (secret: TotpSecret, verificationCode: string, displayName: string) => {
    try {
      await authenticationClientRepository.finalizeTotpEnrollment(secret, verificationCode, displayName);
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useUnenrollMfaFactor({ authenticationClientRepository }: AuthenticationClientService) {
  return async (factorUid: string) => {
    try {
      await authenticationClientRepository.unenrollMfaFactor(factorUid);
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useGetCurrentUserProviderIds({ authenticationClientRepository }: AuthenticationClientService) {
  return () => authenticationClientRepository.getCurrentUserProviderIds();
}

export function useReauthenticateWithPassword({ authenticationClientRepository }: AuthenticationClientService) {
  return async (password: string): Promise<ReauthResult> => {
    try {
      return await authenticationClientRepository.reauthenticateWithPassword(password);
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
export function useReauthenticateWithOAuth({ authenticationClientRepository }: AuthenticationClientService) {
  return async (providerId: 'google.com' | 'microsoft.com'): Promise<ReauthResult | { cancelled: true }> => {
    try {
      return await authenticationClientRepository.reauthenticateWithOAuth(providerId);
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

export function useGoogleSignIn({ authenticationClientRepository }: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useCsrfToken();

  return async () => {
    try {
      const result = await authenticationClientRepository.googleSignIn(language);
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

export function useMicrosoftSignIn({ authenticationClientRepository }: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useCsrfToken();

  return async () => {
    try {
      const result = await authenticationClientRepository.microsoftSignIn(language);
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

export function useEmailAndPasswordSignIn({ authenticationClientRepository }: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useCsrfToken();

  return async (email: string, password: string) => {
    try {
      const result = await authenticationClientRepository.emailAndPasswordSignIn(language, email, password);
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

export function useResolveMfaTotpSignIn({ authenticationClientRepository }: AuthenticationClientService) {
  const csrf = useCsrfToken();

  return async (resolver: MultiFactorResolver, enrollmentId: string, verificationCode: string) => {
    try {
      const { idToken, refreshToken } = await authenticationClientRepository.resolveMfaTotpSignIn(
        resolver,
        enrollmentId,
        verificationCode,
      );
      return { idToken, refreshToken, csrf };
    } catch (error) {
      throwMappedMfaError(error);
    }
  };
}

export function useEmailAndPasswordSignUp({ authenticationClientRepository }: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();
  const csrf = useCsrfToken();

  return async (email: string, password: string) => {
    try {
      const idToken = await authenticationClientRepository.emailAndPassswordSignUp(language, email, password);
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
          case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
            throw new TooManyRequest();
        }
      }
      throw error;
    }
  };
}

export function useResendEmailVerification({ authenticationClientRepository }: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();

  return async (logout: () => void) => {
    try {
      await authenticationClientRepository.resendEmailVerification(language, logout);
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

export function useSendPasswordResetEmail({ authenticationClientRepository }: AuthenticationClientService) {
  const {
    i18n: { language },
  } = useTranslation();

  return async (email: string) => {
    try {
      await authenticationClientRepository.sendPasswordResetEmail(language, email);
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
