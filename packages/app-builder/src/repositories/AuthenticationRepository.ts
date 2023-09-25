import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';

export interface AuthenticationClientRepository {
  googleSignIn: (locale: string) => Promise<string>;
  firebaseIdToken: () => Promise<string>;
}

export function getAuthenticationClientRepository({
  clientAuth,
  googleAuthProvider,
  signIn,
}: FirebaseClientWrapper): AuthenticationClientRepository {
  function getClientAuth(locale: string) {
    if (locale) {
      clientAuth.languageCode = locale;
    } else {
      clientAuth.useDeviceLanguage();
    }
    return clientAuth;
  }

  async function googleSignIn(locale: string) {
    const auth = getClientAuth(locale);
    const credential = await signIn(auth, googleAuthProvider);
    return credential.user.getIdToken();
  }

  const firebaseIdToken = () => {
    const currentUser = clientAuth.currentUser;
    if (currentUser === null) {
      throw Error('No authenticated user, no token');
    }
    return currentUser.getIdToken();
  };

  return { googleSignIn, firebaseIdToken };
}
