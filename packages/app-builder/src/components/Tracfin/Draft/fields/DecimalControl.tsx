import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';
import { textOf } from '../model/field-values';
import { DECIMAL_FORMAT } from './labels';
import type { TracfinFieldControlProps } from './types';

/**
 * An exact decimal, kept as the text the analyst typed: it is checked against `^-?\d+(\.\d+)?$` before
 * being queued and is never converted to a number. A text that fails the check stays on screen and is
 * not sent.
 */
export function DecimalControl({
  label,
  inputId,
  occurrence,
  disabled,
  onSet,
  onClear,
  onInvalidDecimal,
  onCommit,
}: TracfinFieldControlProps) {
  const { t } = useTranslation(['tracfin']);
  const text = textOf(occurrence);
  const invalid = occurrence.invalidText !== null;

  return (
    <div className="flex min-w-0 flex-col gap-2xs">
      <Input
        id={inputId}
        aria-label={label}
        inputMode="decimal"
        size="medium"
        value={text}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        borderColor={invalid ? 'redfigma-47' : 'greyfigma-90'}
        onChange={(event) => {
          const value = event.currentTarget.value;
          if (value === '') onClear();
          else if (DECIMAL_FORMAT.test(value)) onSet({ kind: 'decimal', decimal: value });
          else onInvalidDecimal(value);
        }}
        onBlur={onCommit}
      />
      {invalid ? <span className="text-red-primary text-xs">{t('tracfin:draft.decimal_invalid')}</span> : null}
    </div>
  );
}
