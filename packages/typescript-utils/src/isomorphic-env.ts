export function isomorphicGetEnv(envVarName: string): string | undefined {
  if (typeof window !== 'undefined') {
    //@ts-expect-error ENV is a custom global variable injected in browser
    const clientEnv = window.ENV;
    if (clientEnv === undefined) {
      throw new Error('In a browser environment, window.ENV should be defined by convention.');
    }
    return clientEnv[envVarName];
  }
  if (typeof process !== 'undefined') {
    return process.env[envVarName];
  }
  throw new Error('Unknown environment');
}
