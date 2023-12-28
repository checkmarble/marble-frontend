export const logoNames = [
  'google-logo',
  'logo-favicon',
  'logo-standard',
  'logo',
  'marble',
] as const;

export type LogoName = (typeof logoNames)[number];
