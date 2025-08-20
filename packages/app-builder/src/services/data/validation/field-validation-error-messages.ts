import type { ErrorMessageResolver } from '@app-builder/utils/translate-error';
import { type TFunction } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type CreateFieldValidationErrorCode =
  | 'NAME_CONFLICT'
  | 'NAME_MIN'
  | 'NAME_REGEX'
  | 'NAME_RESERVED';

export function getCreateFieldValidationErrorTranslationKey(
  code: CreateFieldValidationErrorCode,
):
  | 'data:create_field.name_conflict_error'
  | 'data:create_field.name_min_error'
  | 'data:create_field.name_regex_error'
  | 'data:create_field.name_reserved_error'
  | 'common:errors.unknown' {
  switch (code) {
    case 'NAME_CONFLICT':
      return 'data:create_field.name_conflict_error';
    case 'NAME_MIN':
      return 'data:create_field.name_min_error';
    case 'NAME_REGEX':
      return 'data:create_field.name_regex_error';
    case 'NAME_RESERVED':
      return 'data:create_field.name_reserved_error';
    default:
      return 'common:errors.unknown';
  }
}

export function getCreateFieldValidationErrorMessage(
  t: TFunction<['data', 'common']>,
  code: CreateFieldValidationErrorCode,
) {
  return t(getCreateFieldValidationErrorTranslationKey(code));
}

export function useGetCreateFieldValidationErrorMessage() {
  const { t } = useTranslation(['data', 'common']);

  return useCallback(
    (code: CreateFieldValidationErrorCode) => t(getCreateFieldValidationErrorTranslationKey(code)),
    [t],
  );
}

export function isCreateFieldValidationErrorCode(
  value: unknown,
): value is CreateFieldValidationErrorCode {
  return (
    value === 'NAME_CONFLICT' ||
    value === 'NAME_MIN' ||
    value === 'NAME_REGEX' ||
    value === 'NAME_RESERVED'
  );
}

export const createFieldErrorResolver: ErrorMessageResolver = (message) =>
  isCreateFieldValidationErrorCode(message)
    ? getCreateFieldValidationErrorTranslationKey(message)
    : null;
