import { getClientEnv } from '@marble-front/builder/utils/environment.client';
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

const app = initializeApp({
  apiKey: 'AIzaSyAElc2shIKIrYzLSzWmWaZ1C7yEuoS-bBw',
  authDomain: 'tokyo-country-381508.firebaseapp.com',
  projectId: 'tokyo-country-381508',
  storageBucket: 'tokyo-country-381508.appspot.com',
  messagingSenderId: '1047691849054',
  appId: '1:1047691849054:web:a5b69dd2ac584c1160b3cf',
});

const clientAuth = getAuth(app);

clientAuth.setPersistence(inMemoryPersistence);

const googleAuthProvider = new GoogleAuthProvider();

export function getClientAuth(locale: string) {
  if (getClientEnv('AUTH_EMULATOR') && !('emulator' in clientAuth.config)) {
    connectAuthEmulator(clientAuth, 'http://localhost:9099');
  }

  if (locale) {
    clientAuth.languageCode = locale;
  } else {
    clientAuth.useDeviceLanguage();
  }

  async function googleSignIn() {
    try {
      const credential = await signInWithPopup(clientAuth, googleAuthProvider);
      return credential.user.getIdToken();
    } catch (error) {
      //TODO: handle errors correctly for UI
      console.error(error);
    }
  }

  return { googleSignIn };
}
