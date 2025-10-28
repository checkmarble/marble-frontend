import * as z from 'zod/v4';

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
  ENV: z.string().optional().default('production'),
  NODE_ENV: z.string().optional().default('production'),
  APP_VERSION: z.string().optional(),

  SESSION_MAX_AGE: z.string().optional(),
  MARBLE_API_URL: z.string(),

  METABASE_URL: z.string().optional(),

  TEST_FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  SEGMENT_WRITE_KEY: z.string().optional(),
  DISABLE_SEGMENT: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  ANALYTICS_V2: z.string().optional(),
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
    const tree = z.treeifyError(result.error);
    const entries: Array<[string, string[]]> = Object.entries(tree.properties ?? {}).map(
      ([key, value]) => [key, value.errors] as [string, string[]],
    );
    const formatted = entries
      .map(([key, messages]) => `\t- ${key}: ${messages.join(', ')}`)
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
  APP_VERSION?: string;
  SESSION_MAX_AGE?: string;
  MARBLE_API_URL: string;
  METABASE_URL?: string;
  TEST_FIREBASE_AUTH_EMULATOR_HOST?: string;
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  SEGMENT_WRITE_KEY?: string;
  DISABLE_SEGMENT?: boolean;
  SESSION_SECRET: string;
  ANALYTICS_V2: string;
}

/**
 * Used to access env vars inside loaders/actions code
 */
export function getServerEnv<K extends keyof ServerEnvVars>(serverEnvVarName: K) {
  return getEnv(serverEnvVarName) as ServerEnvVars[K];
}

/**
 * Browser env vars, access it using getClientEnv('MY_ENV_VAR')
 *
 * https://remix.run/docs/en/main/guides/envvars
 */
interface ClientEnvVars {
  ENV: string;
  SENTRY_DSN?: string;
  SENTRY_ENVIRONMENT?: string;
  METABASE_URL?: string;
}
export function getClientEnvVars(): ClientEnvVars {
  return {
    ENV: getServerEnv('ENV'),
    SENTRY_DSN: getServerEnv('SENTRY_DSN'),
    SENTRY_ENVIRONMENT: getServerEnv('SENTRY_ENVIRONMENT'),
    METABASE_URL: getServerEnv('METABASE_URL'),
  };
}

/**
 * Used to access env vars inside components code (SSR and CSR)
 */
export function getClientEnv<K extends keyof ClientEnvVars>(clientEnvVarName: K) {
  let clientEnv: ClientEnvVars;
  if (typeof window === 'undefined') {
    clientEnv = getClientEnvVars();
  } else {
    //@ts-expect-error ENV is a custom global variable injected in root.tsx
    clientEnv = window.ENV as ClientEnvVars;
    if (clientEnv === undefined) {
      throw new Error(`[MissingEnv] window.ENV is not defined. Check the root.tsx loader`);
    }
  }

  return clientEnv[clientEnvVarName];
}
