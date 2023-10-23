import { type ClientEnvVars } from './environment.client';

/**
 * The separation in three types are here
 * to help you to know where to define your env vars.
 *
 * 1.Create a new environment :
 *   - add ServerPublicEnvVarName to the list of public env vars
 *   - add ServerSecretEnvVarName to the list of secret env vars
 *
 * 2. Add a new env var :
 *   - edit the appropriate list of env vars (dev, public, secret...)
 *   - if necessary, update build_and_deploy.yaml (to inject the new env var)
 *   - update existing environment
 */

/**
 * These variables are defined only for development
 * They are ignored for other envs
 */
type DevServerEnvVarName =
  | 'FIREBASE_AUTH_EMULATOR_HOST'
  | 'FIREBASE_AUTH_EMULATOR';

/**
 * List of all public env vars to defined on each deployed environments
 */
type ServerPublicEnvVarName =
  | 'ENV'
  | 'FIREBASE_API_KEY'
  | 'FIREBASE_APP_ID'
  | 'FIREBASE_AUTH_DOMAIN'
  | 'FIREBASE_MESSAGING_SENDER_ID'
  | 'FIREBASE_PROJECT_ID'
  | 'FIREBASE_STORAGE_BUCKET'
  | 'MARBLE_API_DOMAIN'
  | 'MARBLE_APP_DOMAIN'
  | 'NODE_ENV'
  | 'SENTRY_DSN'
  | 'SENTRY_ENVIRONMENT'
  | 'SESSION_MAX_AGE';

/**
 * List of all secret env vars to defined on each deployed environments
 */
type ServerSecretEnvVarName = 'SESSION_SECRET';

type ServerEnvVarName =
  | DevServerEnvVarName
  | ServerPublicEnvVarName
  | ServerSecretEnvVarName;

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
    ENV: getServerEnv('ENV'),
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
    MARBLE_API_DOMAIN: getServerEnv('MARBLE_API_DOMAIN'),
    MARBLE_APP_DOMAIN: getServerEnv('MARBLE_APP_DOMAIN'),
    SENTRY_DSN: getServerEnv('SENTRY_DSN'),
    SENTRY_ENVIRONMENT: getServerEnv('SENTRY_ENVIRONMENT'),
  };
}
