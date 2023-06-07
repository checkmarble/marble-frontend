import { type ClientEnvVars } from './environment.client';

type ServerEnvVarName =
  | 'ENV'
  | 'NODE_ENV'
  | 'APP_DOMAIN'
  | 'SESSION_SECRET'
  | 'SESSION_MAX_AGE'
  | 'MARBLE_API_DOMAIN'
  | 'FIREBASE_AUTH_EMULATOR'
  | 'FIREBASE_AUTH_EMULATOR_HOST'
  | 'FIREBASE_API_KEY'
  | 'FIREBASE_AUTH_DOMAIN'
  | 'FIREBASE_PROJECT_ID'
  | 'FIREBASE_STORAGE_BUCKET'
  | 'FIREBASE_MESSAGING_SENDER_ID'
  | 'FIREBASE_APP_ID';

export function getServerEnv(
  serverEnvVarName: ServerEnvVarName,
  defaultValue?: string
): string {
  // eslint-disable-next-line no-restricted-properties
  const serverEnvVar = process.env[serverEnvVarName] ?? defaultValue;
  if (serverEnvVar === undefined) {
    throw new Error(`[MissingEnv] ${serverEnvVarName} is not defined`);
  }
  return serverEnvVar;
}

/**
 * Browser env vars :
 * - define browser env vars here
 * - access it using getClientEnv('MY_ENV_VAR')
 * https://remix.run/docs/en/v1/guides/envvars#browser-environment-variables
 */
export function getClientEnvVars(): ClientEnvVars {
  const isAuthEmulator =
    getServerEnv('ENV') === 'development' &&
    getServerEnv('FIREBASE_AUTH_EMULATOR', 'false') === 'true';

  return {
    AUTH_EMULATOR_HOST: isAuthEmulator
      ? getServerEnv('FIREBASE_AUTH_EMULATOR_HOST')
      : undefined,
    FIREBASE_OPTIONS: {
      apiKey: getServerEnv('FIREBASE_API_KEY'),
      authDomain: getServerEnv('FIREBASE_AUTH_DOMAIN'),
      projectId: getServerEnv('FIREBASE_PROJECT_ID'),
      storageBucket: getServerEnv('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getServerEnv('FIREBASE_MESSAGING_SENDER_ID'),
      appId: getServerEnv('FIREBASE_APP_ID'),
    },
  };
}
