import { type supportedLngs } from '../i18n-config';
import { en } from './en.server';
import { fr } from './fr.server';
import { ar } from './ar.server';

export const resources = {
  en,
  fr,
  ar,
} satisfies Record<(typeof supportedLngs)[number], typeof en>;
