import type common from '../../../public/locales/en/common.json';
import type data from '../../../public/locales/en/data.json';
import type decisions from '../../../public/locales/en/decisions.json';
import type lists from '../../../public/locales/en/lists.json';
import type login from '../../../public/locales/en/login.json';
import type navigation from '../../../public/locales/en/navigation.json';
import type scenarios from '../../../public/locales/en/scenarios.json';
import type defaultNS from './i18n-config';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {
      common: typeof common;
      data: typeof data;
      navigation: typeof navigation;
      decisions: typeof decisions;
      lists: typeof lists;
      login: typeof login;
      scenarios: typeof scenarios;
    };
  }
}
