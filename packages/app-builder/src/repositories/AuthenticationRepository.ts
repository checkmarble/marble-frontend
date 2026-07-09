import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';
import { AppConfig } from '@app-builder/models/app-config';
import { adaptMfaFactor, type MfaFactor } from '@app-builder/models/mfa';
import { FirebaseError } from 'firebase/app';
import {
  AuthErrorCodes,
  type MultiFactorError,
  type MultiFactorResolver,
  type TotpSecret,
  type User,
} from 'firebase/auth';

export interface TotpEnrollmentParams {
  secret: TotpSecret;
  qrCodeUrl: string;
  secretKey: string;
}

// Reauthentication of an MFA-enrolled user triggers a second-factor challenge: Firebase
// throws `multi-factor-auth-required`, and the caller must resolve it with the resolver.
export type ReauthResult = { mfaRequired: false } | { mfaRequired: true; resolver: MultiFactorResolver };

export type EmailAndPasswordSignInResult =
  | { idToken: string; refreshToken: string; emailVerified: true }
  | { emailVerified: false }
  | { mfaRequired: true; resolver: MultiFactorResolver };

export type OAuthSignInResult =
  | { idToken: string; refreshToken: string }
  | { mfaRequired: true; resolver: MultiFactorResolver };

export interface AuthenticationClientRepository {
  getCurrentUser: () => User | null;
  googleSignIn: (locale: string) => Promise<OAuthSignInResult>;
  microsoftSignIn: (locale: string) => Promise<OAuthSignInResult>;
  emailAndPasswordSignIn: (locale: string, email: string, password: string) => Promise<EmailAndPasswordSignInResult>;
  emailAndPassswordSignUp: (locale: string, email: string, password: string) => Promise<void>;
  resendEmailVerification: (locale: string, logout: () => void) => Promise<void>;
  sendPasswordResetEmail: (locale: string, email: string) => Promise<void>;
  firebaseIdToken: () => Promise<string>;
  getEnrolledMfaFactors: () => Promise<MfaFactor[]>;
  startTotpEnrollment: () => Promise<TotpEnrollmentParams>;
  finalizeTotpEnrollment: (secret: TotpSecret, verificationCode: string, displayName: string) => Promise<void>;
  resolveMfaTotpSignIn: (
    resolver: MultiFactorResolver,
    enrollmentId: string,
    verificationCode: string,
  ) => Promise<{ idToken: string; refreshToken: string }>;
  unenrollMfaFactor: (factorUid: string) => Promise<void>;
  getCurrentUserProviderIds: () => Promise<string[]>;
  reauthenticateWithPassword: (password: string) => Promise<ReauthResult>;
  reauthenticateWithOAuth: (providerId: 'google.com' | 'microsoft.com') => Promise<ReauthResult>;
  isFirebaseEmulator: boolean;
}

