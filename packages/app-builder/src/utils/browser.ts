export function getCurrentBrowser(userAgent: string) {
  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  }
  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('Safari')) {
    return 'Safari';
  }
  if (userAgent.includes('Edge')) {
    return 'Edge';
  }
  if (userAgent.includes('Opera')) {
    return 'Opera';
  }
  return 'Unknown Browser';
}

export type KnownBrowser = Exclude<ReturnType<typeof getCurrentBrowser>, 'Unknown Browser'>;
