import { type supportedLngs } from '../i18n-config';
import { en } from './en.server';
import { fr } from './fr.server';

export const resources = {
  en,
  fr,
} satisfies Record<(typeof supportedLngs)[number], typeof en>;
