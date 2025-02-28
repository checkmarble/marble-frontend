import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';
import { getClientEnv } from '@app-builder/utils/environment';
import { getRoute } from '@app-builder/utils/routes';

export interface AuthenticationClientRepository {
  googleSignIn: (locale: string) => Promise<string>;
  microsoftSignIn: (locale: string) => Promise<string>;
  emailAndPasswordSignIn: (
    locale: string,
    email: string,
    password: string,
  ) => Promise<{ idToken: string; emailVerified: true } | { emailVerified: false }>;
  emailAndPassswordSignUp: (locale: string, email: string, password: string) => Promise<void>;
  resendEmailVerification: (locale: string, logout: () => void) => Promise<void>;
  sendPasswordResetEmail: (locale: string, email: string) => Promise<void>;
  firebaseIdToken: () => Promise<string>;
  isFirebaseEmulator: boolean;
}

export function getAuthenticationClientRepository(
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
    const credential = await firebaseClient.signInWithOAuth(
      auth,
      firebaseClient.googleAuthProvider,
    );
    return credential.user.getIdToken();
  }

  async function microsoftSignIn(locale: string) {
    const auth = getClientAuth(locale);
    // Logout before sign in to avoid grant token firebase error
    await firebaseClient.logout(auth);
    const credential = await firebaseClient.signInWithOAuth(
      auth,
      firebaseClient.microsoftAuthProvider,
    );
    return credential.user.getIdToken();
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
      emailVerified: true as const,
    };
  }

  const emailVerificationActionCodeSettings = {
    url: new URL(getRoute('/sign-in'), getClientEnv('MARBLE_APP_URL')).href,
  };

  async function emailAndPassswordSignUp(locale: string, email: string, password: string) {
    const auth = getClientAuth(locale);
    // Logout before sign up to avoid grant token firebase error
    await firebaseClient.logout(auth);
    const credential = await firebaseClient.createUserWithEmailAndPassword(auth, email, password);

    await firebaseClient.sendEmailVerification(
      credential.user,
      emailVerificationActionCodeSettings,
    );
  }

  async function resendEmailVerification(locale: string, logout: () => void) {
    const auth = getClientAuth(locale);
    if (!auth.currentUser) {
      logout();
      return;
    }

    await firebaseClient.sendEmailVerification(
      auth.currentUser,
      emailVerificationActionCodeSettings,
    );
  }

  const passwordResetEmailActionCodeSettings = {
    url: new URL(getRoute('/sign-in'), getClientEnv('MARBLE_APP_URL')).href,
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

  return {
    googleSignIn,
    microsoftSignIn,
    emailAndPasswordSignIn,
    emailAndPassswordSignUp,
    resendEmailVerification,
    sendPasswordResetEmail,
    firebaseIdToken,
    isFirebaseEmulator: firebaseClient.isFirebaseEmulator,
  };
}
