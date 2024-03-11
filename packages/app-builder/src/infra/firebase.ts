import {
  type FirebaseApp,
  type FirebaseOptions,
  initializeApp,
} from 'firebase/app';
import {
  type Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
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
  googleAuthProvider: GoogleAuthProvider;
  microsoftAuthProvider: OAuthProvider;
  signInWithOAuth: typeof signInWithPopup;
  signInWithEmailAndPassword: typeof signInWithEmailAndPassword;
  createUserWithEmailAndPassword: typeof createUserWithEmailAndPassword;
  sendEmailVerification: typeof sendEmailVerification;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
  logout: typeof signOut;
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
    const url = new URL('http://' + authEmulatorHost);
    connectAuthEmulator(clientAuth, url.toString());
  }

  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

  const microsoftAuthProvider = new OAuthProvider('microsoft.com');

  return {
    app,
    clientAuth,
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
