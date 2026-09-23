export const logoNames = [
  'google-logo',
  'logo-favicon',
  'logo-standard',
  'logo',
  'm',
  'marble',
  'microsoft-logo',
] as const;
export type LogoName = (typeof logoNames)[number];
