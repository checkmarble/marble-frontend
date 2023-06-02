export type ClientEnvVars = {
  AUTH_EMULATOR: boolean;
};

export function getClientEnv(clientEnvVarName: keyof ClientEnvVars) {
  //@ts-expect-error ENV is a custom global variable injected in root.tsx
  const clientEnv = window.ENV as ClientEnvVars;
  if (clientEnv === undefined) {
    throw new Error(
      `[MissingEnv] ENV is not defined. Check the root.tsx loader`
    );
  }
  const clientEnvVar = clientEnv[clientEnvVarName];
  if (clientEnvVar === undefined) {
    throw new Error(`[MissingEnv] ${clientEnvVarName} is not defined`);
  }
  return clientEnvVar;
}
