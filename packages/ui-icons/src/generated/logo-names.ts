export const logoNames = ['google-logo', 'logo-favicon', 'logo-standard', 'logo', 'marble', 'microsoft-logo'] as const;
export type LogoName = (typeof logoNames)[number];

export const logoViewBoxes = {
  'google-logo': { width: 48, height: 48 },
  'logo-favicon': { width: 80, height: 80 },
  'logo-standard': { width: 357, height: 80 },
  logo: { width: 80, height: 80 },
  marble: { width: 237, height: 34 },
  'microsoft-logo': { width: 21, height: 21 },
} as const satisfies Record<LogoName, { width: number; height: number }>;
