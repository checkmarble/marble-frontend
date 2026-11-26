import { type defaultNS } from './i18n-config';
import { type en } from './resources/en';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof en;
  }
}
