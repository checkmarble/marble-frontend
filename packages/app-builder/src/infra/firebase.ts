import { type AppConfig } from '@app-builder/models/app-config';
import { type FirebaseApp, initializeApp } from 'firebase/app';
import {
  type Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  getAuth,
  getMultiFactorResolver,
  multiFactor,
  OAuthProvider,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  TotpMultiFactorGenerator,
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
  multiFactor: typeof multiFactor;
  totpGenerator: typeof TotpMultiFactorGenerator;
  PhoneAuthProvider: typeof PhoneAuthProvider;
  phoneMultiFactorGenerator: typeof PhoneMultiFactorGenerator;
  RecaptchaVerifier: typeof RecaptchaVerifier;
  getMultiFactorResolver: typeof getMultiFactorResolver;
  EmailAuthProvider: typeof EmailAuthProvider;
  reauthenticateWithCredential: typeof reauthenticateWithCredential;
  reauthenticateWithPopup: typeof reauthenticateWithPopup;
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
    // The Auth emulator does not implement getRecaptchaConfig; disabling app
    // verification skips reCAPTCHA so phone-based MFA can be tested locally.
    clientAuth.settings.appVerificationDisabledForTesting = true;
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
    multiFactor: multiFactor,
    totpGenerator: TotpMultiFactorGenerator,
    PhoneAuthProvider: PhoneAuthProvider,
    phoneMultiFactorGenerator: PhoneMultiFactorGenerator,
    RecaptchaVerifier: RecaptchaVerifier,
    getMultiFactorResolver: getMultiFactorResolver,
    EmailAuthProvider: EmailAuthProvider,
    reauthenticateWithCredential: reauthenticateWithCredential,
    reauthenticateWithPopup: reauthenticateWithPopup,
  };
}
