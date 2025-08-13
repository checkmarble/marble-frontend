import { createSimpleContext } from '@marble/shared';

export const LoaderRevalidatorContext = createSimpleContext<() => void>('LoaderRevalidator');

export const useLoaderRevalidator = () => {
  return LoaderRevalidatorContext.useValue();
};
