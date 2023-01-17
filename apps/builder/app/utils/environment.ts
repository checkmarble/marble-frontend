type ServerEnvVarName =
  | 'ENV'
  | 'APP_DOMAIN'
  | 'SESSION_SECRET'
  | 'SESSION_MAX_AGE'
  | 'MARBLE_API_DOMAIN'
  | 'MARBLE_API_CLIENT_ID'
  | 'MARBLE_API_CLIENT_SECRET'
  | 'GOOGLE_CLIENT_ID'
  | 'GOOGLE_CLIENT_SECRET';

export function getServerEnv(serverEnvVarName: ServerEnvVarName): string {
  const serverEnvVar = process.env[serverEnvVarName];
  if (!serverEnvVar) {
    throw new Error(`[MissingEnv] ${serverEnvVarName} is not defined`);
  }
  return serverEnvVar;
}
