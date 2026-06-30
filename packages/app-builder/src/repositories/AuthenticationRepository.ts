import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';
import { AppConfig } from '@app-builder/models/app-config';
import { adaptMfaFactor, type MfaFactor } from '@app-builder/models/mfa';
import { type TotpSecret, User } from 'firebase/auth';

export interface TotpEnrollmentParams {
  secret: TotpSecret;
  qrCodeUrl: string;
  secretKey: string;
}

export interface AuthenticationClientRepository {
  getCurrentUser: () => User | null;
  googleSignIn: (locale: string) => Promise<{ idToken: string; refreshToken: string }>;
  microsoftSignIn: (locale: string) => Promise<{ idToken: string; refreshToken: string }>;
  emailAndPasswordSignIn: (
    locale: string,
    email: string,
    password: string,
  ) => Promise<{ idToken: string; refreshToken: string; emailVerified: true } | { emailVerified: false }>;
  emailAndPassswordSignUp: (locale: string, email: string, password: string) => Promise<void>;
  resendEmailVerification: (locale: string, logout: () => void) => Promise<void>;
  sendPasswordResetEmail: (locale: string, email: string) => Promise<void>;
  firebaseIdToken: () => Promise<string>;
  getEnrolledMfaFactors: () => Promise<MfaFactor[]>;
  startTotpEnrollment: () => Promise<TotpEnrollmentParams>;
  finalizeTotpEnrollment: (secret: TotpSecret, verificationCode: string, displayName: string) => Promise<void>;
  unenrollMfaFactor: (factorUid: string) => Promise<void>;
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

  async function googleSignIn(locale: string) {
    const auth = getClientAuth(locale);
    // Logout before sign in to avoid grant token firebase error
    await firebaseClient.logout(auth);
    const credential = await firebaseClient.signInWithOAuth(auth, firebaseClient.googleAuthProvider);
    return {
      idToken: await credential.user.getIdToken(),
      refreshToken: credential.user.refreshToken,
    };
  }

  async function microsoftSignIn(locale: string) {
    const auth = getClientAuth(locale);
    // Logout before sign in to avoid grant token firebase error
    await firebaseClient.logout(auth);
    const credential = await firebaseClient.signInWithOAuth(auth, firebaseClient.microsoftAuthProvider);
    return {
      idToken: await credential.user.getIdToken(),
      refreshToken: credential.user.refreshToken,
    };
  }

  async function emailAndPasswordSignIn(locale: string, email: string, password: string) {
    const auth = getClientAuth(locale);
    // Logout before sign in to avoid grant token firebase error
    await firebaseClient.logout(auth);
    const credential = await firebaseClient.signInWithEmailAndPassword(auth, email, password);
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

  async function unenrollMfaFactor(factorUid: string) {
    const user = await getReadyUser();
    await firebaseClient.multiFactor(user).unenroll(factorUid);
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
    unenrollMfaFactor,
    isFirebaseEmulator: firebaseClient.isFirebaseEmulator,
  };
}
