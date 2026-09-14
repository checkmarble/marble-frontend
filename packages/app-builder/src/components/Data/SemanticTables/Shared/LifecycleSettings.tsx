import { Callout } from '@app-builder/components/Callout';
import {
  isInvalidLifecycleDuration,
  type LifecycleDurationFormValue,
  type LifecycleDurationUnit,
  lifecycleDurationUnits,
} from '@app-builder/models/duration';
import { Trans, useTranslation } from 'react-i18next';
import { Collapsible, cn, Input, SelectV2, Switch, Tag, Typo } from 'ui-design-system';
import type { SemanticTableFormValues } from './semanticData-types';

interface LifecycleSettingsProps {
  value: SemanticTableFormValues['lifecycle'];
  onChange: (value: SemanticTableFormValues['lifecycle']) => void;
  hasError?: boolean;
  className?: string;
}

export function LifecycleSettings({ value, onChange, hasError = false, className }: LifecycleSettingsProps) {
  const { t } = useTranslation(['data']);

  function updateDuration(key: 'deleteStaleRowsAfter' | 'deleteActiveRowsAfter', duration: LifecycleDurationFormValue) {
    onChange({ ...value, [key]: duration });
  }

  return (
    <Collapsible.Container
      className={cn('min-w-0 border-none p-0', hasError && 'bg-red-primary/5', className)}
      defaultOpen={false}
    >
      <Collapsible.Title size="xs" iconPosition="left">
        <button type="button" className="flex w-full items-center gap-sm">
          <Typo variant="subtitle2">{t('data:lifecycle.title')}</Typo>
          <Tag color={value.enabled ? 'green' : 'grey'}>
            {t(value.enabled ? 'data:lifecycle.status_enabled' : 'data:lifecycle.status_disabled')}
          </Tag>
        </button>
      </Collapsible.Title>
      <Collapsible.Content className="border-none" size="xs">
        <div className="flex flex-col gap-md">
          <div className="flex items-start justify-between gap-md">
            <p className="text-s text-grey-secondary">{t('data:lifecycle.description')}</p>
            <Switch
              checked={value.enabled}
              onCheckedChange={(enabled) => onChange({ ...value, enabled })}
              aria-label={t('data:lifecycle.enabled_label')}
            />
          </div>

          <Callout color="orange" icon="warning" iconColor="orange">
            <span>
              <Trans
                t={t}
                i18nKey="data:lifecycle.deletion_warning"
                components={{ LineBreak: <br />, Strong: <strong /> }}
              />
            </span>
          </Callout>

          <div className="flex min-w-0 flex-wrap gap-md">
            <LifecycleDurationField
              label={t('data:lifecycle.stale_rows_label')}
              value={value.deleteStaleRowsAfter}
              disabled={!value.enabled}
              onChange={(duration) => updateDuration('deleteStaleRowsAfter', duration)}
            />
            <LifecycleDurationField
              label={t('data:lifecycle.active_rows_label')}
              value={value.deleteActiveRowsAfter}
              disabled={!value.enabled}
              onChange={(duration) => updateDuration('deleteActiveRowsAfter', duration)}
            />
          </div>

          {hasError ? (
            <p className="text-xs text-red-primary">{t('data:lifecycle.validation_positive_integer')}</p>
          ) : null}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

interface LifecycleDurationFieldProps {
  label: string;
  value: LifecycleDurationFormValue;
  disabled: boolean;
  onChange: (value: LifecycleDurationFormValue) => void;
}

function LifecycleDurationField({ label, value, disabled, onChange }: LifecycleDurationFieldProps) {
  const { t } = useTranslation(['data']);
  const hasInvalidValue = isInvalidLifecycleDuration(value);

  return (
    <div className="flex w-fit max-w-full min-w-0 flex-col gap-xs">
      <label className="text-s text-grey-secondary whitespace-nowrap">{label}</label>
      <div className="flex gap-sm">
        <Input
          type="text"
          inputMode="numeric"
          value={value.inputValue ?? value.value ?? ''}
          disabled={disabled}
          placeholder={t('data:lifecycle.duration_placeholder')}
          aria-invalid={hasInvalidValue}
          borderColor={hasInvalidValue ? 'redfigma-47' : 'greyfigma-90'}
          onChange={(event) => {
            const inputValue = event.currentTarget.value;
            if (inputValue === '') {
              onChange({ unit: value.unit, value: undefined });
              return;
            }

            const parsedValue = Number(inputValue);
            if (!Number.isFinite(parsedValue)) {
              onChange({ unit: value.unit, inputValue, invalid: true });
              return;
            }

            onChange({
              unit: value.unit,
              value: parsedValue,
            });
          }}
          className="w-20 shrink-0"
        />
        <SelectV2<LifecycleDurationUnit | undefined>
          value={value.unit}
          disabled={disabled}
          placeholder={t('data:lifecycle.unit_months')}
          onChange={(unit) => {
            if (unit) onChange({ ...value, unit });
          }}
          options={lifecycleDurationUnits.map((unit) => ({
            value: unit,
            label: t(`data:lifecycle.unit_${unit}`),
          }))}
          className="min-w-0 w-32"
        />
      </div>
      {hasInvalidValue ? (
        <p className="text-xs text-red-primary">{t('data:lifecycle.validation_positive_integer')}</p>
      ) : null}
    </div>
  );
}
