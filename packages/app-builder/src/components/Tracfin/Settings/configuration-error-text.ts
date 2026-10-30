import type { ParseKeys, TFunction } from 'i18next';
import { isKnownConfigurationErrorCode } from './configuration-errors';

/** The human-readable text of a diagnostic code; an unknown code is shown as it is. */
export function describeConfigurationErrorCode(t: TFunction<['tracfin']>, code: string): string {
  if (!isKnownConfigurationErrorCode(code)) return code;
  return t(`tracfin:settings.errors.codes.${code}` as ParseKeys<['tracfin']>, { defaultValue: code });
}
