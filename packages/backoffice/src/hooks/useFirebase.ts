import { AppConfigContext } from '@bo/contexts/AppConfig';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { AppConfigDto } from 'marble-api';
import { useMemo } from 'react';

export const useFirebase = () => {
  const appConfig = AppConfigContext.useValue();

  const firebaseClient = useMemo(() => {
    return initializeFirebaseClient(appConfig.auth.firebase);
  }, [appConfig]);

  return firebaseClient;
};

const initializeFirebaseClient = (config: AppConfigDto['auth']['firebase']) => {
  const app = initializeApp({
    apiKey: config.api_key,
    authDomain: config.auth_domain,
    projectId: config.project_id,
  });

  const clientAuth = getAuth(app);

  if (config.is_emulator) {
    connectAuthEmulator(clientAuth, `http://${config.emulator_host}`, {
      disableWarnings: process.env['NODE_ENV'] !== 'production',
    });
  }

  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

  return {
    app,
    clientAuth,
    signInWithGoogle: async () => {
      clientAuth.useDeviceLanguage();
      const credentials = await signInWithPopup(clientAuth, googleAuthProvider);

      return credentials.user.getIdToken();
    },
    getIdToken: async () => {
      return new Promise<string>((resolve, reject) => {
        const unsubscribe = clientAuth.onAuthStateChanged((user) => {
          unsubscribe();
          if (user) {
            user.getIdToken().then(resolve);
          } else {
            reject(new Error('No authenticated user, no token'));
          }
        });
      });
    },
  };
};
