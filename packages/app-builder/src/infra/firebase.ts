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
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

export type FirebaseClientWrapper = {
  app: FirebaseApp;
  clientAuth: Auth;
  googleAuthProvider: GoogleAuthProvider;
  signInWithOAuth: typeof signInWithPopup;
  signInWithEmailAndPassword: typeof signInWithEmailAndPassword;
  createUserWithEmailAndPassword: typeof createUserWithEmailAndPassword;
  sendEmailVerification: typeof sendEmailVerification;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
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
    signInWithOAuth: signInWithPopup,
    signInWithEmailAndPassword: signInWithEmailAndPassword,
    createUserWithEmailAndPassword: createUserWithEmailAndPassword,
    sendEmailVerification: sendEmailVerification,
    sendPasswordResetEmail: sendPasswordResetEmail,
  };
}
