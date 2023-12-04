import type api from '../../../public/locales/en/api.json';
import type cases from '../../../public/locales/en/cases.json';
import type common from '../../../public/locales/en/common.json';
import type data from '../../../public/locales/en/data.json';
import type decisions from '../../../public/locales/en/decisions.json';
import type filters from '../../../public/locales/en/filters.json';
import type lists from '../../../public/locales/en/lists.json';
import type login from '../../../public/locales/en/login.json';
import type navigation from '../../../public/locales/en/navigation.json';
import type scenarios from '../../../public/locales/en/scenarios.json';
import type scheduledExecution from '../../../public/locales/en/scheduledExecution.json';
import type upload from '../../../public/locales/en/upload.json';
import { type defaultNS } from './i18n-config';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {
      api: typeof api;
      cases: typeof cases;
      common: typeof common;
      data: typeof data;
      decisions: typeof decisions;
      filters: typeof filters;
      navigation: typeof navigation;
      lists: typeof lists;
      login: typeof login;
      scenarios: typeof scenarios;
      scheduledExecution: typeof scheduledExecution;
      upload: typeof upload;
    };
  }
}
