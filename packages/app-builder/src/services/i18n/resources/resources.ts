import { type supportedLngs } from '../i18n-config';
import { ar } from './ar';
import { en } from './en';
import { fr } from './fr';

export const resources = {
  'en-GB': en,
  'en-US': en, // Reuse English translations, date/number formatting differs via locale
  fr,
  ar,
} satisfies Record<(typeof supportedLngs)[number], typeof en>;
