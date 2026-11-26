import { SelectableValues } from '@app-builder/components/SelectableValues';
import { FormatContext } from '@app-builder/contexts/FormatContext';
import { roleConditionsSchema } from '@app-builder/schemas/settings';
import { getWeekdayLabels } from '@app-builder/utils/calendar-labels';
import { type RoleBinding } from 'marble-api';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Temporal } from 'temporal-polyfill';
import { Checkbox, Input, TextArea } from 'ui-design-system';

export type RoleConditions = NonNullable<RoleBinding['conditions']>;

type SectionKind = 'dates' | 'days' | 'time' | 'networks';

const sectionKeys = {
  dates: ['not_before', 'not_after'],
  days: ['day_of_week'],
  time: ['time_of_day'],
  networks: ['networks'],
} as const satisfies Record<SectionKind, readonly (keyof RoleConditions)[]>;

// Placeholders the schema rejects, so a section that is enabled but left empty blocks saving.
const emptySections: Record<SectionKind, RoleConditions> = {
  dates: { not_before: '' },
  days: { day_of_week: [-1] },
  time: { time_of_day: [-1, -1] },
  networks: { networks: [''] },
};

export function activeConditionKinds(conditions?: RoleConditions) {
  if (!conditions) return [];
  return [
    !!(conditions.not_before || conditions.not_after) && 'dates',
    !!conditions.day_of_week?.length && 'days',
    !!conditions.time_of_day?.length && 'time',
    !!conditions.networks?.length && 'networks',
    conditions.used_second_factor === true && 'second_factor',
  ].filter((kind) => kind !== false);
}

function pickSection(conditions: RoleConditions, kind: SectionKind): RoleConditions {
  return Object.fromEntries(sectionKeys[kind].map((key) => [key, conditions[key]]));
}

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

function ConditionToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-sm text-s">
      <Checkbox size="small" checked={checked} onCheckedChange={(state) => onCheckedChange(state === true)} />
      {label}
    </label>
  );
}

export function RoleBindingConditions({
  value,
  onChange,
  timeZone,
}: {
  value: RoleConditions;
  onChange: (conditions: RoleConditions) => void;
  timeZone: string;
}) {
  const { t } = useTranslation(['settings']);
  const { locale } = FormatContext.useValue();
  const weekdays = useMemo(() => getWeekdayLabels(locale), [locale]);
  const [networks, setNetworks] = useState((value.networks ?? []).join('\n'));
  const [enabled, setEnabled] = useState(() => {
    const active = activeConditionKinds(value);
    return {
      dates: active.includes('dates'),
      days: active.includes('days'),
      time: active.includes('time'),
      networks: active.includes('networks'),
    };
  });
  // Values of a section while it is unchecked, restored when it is checked again.
  const [stash, setStash] = useState<RoleConditions>({});

  const invalidFields = new Set(roleConditionsSchema.safeParse(value).error?.issues.map(({ path }) => path[0]));
  const invalidDates = invalidFields.has('not_before') || invalidFields.has('not_after');

  const setTime = (index: number, input: string) => {
    const times = [...(value.time_of_day ?? [-1, -1])];
    times[index] = input ? Number(input.replace(':', '')) : -1;
    onChange({ ...value, time_of_day: times });
  };

  const toggle = (kind: SectionKind, checked: boolean) => {
    setEnabled({ ...enabled, [kind]: checked });
    if (checked) {
      const restored = R.pickBy(pickSection(stash, kind), (section) => section !== undefined);
      onChange({ ...value, ...(R.isEmpty(restored) ? emptySections[kind] : restored) });
    } else {
      setStash({ ...stash, ...pickSection(value, kind) });
      onChange({ ...value, ...pickSection({}, kind) });
    }
  };

  return (
    <div className="flex flex-col gap-md">
      <p className="text-s text-grey-secondary">{t('settings:users.role.conditions.description')}</p>
      <ConditionToggle
        label={t('settings:users.role.conditions.enable_dates')}
        checked={enabled.dates}
        onCheckedChange={(checked) => toggle('dates', checked)}
      />
      {enabled.dates ? (
        <div className="flex flex-col gap-sm ps-lg">
          <p className="text-s text-grey-secondary">
            {t('settings:users.role.conditions.timezone', { timezone: timeZone })}
          </p>
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
            {(
              [
                ['not_before', t('settings:users.role.conditions.start_date')],
                ['not_after', t('settings:users.role.conditions.end_date')],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex min-w-0 flex-col gap-xs text-s">
                {label}
                <Input
                  type="datetime-local"
                  value={dateInputValue(value[key], timeZone)}
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
      <ConditionToggle
        label={t('settings:users.role.conditions.days')}
        checked={enabled.days}
        onCheckedChange={(checked) => toggle('days', checked)}
      />
      {enabled.days ? (
        <fieldset className="flex flex-col gap-xs ps-lg" aria-label={t('settings:users.role.conditions.days')}>
          <SelectableValues
            options={weekdays}
            selected={(value.day_of_week ?? []).filter((day) => day >= 1 && day <= 7)}
            onChange={(days) => onChange({ ...value, day_of_week: days.length ? days : [-1] })}
          />
          {invalidFields.has('day_of_week') ? (
            <p role="alert" className="text-s text-red-primary">
              {t('settings:users.role.conditions.days_error')}
            </p>
          ) : null}
        </fieldset>
      ) : null}
      <ConditionToggle
        label={t('settings:users.role.conditions.enable_time')}
        checked={enabled.time}
        onCheckedChange={(checked) => toggle('time', checked)}
      />
      {enabled.time ? (
        <div className="flex flex-col gap-xs ps-lg">
          <p className="text-s text-grey-secondary">
            {t('settings:users.role.conditions.timezone', { timezone: timeZone })}
          </p>
          <p className="text-s text-grey-secondary">{t('settings:users.role.conditions.time_hint')}</p>
          <div className="grid grid-cols-2 gap-sm">
            {[t('settings:users.role.conditions.start_time'), t('settings:users.role.conditions.end_time')].map(
              (label, index) => (
                <label key={label} className="flex min-w-0 flex-col gap-xs text-s">
                  {label}
                  <Input
                    type="time"
                    value={timeInputValue(value.time_of_day?.[index])}
                    onChange={(event) => setTime(index, event.currentTarget.value)}
                  />
                </label>
              ),
            )}
          </div>
          {invalidFields.has('time_of_day') ? (
            <p role="alert" className="text-s text-red-primary">
              {t('settings:users.role.conditions.time_error')}
            </p>
          ) : null}
        </div>
      ) : null}
      <ConditionToggle
        label={t('settings:users.role.conditions.enable_networks')}
        checked={enabled.networks}
        onCheckedChange={(checked) => toggle('networks', checked)}
      />
      {enabled.networks ? (
        <label className="flex flex-col gap-xs ps-lg text-s">
          <span className="text-grey-secondary">{t('settings:users.role.conditions.networks_hint')}</span>
          <TextArea
            aria-label={t('settings:users.role.conditions.enable_networks')}
            value={networks}
            rows={3}
            borderColor={invalidFields.has('networks') ? 'redfigma-47' : 'greyfigma-90'}
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
          {invalidFields.has('networks') ? (
            <span role="alert" className="text-red-primary">
              {t('settings:users.role.conditions.networks_error')}
            </span>
          ) : null}
        </label>
      ) : null}
      <ConditionToggle
        label={t('settings:users.role.conditions.second_factor')}
        checked={value.used_second_factor === true}
        onCheckedChange={(checked) => onChange({ ...value, used_second_factor: checked ? true : undefined })}
      />
    </div>
  );
}
