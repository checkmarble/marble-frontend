import type { TFunction } from 'i18next';

export type ErrorMessageResolver = (message: string) => string | null;

export const createErrorTranslator = (t: TFunction, resolvers: ErrorMessageResolver[] = []) => {
  return (message: string) => {
    for (const resolve of resolvers) {
      const translationKey = resolve(message);
      if (translationKey) {
        return t(translationKey as any);
      }
    }

    try {
      return t(message as any);
    } catch {
      return message;
    }
  };
};
