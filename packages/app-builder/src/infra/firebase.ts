import {
  type FirebaseApp,
  type FirebaseOptions,
  initializeApp,
} from 'firebase/app';
import {
  type Auth,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

export type FirebaseClientWrapper = {
  app: FirebaseApp;
  clientAuth: Auth;
  googleAuthProvider: GoogleAuthProvider;
  signIn: typeof signInWithPopup;
};

export function initializeFirebaseClient({
  firebaseOptions,
  authEmulatorHost,
}: {
  firebaseOptions: FirebaseOptions;
  authEmulatorHost?: string;
}): FirebaseClientWrapper {
  const app = initializeApp(firebaseOptions);

  const clientAuth = getAuth(app);

  if (authEmulatorHost && !('emulator' in clientAuth.config)) {
    connectAuthEmulator(clientAuth, authEmulatorHost);
  }

  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

  return {
    app,
    clientAuth,
    googleAuthProvider,
    signIn: signInWithPopup,
  };
}
