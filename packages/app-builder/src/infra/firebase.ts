import { type AppConfig } from '@app-builder/models/app-config';
import { type FirebaseApp, initializeApp } from 'firebase/app';
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

export function initializeFirebaseClient(config: AppConfig['auth']['firebase']): FirebaseClientWrapper {
  const app = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
  });

  const clientAuth = getAuth(app);

  if (config.isEmulator) {
    connectAuthEmulator(clientAuth, config.emulatorUrl, {
      disableWarnings: process.env.NODE_ENV !== 'production',
    });
  }

  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

  const microsoftAuthProvider = new OAuthProvider('microsoft.com');

  return {
    app,
    clientAuth,
    isFirebaseEmulator: config.isEmulator,
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
