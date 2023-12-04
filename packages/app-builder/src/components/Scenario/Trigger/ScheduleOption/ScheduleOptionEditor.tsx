import { Label } from '@radix-ui/react-label';
import { type ParseKeys } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';
import { Checkbox, Select } from 'ui-design-system';

import { scenarioI18n } from '../../scenario-i18n';
import { type ScheduleOption } from './models';

const textForFrequency = {
  daily: 'scenarios:trigger.schedule_scenario.schedule_detail_daily_label',
  weekly: 'scenarios:trigger.schedule_scenario.schedule_detail_weekly_label',
  monthly: 'scenarios:trigger.schedule_scenario.schedule_detail_monthly_label',
} satisfies Record<string, ParseKeys<['scenarios']>>;

export function ScheduleOptionEditor({
  scheduleOption,
  setScheduleOption,
}: {
  scheduleOption: ScheduleOption;
  setScheduleOption: (schedule: ScheduleOption) => void;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(scenarioI18n);

  return (
    <>
      <div className="text-s flex items-center gap-1">
        <Checkbox
          id="scheduleScenario"
          name="scheduleScenario"
          defaultChecked={scheduleOption.isScenarioScheduled}
          onCheckedChange={() =>
            setScheduleOption({
              ...scheduleOption,
              isScenarioScheduled: !scheduleOption.isScenarioScheduled,
            })
          }
        />
        <Label htmlFor="scheduleScenario">
          {t('scenarios:trigger.schedule_scenario.option')}
        </Label>
      </div>
      {scheduleOption.isScenarioScheduled ? (
        <>
          <div className="text-s flex items-center gap-2">
            {t('scenarios:trigger.schedule_scenario.frequency_label')}
            <ScheduleFrequencySelect
              onChange={(frequency) => {
                setScheduleOption({
                  ...scheduleOption,
                  frequency,
                  scheduleDetail: getScheduleDetailOptions(
                    frequency,
                    language,
                  )[0],
                });
              }}
              value={scheduleOption.frequency}
            />
            {t(textForFrequency[scheduleOption.frequency])}
            <ScheduleDetailSelect
              frequency={scheduleOption.frequency}
              onChange={(value: string) =>
                setScheduleOption({ ...scheduleOption, scheduleDetail: value })
              }
              value={scheduleOption.scheduleDetail}
            />
          </div>
          {scheduleOption.frequency === 'monthly' &&
          ['29', '30', '31'].includes(scheduleOption.scheduleDetail) ? (
            <p className="text-s text-purple-100">
              <Trans
                t={t}
                i18nKey="scenarios:trigger.schedule_scenario.monthly_warning"
                values={{ scheduleDetail: scheduleOption.scheduleDetail }}
              />
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
}

const scheduleFrequencyOptions = [
  {
    value: 'daily',
    labelTKey: 'scenarios:trigger.schedule_scenario.frequency_daily',
  },
  {
    value: 'weekly',
    labelTKey: 'scenarios:trigger.schedule_scenario.frequency_weekly',
  },
  {
    value: 'monthly',
    labelTKey: 'scenarios:trigger.schedule_scenario.frequency_monthly',
  },
] satisfies Array<{
  value: ScheduleOption['frequency'];
  labelTKey: ParseKeys<['scenarios']>;
}>;

const ScheduleFrequencySelect = ({
  value,
  onChange,
}: {
  value: ScheduleOption['frequency'];
  onChange: (value: ScheduleOption['frequency']) => void;
}) => {
  const { t } = useTranslation(scenarioI18n);

  return (
    <Select.Default value={value} onValueChange={onChange}>
      {scheduleFrequencyOptions.map(({ value, labelTKey }) => (
        <Select.DefaultItem className="min-w-[110px]" key={value} value={value}>
          <span className="text-s text-grey-100">{t(labelTKey)}</span>
        </Select.DefaultItem>
      ))}
    </Select.Default>
  );
};

const ScheduleDetailSelect = ({
  value,
  onChange,
  frequency,
}: {
  value: string;
  onChange: (value: string) => void;
  frequency: ScheduleOption['frequency'];
}) => {
  const {
    i18n: { language },
  } = useTranslation(scenarioI18n);
  const scheduleDetailOptions = getScheduleDetailOptions(frequency, language);

  const displayNameForFrequency =
    (frequency: ScheduleOption['frequency']) => (option: string) => {
      switch (frequency) {
        case 'daily':
          return option.padStart(2, '0') + ':00';
        case 'weekly':
          return getWeekDayName(option, language);
        case 'monthly':
          return option;
      }
    };
  const displayName = displayNameForFrequency(frequency);

  return (
    <Select.Default value={value} onValueChange={onChange}>
      {scheduleDetailOptions.map((option) => (
        <Select.DefaultItem
          className="min-w-[110px]"
          key={option}
          value={option}
        >
          <span className="text-s text-grey-100">{displayName(option)}</span>
        </Select.DefaultItem>
      ))}
    </Select.Default>
  );
};

const getScheduleDetailOptions = (
  frequency: ScheduleOption['frequency'],
  locale: string,
) => {
  switch (frequency) {
    case 'daily':
      return dailyScheduleOptions;
    case 'weekly':
      return weeklyScheduleOptions(locale);
    case 'monthly':
      return monthlyScheduleOptions;
  }
};

const dailyScheduleOptions = Array.from({ length: 24 }, (_, i) => `${i}`);

const weekDays = Array.from({ length: 7 }, (_, i) => `${i}`);

const getWeekInfo = (
  locale: string,
): { firstDay: number; weekend: number[]; minimalDays: number } => {
  const intl = new Intl.Locale(locale);
  // Default to France weekInfo if not present
  return (
    // @ts-expect-error Property 'weekInfo' does not exist on type 'Locale'.
    intl.weekInfo ??
    // @ts-expect-error Property 'getWeekInfo' does not exist on type 'Locale'.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    intl.getWeekInfo?.() ?? { firstDay: 1, weekend: [6, 7], minimalDays: 4 }
  );
};

const weeklyScheduleOptions = (locale: string) => {
  const weekInfo = getWeekInfo(locale);
  if (weekInfo.firstDay === 1) {
    return [...weekDays.slice(1), weekDays[0]];
  }
  return weekDays;
};

const monthlyScheduleOptions = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

const getWeekDayName = (
  option: string,
  locale: string,
  format?: 'long' | 'short' | 'narrow',
) => {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: format ?? 'long',
    timeZone: 'UTC',
  });
  const day = parseInt(option) + 1;
  const date = new Date(`2017-01-0${day}T00:00:00+00:00`);
  return formatter.format(date);
};
