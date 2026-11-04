import type { TracfinCatalogField, TracfinMapping } from '@app-builder/models/tracfin';
import type { TracfinCodeOption } from '@app-builder/models/tracfin/catalog-index';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { toCodeOptions } from './code-options';
import {
  type CurrencyEvidenceMode,
  getCurrencyEvidenceMode,
  setCurrencyEvidenceMode,
  setCurrencyEvidenceValue,
  setTargetCurrency,
  setUnit,
} from './mapping-edits';
import { OptionPicker } from './OptionPicker';

type AmountEditorProps = {
  mapping: TracfinMapping;
  targetField: TracfinCatalogField;
  /** `devises.csv` when the catalog ships it; otherwise currencies are typed. */
  currencies: readonly TracfinCodeOption[] | null;
  /** Fields of the table the source ends on, when known (suggestions for the source currency field). */
  sourceFieldNames: readonly string[] | null;
  onChange: (mapping: TracfinMapping) => void;
};

/**
 * A decimal target: how the source amount is scaled (`unit`), the currency of the declaration
 * (`target_currency`) and the evidence that the source is in that currency. The server converts
 * nothing: a constant must be the target currency, and the exact decimal is never computed here.
 */
export function AmountEditor({ mapping, targetField, currencies, sourceFieldNames, onChange }: AmountEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const mode = getCurrencyEvidenceMode(mapping);
  const currencyOptions = currencies ? toCodeOptions(currencies) : null;
  const evidenceValue = mode === 'constant' ? mapping.currency?.constant : mapping.currency?.field;

  const currencyPicker = (
    value: string | undefined,
    onPick: (currency: string) => void,
    ariaLabel: string,
    disabled = false,
  ) =>
    currencyOptions ? (
      <OptionPicker
        value={value || undefined}
        options={currencyOptions}
        onChange={onPick}
        ariaLabel={ariaLabel}
        placeholder={t('tracfin:settings.mapping.amount.choose_currency')}
        searchPlaceholder={t('tracfin:settings.organisation.search_code')}
        emptyLabel={t('tracfin:settings.organisation.no_code_found')}
        disabled={disabled}
      />
    ) : (
      <Input
        size="medium"
        value={value ?? ''}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(event) => onPick(event.currentTarget.value)}
      />
    );

  const modeButton = (candidate: CurrencyEvidenceMode) => (
    <Button
      variant={mode === candidate ? 'primary' : 'secondary'}
      appearance={mode === candidate ? 'filled' : 'stroked'}
      aria-pressed={mode === candidate}
      onClick={() => onChange(setCurrencyEvidenceMode(mapping, candidate))}
    >
      {t(`tracfin:settings.mapping.amount.evidence.${candidate}`)}
    </Button>
  );

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-s font-medium">{t('tracfin:settings.mapping.amount.title')}</p>
      <p className="text-grey-secondary text-xs">{t('tracfin:settings.mapping.amount.description')}</p>

      <div className="grid gap-sm md:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <span className="text-s">{t('tracfin:settings.mapping.amount.unit')}</span>
          <OptionPicker
            value={mapping.unit}
            options={[
              { value: 'major', label: t('tracfin:settings.mapping.amount.unit_major') },
              { value: 'minor', label: t('tracfin:settings.mapping.amount.unit_minor') },
            ]}
            onChange={(unit) => onChange(setUnit(mapping, unit === 'minor' ? 'minor' : 'major'))}
            ariaLabel={t('tracfin:settings.mapping.amount.unit')}
            placeholder={t('tracfin:settings.mapping.amount.choose_unit')}
            hasError={mapping.unit === undefined}
          />
          {mapping.unit === undefined ? (
            <p className="text-orange-primary text-xs">{t('tracfin:settings.mapping.amount.unit_missing')}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-xs">
          <span className="text-s">{t('tracfin:settings.mapping.amount.target_currency')}</span>
          {currencyPicker(
            mapping.target_currency,
            (currency) => onChange(setTargetCurrency(mapping, currency)),
            t('tracfin:settings.mapping.amount.target_currency'),
            // The profile proves this currency for the field: it is not a choice.
            targetField.currency !== undefined,
          )}
          {targetField.currency !== undefined ? (
            <p className="text-grey-secondary text-xs">
              {t('tracfin:settings.mapping.amount.currency_proven', { currency: targetField.currency })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <span className="text-s">{t('tracfin:settings.mapping.amount.evidence.title')}</span>
        <div role="group" aria-label={t('tracfin:settings.mapping.amount.evidence.title')} className="flex gap-xs">
          {modeButton('field')}
          {modeButton('constant')}
        </div>
        {mode === 'constant' ? (
          <>
            <div className="max-w-sm">
              {currencyPicker(
                evidenceValue,
                (currency) => onChange(setCurrencyEvidenceValue(mapping, currency)),
                t('tracfin:settings.mapping.amount.evidence.constant_aria'),
              )}
            </div>
            <p className="text-grey-secondary text-xs">{t('tracfin:settings.mapping.amount.evidence.no_conversion')}</p>
          </>
        ) : null}
        {mode === 'field' ? (
          <div className="max-w-sm">
            {sourceFieldNames ? (
              <OptionPicker
                value={evidenceValue || undefined}
                options={sourceFieldNames.map((name) => ({ value: name, label: name }))}
                onChange={(name) => onChange(setCurrencyEvidenceValue(mapping, name))}
                ariaLabel={t('tracfin:settings.mapping.amount.evidence.field_aria')}
                placeholder={t('tracfin:settings.mapping.source_field_placeholder')}
                searchPlaceholder={t('tracfin:settings.mapping.search_field')}
                emptyLabel={t('tracfin:settings.mapping.no_field')}
              />
            ) : (
              <Input
                size="medium"
                value={evidenceValue ?? ''}
                aria-label={t('tracfin:settings.mapping.amount.evidence.field_aria')}
                onChange={(event) => onChange(setCurrencyEvidenceValue(mapping, event.currentTarget.value))}
              />
            )}
          </div>
        ) : null}
        {mode === null ? (
          <p className="text-orange-primary text-xs">{t('tracfin:settings.mapping.amount.evidence.missing')}</p>
        ) : null}
      </div>
    </div>
  );
}
