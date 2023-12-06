import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';

export interface AuthenticationClientRepository {
  googleSignIn: (locale: string) => Promise<string>;
  emailAndPasswordSignIn: (
    locale: string,
    email: string,
    password: string,
  ) => Promise<string>;
  firebaseIdToken: () => Promise<string>;
}

export function getAuthenticationClientRepository({
  clientAuth,
  googleAuthProvider,
  signInWithOAuth,
  signInWithEmailAndPassword,
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
    const credential = await signInWithOAuth(auth, googleAuthProvider);
    return credential.user.getIdToken();
  }

  async function emailAndPasswordSignIn(
    locale: string,
    email: string,
    password: string,
  ) {
    const auth = getClientAuth(locale);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user.getIdToken();
  }

  const firebaseIdToken = () => {
    const currentUser = clientAuth.currentUser;
    if (currentUser === null) {
      throw Error('No authenticated user, no token');
    }
    return currentUser.getIdToken();
  };

  return { googleSignIn, emailAndPasswordSignIn, firebaseIdToken };
}
