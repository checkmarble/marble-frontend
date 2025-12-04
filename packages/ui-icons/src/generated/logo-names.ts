export const logoNames = ['google-logo', 'logo-favicon', 'marble', 'logo-standard', 'microsoft-logo', 'logo'] as const;
export type LogoName = (typeof logoNames)[number];
