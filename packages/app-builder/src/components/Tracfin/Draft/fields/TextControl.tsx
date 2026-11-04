import { useTranslation } from 'react-i18next';
import { cn, Input, TextArea } from 'ui-design-system';
import { textOf } from '../model/field-values';
import { isDateField, isLongText, maxLengthOf } from './labels';
import type { TracfinFieldControlProps } from './types';

/** Free text: a textarea for long texts, with a counter when the catalog bounds the length. */
export function TextControl({
  field,
  label,
  inputId,
  occurrence,
  disabled,
  onSet,
  onClear,
  onCommit,
}: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const text = textOf(occurrence);
  const maxLength = maxLengthOf(field);
  const tooLong = maxLength !== null && text.length > maxLength;
  const change = (value: string) => (value === '' ? onClear() : onSet({ kind: 'text', text: value }));

  return (
    <div className="flex min-w-0 flex-col gap-2xs">
      {isLongText(field) ? (
        <TextArea
          id={inputId}
          aria-label={label}
          rows={4}
          placeholder=""
          value={text}
          disabled={disabled}
          borderColor={tooLong ? 'redfigma-47' : 'greyfigma-90'}
          className="w-full"
          onChange={(event) => change(event.currentTarget.value)}
          onBlur={onCommit}
        />
      ) : (
        <Input
          id={inputId}
          aria-label={label}
          size="medium"
          value={text}
          disabled={disabled}
          placeholder={isDateField(field) ? t('tracfin:draft.date_placeholder') : undefined}
          borderColor={tooLong ? 'redfigma-47' : 'greyfigma-90'}
          onChange={(event) => change(event.currentTarget.value)}
          onBlur={onCommit}
        />
      )}
      {maxLength !== null ? (
        <span className={cn('text-xs', tooLong ? 'text-red-primary' : 'text-grey-secondary')}>
          {t('tracfin:draft.length_counter', { count: text.length, max: maxLength })}
        </span>
      ) : null}
    </div>
  );
}
