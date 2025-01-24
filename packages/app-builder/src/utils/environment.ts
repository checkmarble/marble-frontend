import { type FirebaseConfig } from '@app-builder/infra/firebase';
import * as z from 'zod';

/**
 * To:
 *
 * 1. Identify the required environment variables for deploying a new environment:
 *    - Include `PublicEnvVars` in the list of public environment variables.
 *    - Incorporate `SecretEnvVars` in the list of secret environment variables.
 *
 * 2. Create a new environment variable for use in the code:
 *    - Update the relevant lists of environment variables (public, secret, etc.).
 *    - If necessary, modify `build_and_deploy.yaml` to inject the new environment variable.
 *    - Ensure the existing environment is updated accordingly.
 */

/**
 * List of all public env vars to defined on each deployed environments
 */
const PublicEnvVarsSchema = z.object({
  ENV: z.string(),
  NODE_ENV: z.string(),
  SESSION_MAX_AGE: z.string(),
  MARBLE_API_DOMAIN_CLIENT: z.string(),
  MARBLE_API_DOMAIN_SERVER: z.string(),
  MARBLE_APP_DOMAIN: z.string(),

  FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
  FIREBASE_API_KEY: z.string(),
  FIREBASE_APP_ID: z.string().optional(),
  FIREBASE_AUTH_DOMAIN: z.string().optional(),
  FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  SEGMENT_WRITE_KEY: z.string().optional(),
});
type PublicEnvVars = z.infer<typeof PublicEnvVarsSchema>;

/**
 * List of all secret env vars to defined on each deployed environments
 */
const SecretEnvVarsSchema = z.object({
  SESSION_SECRET: z.string(),
});
type SecretEnvVars = z.infer<typeof SecretEnvVarsSchema>;

const EnvVarsSchema = PublicEnvVarsSchema.merge(SecretEnvVarsSchema);
type EnvVars = PublicEnvVars & SecretEnvVars;

function getEnv<K extends keyof EnvVars>(envVarName: K) {
  return process.env[envVarName] as EnvVars[K];
}

/**
 * Used to check that all env vars are defined according to the schema
 * This is called at the beginning of the server and is only used for improved DX
 */
export function checkEnv() {
  const result = EnvVarsSchema.safeParse(process.env);
  if (!result.success) {
    const { _errors, ...rest } = result.error.format();
    const formatted = Object.entries(rest)
      .map(([key, value]) => `\t- ${key}: ${value._errors.join(', ')}`)
      .join('\n');

    throw new Error(`[MissingEnv] validation issues :\n${formatted}`);
  }
}

/**
 * Server env vars, access it using getServerEnv('MY_ENV_VAR')
 */
interface ServerEnvVars {
  ENV: string;
  NODE_ENV: string;
  SESSION_MAX_AGE: string;
  MARBLE_API_DOMAIN_CLIENT: string;
  MARBLE_API_DOMAIN_SERVER: string;
  MARBLE_APP_DOMAIN: string;
  FIREBASE_CONFIG: FirebaseConfig;
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  SEGMENT_WRITE_KEY?: string;
  SESSION_SECRET: string;
}

/**
 * Used to access env vars inside loaders/actions code
 */
export function getServerEnv<K extends keyof ServerEnvVars>(
  serverEnvVarName: K,
) {
  if (serverEnvVarName === 'FIREBASE_CONFIG') {
    return parseFirebaseConfigFromEnv() as ServerEnvVars[K];
  }

  return getEnv(serverEnvVarName) as ServerEnvVars[K];
}

/**
 * Browser env vars, access it using getClientEnv('MY_ENV_VAR')
 *
 * https://remix.run/docs/en/main/guides/envvars
 */
interface ClientEnvVars {
  ENV: string;
  FIREBASE_CONFIG: FirebaseConfig;
  MARBLE_API_DOMAIN: string;
  MARBLE_APP_DOMAIN: string;
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
}
export function getClientEnvVars(): ClientEnvVars {
  return {
    ENV: getServerEnv('ENV'),
    FIREBASE_CONFIG: getServerEnv('FIREBASE_CONFIG'),
    MARBLE_API_DOMAIN: getServerEnv('MARBLE_API_DOMAIN_CLIENT'),
    MARBLE_APP_DOMAIN: getServerEnv('MARBLE_APP_DOMAIN'),
    SENTRY_DSN: getServerEnv('SENTRY_DSN'),
    SENTRY_ENVIRONMENT: getServerEnv('SENTRY_ENVIRONMENT'),
  };
}

/**
 * Used to access env vars inside components code (SSR and CSR)
 */
export function getClientEnv<K extends keyof ClientEnvVars>(
  clientEnvVarName: K,
) {
  let clientEnv: ClientEnvVars;
  if (typeof window === 'undefined') {
    clientEnv = getClientEnvVars();
  } else {
    //@ts-expect-error ENV is a custom global variable injected in root.tsx
    clientEnv = window.ENV as ClientEnvVars;
    if (clientEnv === undefined) {
      throw new Error(
        `[MissingEnv] window.ENV is not defined. Check the root.tsx loader`,
      );
    }
  }

  return clientEnv[clientEnvVarName];
}

function parseFirebaseConfigFromEnv(): FirebaseConfig {
  const options: FirebaseConfig['options'] = {
    apiKey: getEnv('FIREBASE_API_KEY'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('FIREBASE_APP_ID'),
  };

  const firebaseAuthEmulatorHost = getEnv('FIREBASE_AUTH_EMULATOR_HOST');
  if (!firebaseAuthEmulatorHost) {
    return {
      withEmulator: false as const,
      options,
    };
  }

  try {
    const authEmulatorUrl = new URL(
      'http://' + firebaseAuthEmulatorHost,
    ).toString();
    return {
      withEmulator: true as const,
      authEmulatorUrl,
      options,
    };
  } catch (e) {
    throw new Error(
      `Invalid FIREBASE_AUTH_EMULATOR_HOST: ${firebaseAuthEmulatorHost}`,
    );
  }
}
