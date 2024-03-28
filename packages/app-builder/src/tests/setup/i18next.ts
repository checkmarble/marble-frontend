import { i18nConfig } from '@app-builder/services/i18n/i18n-config';
import i18next, { type TFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';

import api from '../../../public/locales/en/api.json';
import auth from '../../../public/locales/en/auth.json';
import cases from '../../../public/locales/en/cases.json';
import common from '../../../public/locales/en/common.json';
import data from '../../../public/locales/en/data.json';
import decisions from '../../../public/locales/en/decisions.json';
import filters from '../../../public/locales/en/filters.json';
import lists from '../../../public/locales/en/lists.json';
import navigation from '../../../public/locales/en/navigation.json';
import scenarios from '../../../public/locales/en/scenarios.json';
import scheduledExecution from '../../../public/locales/en/scheduledExecution.json';
import settings from '../../../public/locales/en/settings.json';
import upload from '../../../public/locales/en/upload.json';

const resources = {
  en: {
    api,
    auth,
    cases,
    common,
    data,
    decisions,
    filters,
    lists,
    navigation,
    scenarios,
    scheduledExecution,
    settings,
    upload,
  },
};

// eslint-disable-next-line import/no-named-as-default-member
export const i18nextTest = (await i18next.use(initReactI18next).init({
  ...i18nConfig,
  lng: 'en',
  fallbackLng: 'en',
  debug: true,
  resources,
  // cf https://github.com/i18next/react-i18next/issues/1699
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as TFunction<any>;
