import { type supportedLngs } from '../i18n-config';
import { ar } from './ar.server';
import { en } from './en.server';
import { fr } from './fr.server';
import { pt } from './pt.server';

export const resources = {
  en,
  fr,
  ar,
  pt,
} satisfies Record<(typeof supportedLngs)[number], typeof en>;
