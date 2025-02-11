import { type Namespace } from 'i18next';

import { decisionsI18n } from '../Decisions/decisions-i18n';
import { filtersI18n } from '../Filters/filters-i18n';
import { sanctionsI18n } from '../Sanctions/sanctions-i18n';

export const casesI18n = [
  'cases',
  ...filtersI18n,
  ...decisionsI18n,
  ...sanctionsI18n,
] satisfies Namespace;
