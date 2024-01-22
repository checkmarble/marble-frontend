import * as z from 'zod';

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
 * They are useless for other envs
 */
const DevServerEnvVarNameSchema = z.object({
  FIREBASE_AUTH_EMULATOR_HOST: z.string(),
  FIREBASE_AUTH_EMULATOR: z.string(),
});
type DevServerEnvVarName = z.infer<typeof DevServerEnvVarNameSchema>;

/**
 * List of all public env vars to defined on each deployed environments
 */
const ServerPublicEnvVarNameSchema = z.object({
  ENV: z.string(),
  NODE_ENV: z.string(),
  SESSION_MAX_AGE: z.string(),
  MARBLE_API_DOMAIN: z.string(),
  MARBLE_APP_DOMAIN: z.string(),

  FIREBASE_API_KEY: z.string(),
  FIREBASE_APP_ID: z.string(),
  FIREBASE_AUTH_DOMAIN: z.string(),
  FIREBASE_MESSAGING_SENDER_ID: z.string(),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_STORAGE_BUCKET: z.string(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  SEGMENT_WRITE_KEY: z.string().optional(),

  CHATLIO_WIDGET_ID: z.string().optional(),
});
type ServerPublicEnvVarName = z.infer<typeof ServerPublicEnvVarNameSchema>;

/**
 * List of all secret env vars to defined on each deployed environments
 */
const ServerSecretEnvVarNameSchema = z.object({
  SESSION_SECRET: z.string(),
});
type ServerSecretEnvVarName = z.infer<typeof ServerSecretEnvVarNameSchema>;

type ServerEnvVarName = DevServerEnvVarName &
  ServerPublicEnvVarName &
  ServerSecretEnvVarName;

/**
 * Used to check that all env vars are defined according to the schema
 * This is called at the beginning of the server and is only used for improved DX
 */
export function checkServerEnv() {
  let ServerEnvVarNameSchema = ServerPublicEnvVarNameSchema.merge(
    ServerSecretEnvVarNameSchema,
  );
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NODE_ENV === 'development') {
    ServerEnvVarNameSchema = ServerEnvVarNameSchema.merge(
      DevServerEnvVarNameSchema,
    );
  }
  // eslint-disable-next-line no-restricted-properties
  const result = ServerEnvVarNameSchema.safeParse(process.env);
  if (!result.success) {
    const { _errors, ...rest } = result.error.format();
    const formatted = Object.entries(rest)
      .map(([key, value]) => `\t- ${key}: ${value._errors.join(', ')}`)
      .join('\n');

    throw new Error(`[MissingEnv] validation issues :\n${formatted}`);
  }
}

/**
 * Used to access env vars inside loaders/actions code
 */
export function getServerEnv<K extends keyof ServerEnvVarName>(
  serverEnvVarName: K,
) {
  // eslint-disable-next-line no-restricted-properties
  return process.env[serverEnvVarName] as ServerEnvVarName[K];
}

/**
 * Browser env vars :
 * - define browser env vars here
 * - access it using getClientEnv('MY_ENV_VAR')
 * https://remix.run/docs/en/main/guides/envvars
 */
export function getClientEnvVars() {
  return {
    ENV: getServerEnv('ENV'),
    AUTH_EMULATOR_HOST: getServerEnv('FIREBASE_AUTH_EMULATOR_HOST'),
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
    CHATLIO_WIDGET_ID: getServerEnv('CHATLIO_WIDGET_ID'),
  };
}
type ClientEnvVars = ReturnType<typeof getClientEnvVars>;

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