export function getAuthenticationClientRepository(
  appConfig: AppConfig,
  firebaseClient: FirebaseClientWrapper,
): AuthenticationClientRepository {
  function getClientAuth(locale: string) {
    const clientAuth = firebaseClient.clientAuth;
    if (locale) {
      clientAuth.languageCode = locale;
    } else {
      clientAuth.useDeviceLanguage();
    }
    return clientAuth;
  }

  async function oauthSignIn(
    locale: string,
    provider: Parameters<typeof firebaseClient.signInWithOAuth>[1],
  ): Promise<OAuthSignInResult> {
    const auth = getClientAuth(locale);
    // Logout before sign in to avoid grant token firebase error
    await firebaseClient.logout(auth);
    try {
      const credential = await firebaseClient.signInWithOAuth(auth, provider);
      return {
        idToken: await credential.user.getIdToken(),
        refreshToken: credential.user.refreshToken,
      };
    } catch (error) {
      if (error instanceof FirebaseError && error.code === AuthErrorCodes.MFA_REQUIRED) {
        const resolver = firebaseClient.getMultiFactorResolver(auth, error as MultiFactorError);
        return { mfaRequired: true as const, resolver };
      }
      throw error;
    }
  }

  function googleSignIn(locale: string) {
    return oauthSignIn(locale, firebaseClient.googleAuthProvider);
  }

  function microsoftSignIn(locale: string) {
    return oauthSignIn(locale, firebaseClient.microsoftAuthProvider);
  }

  async function emailAndPasswordSignIn(
    locale: string,
    email: string,
    password: string,
  ): Promise<EmailAndPasswordSignInResult> {
    const auth = getClientAuth(locale);
    // Logout before sign in to avoid grant token firebase error
    await firebaseClient.logout(auth);
    let credential: Awaited<ReturnType<typeof firebaseClient.signInWithEmailAndPassword>>;
    try {
      credential = await firebaseClient.signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === AuthErrorCodes.MFA_REQUIRED) {
        const resolver = firebaseClient.getMultiFactorResolver(auth, error as MultiFactorError);
        return { mfaRequired: true as const, resolver };
      }
      throw error;
    }
    if (!credential.user.emailVerified) {
      return { emailVerified: false as const };
    }
    return {
      idToken: await credential.user.getIdToken(),
      refreshToken: credential.user.refreshToken,
      emailVerified: true as const,
    };
  }

  const emailVerificationActionCodeSettings = {
    url: new URL('/sign-in', appConfig.urls.marble).href,
  };

  async function emailAndPassswordSignUp(locale: string, email: string, password: string) {
    const auth = getClientAuth(locale);
    // Logout before sign up to avoid grant token firebase error
    await firebaseClient.logout(auth);
    const credential = await firebaseClient.createUserWithEmailAndPassword(auth, email, password);

    await firebaseClient.sendEmailVerification(credential.user, emailVerificationActionCodeSettings);
  }

  async function resendEmailVerification(locale: string, logout: () => void) {
    const auth = getClientAuth(locale);
    if (!auth.currentUser) {
      logout();
      return;
    }

    await firebaseClient.sendEmailVerification(auth.currentUser, emailVerificationActionCodeSettings);
  }

  const passwordResetEmailActionCodeSettings = {
    url: new URL('/sign-in', appConfig.urls.marble).href,
  };

  async function sendPasswordResetEmail(locale: string, email: string) {
    const auth = getClientAuth(locale);

    await firebaseClient.sendPasswordResetEmail(auth, email, passwordResetEmailActionCodeSettings);
  }

  const firebaseIdToken = () => {
    // Prefer onAuthStateChanged https://github.com/firebase/firebase-js-sdk/issues/7348#issuecomment-1579320535
    // currentUser is not reliable when firebase app is initialising
    return new Promise<string>((resolve, reject) => {
      const unsubscribe = firebaseClient.clientAuth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          void user.getIdToken().then(resolve);
        } else {
          reject(new Error('No authenticated user, no token'));
        }
      });
    });
  };

  const getCurrentUser = () => {
    return firebaseClient.clientAuth.currentUser;
  };

  // Resolve the signed-in user reliably, waiting for the SDK to finish initialising.
  // Same rationale as firebaseIdToken: currentUser is not reliable during init.
  const getReadyUser = () => {
    return new Promise<User>((resolve, reject) => {
      const unsubscribe = firebaseClient.clientAuth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error('No authenticated user'));
        }
      });
    });
  };

  async function getEnrolledMfaFactors() {
    const user = await getReadyUser();
    return firebaseClient.multiFactor(user).enrolledFactors.map(adaptMfaFactor);
  }

  async function startTotpEnrollment(): Promise<TotpEnrollmentParams> {
    const user = await getReadyUser();
    const mfaSession = await firebaseClient.multiFactor(user).getSession();
    const secret = await firebaseClient.totpGenerator.generateSecret(mfaSession);
    const qrCodeUrl = secret.generateQrCodeUrl(user.email ?? user.uid, 'Marble');
    return { secret, qrCodeUrl, secretKey: secret.secretKey };
  }

  async function finalizeTotpEnrollment(secret: TotpSecret, verificationCode: string, displayName: string) {
    const user = await getReadyUser();
    const assertion = firebaseClient.totpGenerator.assertionForEnrollment(secret, verificationCode);
    await firebaseClient.multiFactor(user).enroll(assertion, displayName);
  }

  async function resolveMfaTotpSignIn(resolver: MultiFactorResolver, enrollmentId: string, verificationCode: string) {
    const assertion = firebaseClient.totpGenerator.assertionForSignIn(enrollmentId, verificationCode);
    const userCredential = await resolver.resolveSignIn(assertion);
    return {
      idToken: await userCredential.user.getIdToken(),
      refreshToken: userCredential.user.refreshToken,
    };
  }

  async function unenrollMfaFactor(factorUid: string) {
    const user = await getReadyUser();
    await firebaseClient.multiFactor(user).unenroll(factorUid);
  }

  async function getCurrentUserProviderIds() {
    const user = await getReadyUser();
    return user.providerData.map((provider) => provider.providerId);
  }

  // Firebase throws `multi-factor-auth-required` when reauthenticating an MFA-enrolled user;
  // surface the resolver so the caller can run the second-factor (TOTP) challenge.
  function toReauthResult(error: unknown): ReauthResult {
    if (error instanceof FirebaseError && error.code === AuthErrorCodes.MFA_REQUIRED) {
      const resolver = firebaseClient.getMultiFactorResolver(firebaseClient.clientAuth, error as MultiFactorError);
      return { mfaRequired: true as const, resolver };
    }
    throw error;
  }

  async function reauthenticateWithPassword(password: string): Promise<ReauthResult> {
    const user = await getReadyUser();
    if (!user.email) throw new Error('Current user has no email to reauthenticate with password');
    const credential = firebaseClient.EmailAuthProvider.credential(user.email, password);
    try {
      await firebaseClient.reauthenticateWithCredential(user, credential);
      return { mfaRequired: false };
    } catch (error) {
      return toReauthResult(error);
    }
  }

  async function reauthenticateWithOAuth(providerId: 'google.com' | 'microsoft.com'): Promise<ReauthResult> {
    const user = await getReadyUser();
    const provider =
      providerId === 'google.com' ? firebaseClient.googleAuthProvider : firebaseClient.microsoftAuthProvider;
    try {
      await firebaseClient.reauthenticateWithPopup(user, provider);
      return { mfaRequired: false };
    } catch (error) {
      return toReauthResult(error);
    }
  }

  return {
    getCurrentUser,
    googleSignIn,
    microsoftSignIn,
    emailAndPasswordSignIn,
    emailAndPassswordSignUp,
    resendEmailVerification,
    sendPasswordResetEmail,
    firebaseIdToken,
    getEnrolledMfaFactors,
    startTotpEnrollment,
    finalizeTotpEnrollment,
    resolveMfaTotpSignIn,
    unenrollMfaFactor,
    getCurrentUserProviderIds,
    reauthenticateWithPassword,
    reauthenticateWithOAuth,
    isFirebaseEmulator: firebaseClient.isFirebaseEmulator,
  };
}
