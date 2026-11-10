import { getWeekdayOptions, SelectableValues } from '@app-builder/components/SelectableValues';
import { FormatContext } from '@app-builder/contexts/FormatContext';
import { cidrSchema } from '@app-builder/schemas/settings';
import { type RoleBinding } from 'marble-api';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Checkbox, Input } from 'ui-design-system';
import { z } from 'zod/v4';

export type RoleConditions = NonNullable<RoleBinding['conditions']>;

function dateInputValue(value: string | undefined, timeZone: string) {
  if (!value) return '';
  try {
    return Temporal.Instant.from(value)
      .toZonedDateTimeISO(timeZone)
      .toPlainDateTime()
      .toString({ smallestUnit: 'minute' });
  } catch {
    return value;
  }
}

function dateValue(value: string, timeZone: string) {
  if (!value) return undefined;
  try {
    return Temporal.PlainDateTime.from(value)
      .toZonedDateTime(timeZone, { disambiguation: 'reject' })
      .toInstant()
      .toString();
  } catch {
    return value;
  }
}

function timeInputValue(value: number | undefined) {
  if (value === undefined || value < 0) return '';
  const digits = String(value).padStart(4, '0');
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function RoleBindingConditions({
  value,
  onChange,
  timeZone,
  disabled,
}: {
  value: RoleConditions;
  onChange: (conditions: RoleConditions) => void;
  timeZone: string;
  disabled: boolean;
}) {
  const { t } = useTranslation(['settings']);
  const { locale } = FormatContext.useValue();
  const id = useId();
  const [networks, setNetworks] = useState((value.networks ?? []).join('\n'));
  const [enabled, setEnabled] = useState({
    dates: value.not_before !== undefined || value.not_after !== undefined,
    days: (value.day_of_week?.length ?? 0) > 0,
    time: value.time_of_day !== undefined,
    networks: (value.networks?.length ?? 0) > 0,
  });
  const [draft, setDraft] = useState<RoleConditions>({});
  const invalidNetworks = (value.networks ?? []).some((network) => !cidrSchema.safeParse(network).success);
  const invalidDates =
    [value.not_before, value.not_after].some(
      (date) => date !== undefined && !z.iso.datetime({ offset: true }).safeParse(date).success,
    ) ||
    (!!value.not_before && !!value.not_after && Date.parse(value.not_before) > Date.parse(value.not_after));
  const invalidTime = value.time_of_day?.some((time) => time < 0) ?? false;

  const setTime = (index: number, input: string) => {
    const times = [...(value.time_of_day ?? [-1, -1])];
    times[index] = input ? Number(input.replace(':', '')) : -1;
    onChange({ ...value, time_of_day: times });
  };

  const toggle = (kind: keyof typeof enabled, checked: boolean) => {
    setEnabled({ ...enabled, [kind]: checked });
    if (kind === 'dates') {
      if (checked) {
        onChange({
          ...value,
          not_before: draft.not_before ?? (draft.not_after ? undefined : ''),
          not_after: draft.not_after,
        });
      } else {
        setDraft({ ...draft, not_before: value.not_before, not_after: value.not_after });
        onChange({ ...value, not_before: undefined, not_after: undefined });
      }
    } else {
      const key = kind === 'days' ? 'day_of_week' : kind === 'time' ? 'time_of_day' : 'networks';
      if (checked) {
        onChange({ ...value, [key]: draft[key] ?? (kind === 'days' ? [-1] : kind === 'time' ? [-1, -1] : ['']) });
      } else {
        setDraft({ ...draft, [key]: value[key] });
        onChange({ ...value, [key]: undefined });
      }
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <p className="text-s text-grey-secondary">{t('settings:users.role.conditions.description')}</p>
      <label className="flex items-center gap-sm text-s">
        <Checkbox
          size="small"
          checked={enabled.dates}
          disabled={disabled}
          onCheckedChange={(checked) => toggle('dates', checked === true)}
        />
        {t('settings:users.role.conditions.enable_dates')}
      </label>
      {enabled.dates ? (
        <div className="flex flex-col gap-sm ps-lg">
          <p className="text-s text-grey-secondary">
            {t('settings:users.role.conditions.timezone', { timezone: timeZone })}
          </p>
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
            {(['not_before', 'not_after'] as const).map((key) => (
              <label key={key} className="flex min-w-0 flex-col gap-xs text-s">
                {t(
                  key === 'not_before'
                    ? 'settings:users.role.conditions.start_date'
                    : 'settings:users.role.conditions.end_date',
                )}
                <Input
                  type="datetime-local"
                  value={dateInputValue(value[key], timeZone)}
                  disabled={disabled}
                  onChange={(event) => {
                    const next = { ...value, [key]: dateValue(event.currentTarget.value, timeZone) };
                    if (next.not_before === '' && key === 'not_after' && next.not_after) next.not_before = undefined;
                    if (!next.not_before && !next.not_after) next.not_before = '';
                    onChange(next);
                  }}
                />
              </label>
            ))}
          </div>
          {invalidDates ? (
            <p role="alert" className="text-s text-red-primary">
              {t('settings:users.role.conditions.date_error')}
            </p>
          ) : null}
        </div>
      ) : null}
      <label className="flex items-center gap-sm text-s">
        <Checkbox
          size="small"
          checked={enabled.days}
          disabled={disabled}
          onCheckedChange={(checked) => toggle('days', checked === true)}
        />
        {t('settings:users.role.conditions.days')}
      </label>
      {enabled.days ? (
        <fieldset
          className="flex flex-col gap-xs ps-lg"
          disabled={disabled}
          aria-label={t('settings:users.role.conditions.days')}
        >
          <SelectableValues
            options={getWeekdayOptions(locale)}
            selected={(value.day_of_week ?? []).filter((day) => day >= 1 && day <= 7)}
            disabled={disabled}
            onChange={(days) => onChange({ ...value, day_of_week: days.length ? days : [-1] })}
          />
          {value.day_of_week?.includes(-1) ? (
            <p role="alert" className="text-s text-red-primary">
              {t('settings:users.role.conditions.days_error')}
            </p>
          ) : null}
        </fieldset>
      ) : null}
      <label className="flex items-center gap-sm text-s">
        <Checkbox
          size="small"
          checked={enabled.time}
          disabled={disabled}
          onCheckedChange={(checked) => toggle('time', checked === true)}
        />
        {t('settings:users.role.conditions.enable_time')}
      </label>
      {enabled.time ? (
        <div className="flex flex-col gap-xs ps-lg">
          <p className="text-s text-grey-secondary">
            {t('settings:users.role.conditions.timezone', { timezone: timeZone })}
          </p>
          <p className="text-s text-grey-secondary">{t('settings:users.role.conditions.time_hint')}</p>
          <div className="grid grid-cols-2 gap-sm">
            {[0, 1].map((index) => (
              <label key={index} className="flex min-w-0 flex-col gap-xs text-s">
                {t(
                  index === 0 ? 'settings:users.role.conditions.start_time' : 'settings:users.role.conditions.end_time',
                )}
                <Input
                  type="time"
                  value={timeInputValue(value.time_of_day?.[index])}
                  disabled={disabled}
                  onChange={(event) => setTime(index, event.currentTarget.value)}
                />
              </label>
            ))}
          </div>
          {invalidTime ? (
            <p role="alert" className="text-s text-red-primary">
              {t('settings:users.role.conditions.time_error')}
            </p>
          ) : null}
        </div>
      ) : null}
      <label className="flex items-center gap-sm text-s">
        <Checkbox
          size="small"
          checked={enabled.networks}
          disabled={disabled}
          onCheckedChange={(checked) => toggle('networks', checked === true)}
        />
        {t('settings:users.role.conditions.enable_networks')}
      </label>
      {enabled.networks ? (
        <label htmlFor={`${id}-networks`} className="flex flex-col gap-xs ps-lg text-s">
          <span className="text-grey-secondary">{t('settings:users.role.conditions.networks_hint')}</span>
          <textarea
            id={`${id}-networks`}
            aria-label={t('settings:users.role.conditions.enable_networks')}
            value={networks}
            disabled={disabled}
            rows={3}
            className="w-full rounded-md border border-grey-border bg-surface-card p-sm text-s text-grey-primary"
            placeholder={t('settings:users.role.conditions.networks_placeholder')}
            onChange={(event) => {
              const input = event.currentTarget.value;
              setNetworks(input);
              const next = input
                .split(/[\n,]+/)
                .map((item) => item.trim())
                .filter(Boolean);
              onChange({ ...value, networks: next.length ? next : [''] });
            }}
          />
          {invalidNetworks ? (
            <span role="alert" className="text-red-primary">
              {t('settings:users.role.conditions.networks_error')}
            </span>
          ) : null}
        </label>
      ) : null}
      <label className="flex items-center gap-sm text-s">
        <Checkbox
          size="small"
          checked={value.used_second_factor === true}
          disabled={disabled}
          onCheckedChange={(checked) => onChange({ ...value, used_second_factor: checked === true ? true : undefined })}
        />
        {t('settings:users.role.conditions.second_factor')}
      </label>
    </div>
  );
}
