import { type FirebaseClientWrapper } from '@app-builder/infra/firebase';

export interface AuthenticationClientRepository {
  googleSignIn: (locale: string) => Promise<string>;
  emailAndPasswordSignIn: (
    locale: string,
    email: string,
    password: string,
  ) => Promise<string>;
  emailAndPassswordSignUp: (
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
  createUserWithEmailAndPassword,
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

  async function emailAndPassswordSignUp(
    locale: string,
    email: string,
    password: string,
  ) {
    const auth = getClientAuth(locale);
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return credential.user.getIdToken();
  }

  const firebaseIdToken = () => {
    // Prefer onAuthStateChanged https://github.com/firebase/firebase-js-sdk/issues/7348#issuecomment-1579320535
    // currentUser is not reliable when firebase app is initialising
    return new Promise<string>((resolve, reject) => {
      const unsubscribe = clientAuth.onAuthStateChanged((user) => {
        unsubscribe();
        if (user) {
          void user.getIdToken().then(resolve);
        } else {
          reject(new Error('No authenticated user, no token'));
        }
      });
    });
  };

  return {
    googleSignIn,
    emailAndPasswordSignIn,
    emailAndPassswordSignUp,
    firebaseIdToken,
  };
}
