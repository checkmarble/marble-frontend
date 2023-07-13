import { type FirebaseOptions } from 'firebase/app';

/**
 * Client env vars :
 * - define the list here
 * - inject value in getClientEnvVars()
 */

export type ClientEnvVars = {
  ENV: string;
  AUTH_EMULATOR_HOST?: string;
  FIREBASE_OPTIONS: FirebaseOptions;
};

export function getClientEnv<K extends keyof ClientEnvVars>(
  clientEnvVarName: K,
  defaultValue?: ClientEnvVars[K]
) {
  //@ts-expect-error ENV is a custom global variable injected in root.tsx
  const clientEnv = window.ENV as ClientEnvVars;
  if (clientEnv === undefined) {
    throw new Error(
      `[MissingEnv] window.ENV is not defined. Check the root.tsx loader`
    );
  }
  const clientEnvVar = clientEnv[clientEnvVarName] ?? defaultValue;
  if (clientEnvVar === undefined) {
    throw new Error(`[MissingEnv] ${clientEnvVarName} is not defined`);
  }
  return clientEnvVar;
}
