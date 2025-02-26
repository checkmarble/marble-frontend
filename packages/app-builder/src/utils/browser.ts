export function getCurrentBrowser(userAgent: string) {
  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari')) {
    return 'Safari';
  } else if (userAgent.includes('Edge')) {
    return 'Edge';
  } else if (userAgent.includes('Opera')) {
    return 'Opera';
  } else {
    return 'Unknown Browser';
  }
}

export type KnownBrowser = Exclude<ReturnType<typeof getCurrentBrowser>, 'Unknown Browser'>;
