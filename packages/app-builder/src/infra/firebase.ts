import { type FirebaseApp, type FirebaseOptions, initializeApp } from 'firebase/app';
import {
  type Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getAuth,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

export type FirebaseClientWrapper = {
  app: FirebaseApp;
  clientAuth: Auth;
  isFirebaseEmulator: boolean;
  googleAuthProvider: GoogleAuthProvider;
  microsoftAuthProvider: OAuthProvider;
  signInWithOAuth: typeof signInWithPopup;
  signInWithEmailAndPassword: typeof signInWithEmailAndPassword;
  createUserWithEmailAndPassword: typeof createUserWithEmailAndPassword;
  sendEmailVerification: typeof sendEmailVerification;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
  logout: typeof signOut;
};

export type FirebaseConfig =
  | {
      withEmulator: false;
      options: FirebaseOptions;
    }
  | {
      withEmulator: true;
      authEmulatorUrl: string;
      options: FirebaseOptions;
    };

export function initializeFirebaseClient(config: FirebaseConfig): FirebaseClientWrapper {
  const app = initializeApp(config.options);

  const clientAuth = getAuth(app);

  if (config.withEmulator) {
    connectAuthEmulator(clientAuth, config.authEmulatorUrl, {
      disableWarnings: process.env.NODE_ENV !== 'production',
    });
  }

  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

  const microsoftAuthProvider = new OAuthProvider('microsoft.com');

  return {
    app,
    clientAuth,
    isFirebaseEmulator: config.withEmulator,
    googleAuthProvider,
    microsoftAuthProvider,
    signInWithOAuth: signInWithPopup,
    signInWithEmailAndPassword: signInWithEmailAndPassword,
    createUserWithEmailAndPassword: createUserWithEmailAndPassword,
    sendEmailVerification: sendEmailVerification,
    sendPasswordResetEmail: sendPasswordResetEmail,
    logout: signOut,
  };
}
