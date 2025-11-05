import { createSimpleContext } from '@marble/shared';

type Path = string | { pathname: string; search?: string; hash?: string };

type NavigateOptions = {
  replace?: boolean;
};

interface NavigateFunction {
  (to: Path, options?: NavigateOptions): void;
  (delta: number): void;
}

export const AgnosticNavigationContext =
  createSimpleContext<NavigateFunction>('AgnosticNavigation');

export const useAgnosticNavigation = () => {
  return AgnosticNavigationContext.useValue();
};
