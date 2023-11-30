import { type Namespace } from 'i18next';

import { decisionsI18n } from '..';
import { filtersI18n } from '../Filters/filters-i18n';

export const casesI18n = [
  'cases',
  ...filtersI18n,
  ...decisionsI18n,
] satisfies Namespace;
