import { i18nConfig } from '@app-builder/services/i18n/i18n-config';
import { resources } from '@app-builder/services/i18n/resources/resources';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

await i18next.use(initReactI18next).init({
  ...i18nConfig,
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  resources,
});
