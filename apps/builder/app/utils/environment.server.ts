type ServerEnvVarName =
  | 'ENV'
  | 'NODE_ENV'
  | 'AUTH_EMULATOR'
  | 'APP_DOMAIN'
  | 'SESSION_SECRET'
  | 'SESSION_MAX_AGE'
  | 'MARBLE_API_DOMAIN'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_CLIENT_SECRET';

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
