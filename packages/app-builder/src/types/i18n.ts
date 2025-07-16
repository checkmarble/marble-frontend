import { FlatNamespace, TFunction } from 'i18next';

export type TranslationObject<N extends readonly FlatNamespace[]> = {
  [key in N[number] as `t${Capitalize<key>}`]: TFunction<key, undefined>;
};
