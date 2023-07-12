import { getClientEnv } from '@app-builder/utils/environment.client';
import { type FirebaseApp, initializeApp } from 'firebase/app';
import {
  type Auth,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  inMemoryPersistence,
  signInWithPopup,
} from 'firebase/auth';

export interface FirebaseWrapper {
  app: FirebaseApp;
  auth: Auth;
  googleAuthProvider: GoogleAuthProvider;
}

const app = initializeApp(getClientEnv('FIREBASE_OPTIONS'));

const clientAuth = getAuth(app);

export async function getClientAuth(locale: string) {
  await clientAuth.setPersistence(inMemoryPersistence);

  const authEmulatorHost = getClientEnv('AUTH_EMULATOR_HOST', '');
  if (authEmulatorHost && !('emulator' in clientAuth.config)) {
    connectAuthEmulator(clientAuth, authEmulatorHost);
  }

  if (locale) {
    clientAuth.languageCode = locale;
  } else {
    clientAuth.useDeviceLanguage();
  }

  async function googleSignIn() {
    try {
      const googleAuthProvider = new GoogleAuthProvider();
      googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

      const credential = await signInWithPopup(clientAuth, googleAuthProvider);
      return credential.user.getIdToken();
    } catch (error) {
      //TODO: handle errors correctly for UI
      console.error(error);
    }
  }

  return { googleSignIn };
}
