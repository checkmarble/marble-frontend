/**
 * Static list of all i18n namespaces.
 * All namespaces are loaded upfront on both server and client.
 */
export const ALL_NAMESPACES = [
  'account',
  'analytics',
  'api',
  'auth',
  'cases',
  'client360',
  'common',
  'continuousScreening',
  'data',
  'decisions',
  'filters',
  'lists',
  'navigation',
  'scenarios',
  'screeningTopics',
  'screenings',
  'settings',
  'upload',
  'user-scoring',
  'workflows',
] as const;

export type Namespace = (typeof ALL_NAMESPACES)[number];
