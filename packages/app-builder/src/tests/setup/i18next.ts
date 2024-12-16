import { i18nConfig } from '@app-builder/services/i18n/i18n-config';
import { resources } from '@app-builder/services/i18n/resources/resources.server';
import i18next, { type TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';

export const i18nextTest = (await i18next.use(initReactI18next).init({
  ...i18nConfig,
  lng: 'en',
  fallbackLng: 'en',
  debug: false, // set to true to see more logs
  resources,
  // cf https://github.com/i18next/react-i18next/issues/1699
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as TFunction<any>;
