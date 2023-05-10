type ServerEnvVarName =
  | 'ENV'
  | 'NODE_ENV'
  | 'APP_DOMAIN'
  | 'SESSION_SECRET'
  | 'SESSION_MAX_AGE'
  | 'MARBLE_API_DOMAIN'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_CLIENT_SECRET';

export function getServerEnv(serverEnvVarName: ServerEnvVarName): string {
  // eslint-disable-next-line no-restricted-properties
  const serverEnvVar = process.env[serverEnvVarName];
  if (!serverEnvVar) {
    throw new Error(`[MissingEnv] ${serverEnvVarName} is not defined`);
  }
  return serverEnvVar;
}
