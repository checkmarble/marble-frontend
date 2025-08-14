import { createSimpleContext } from '@marble/shared';

export const AgnosticNavigationContext =
  createSimpleContext<(path: string) => void>('AgnosticNavigation');

export const useAgnosticNavigation = () => {
  return AgnosticNavigationContext.useValue();
};
