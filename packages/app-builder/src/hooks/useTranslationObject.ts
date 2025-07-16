import { TranslationObject } from '@app-builder/types/i18n';
import { FlatNamespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';

export function useTranslationObject<N extends readonly FlatNamespace[]>(
  namespaces: N,
): TranslationObject<N> {
  // Call all useTranslation hooks at the top level in a predictable order
  const translationHooks = namespaces.map((ns) => useTranslation(ns));

  // Create the translation object with the expected keys
  // @ts-expect-error - Creating objects with a dynamic subset of keys is always a pain
  return R.fromEntries(
    namespaces.map((ns, index) => [`t${R.capitalize(ns)}`, translationHooks[index]!.t] as const),
  );
}
