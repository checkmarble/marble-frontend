import type api from '../../../public/locales/en/api.json';
import type auth from '../../../public/locales/en/auth.json';
import type cases from '../../../public/locales/en/cases.json';
import type common from '../../../public/locales/en/common.json';
import type data from '../../../public/locales/en/data.json';
import type decisions from '../../../public/locales/en/decisions.json';
import type filters from '../../../public/locales/en/filters.json';
import type lists from '../../../public/locales/en/lists.json';
import type navigation from '../../../public/locales/en/navigation.json';
import type scenarios from '../../../public/locales/en/scenarios.json';
import type scheduledExecution from '../../../public/locales/en/scheduledExecution.json';
import type settings from '../../../public/locales/en/settings.json';
import type transfercheck from '../../../public/locales/en/transfercheck.json';
import type upload from '../../../public/locales/en/upload.json';
import type workflows from '../../../public/locales/en/workflows.json';
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
      auth: typeof auth;
      scenarios: typeof scenarios;
      scheduledExecution: typeof scheduledExecution;
      settings: typeof settings;
      transfercheck: typeof transfercheck;
      upload: typeof upload;
      workflows: typeof workflows;
    };
  }
}
