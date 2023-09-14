import { Label } from '@radix-ui/react-label';
import { Checkbox, Select } from '@ui-design-system';
import cronstrue from 'cronstrue';
import { type Namespace } from 'i18next';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';
const isFrequency = (value: string): value is Frequency =>
  ['daily', 'weekly', 'monthly'].includes(value);

type ScheduleOption = {
  isScenarioScheduled: boolean;
  frequency: Frequency;
  scheduleDetail: string;
};

type Cron = string;
export const isCron = (value: string | undefined): value is Cron => {
  return value !== undefined && value.split(' ').length === 5;
};

const NewDefaultScheduleOption = (): ScheduleOption => ({
  isScenarioScheduled: false,
  frequency: 'daily',
  scheduleDetail: '0',
});

export const adaptCronToScheduleOption = (cron: string): ScheduleOption => {
  if (!isCron(cron)) {
    return NewDefaultScheduleOption();
  }

  const cronArray = cron.split(' ');
  if (weeklyRegex.test(cron.trim())) {
    return {
      isScenarioScheduled: true,
      frequency: 'weekly',
      scheduleDetail: cronArray[4],
    };
  } else if (monthlyRegex.test(cron.trim())) {
    return {
      isScenarioScheduled: true,
      frequency: 'monthly',
      scheduleDetail: cronArray[2],
    };
  } else if (dailyRegex.test(cron.trim())) {
    return {
      isScenarioScheduled: true,
      frequency: 'daily',
      scheduleDetail: cronArray[1],
    };
  } else {
    return {
      isScenarioScheduled: true,
      frequency: 'custom',
      scheduleDetail: cron,
    };
  }
};

export const adaptScheduleOptionToCron = ({
  isScenarioScheduled,
  frequency,
  scheduleDetail,
}: ScheduleOption): Cron => {
  if (!isScenarioScheduled) {
    return '';
  }
  switch (frequency) {
    case 'daily':
      return `0 ${scheduleDetail} * * *`;
    case 'weekly':
      return `0 0 * * ${scheduleDetail}`;
    case 'monthly':
      return `0 0 ${scheduleDetail} * *`;
    case 'custom':
      return scheduleDetail;
  }
};

export const ScheduleOption = ({
  scheduleOption,
  setScheduleOption,
}: {
  scheduleOption: ScheduleOption;
  setScheduleOption: (schedule: ScheduleOption) => void;
}) => {
  const { t, i18n } = useTranslation(handle.i18n);

  const textForFrequency = useCallback(
    (frequency: Frequency) => {
      switch (frequency) {
        case 'daily':
          return t(
            'scenarios:trigger.schedule_scenario.schedule_detail_daily_label'
          );
        case 'weekly':
          return t(
            'scenarios:trigger.schedule_scenario.schedule_detail_weekly_label'
          );
        case 'monthly':
          return t(
            'scenarios:trigger.schedule_scenario.schedule_detail_monthly_label'
          );
      }
    },
    [t]
  );

  if (scheduleOption.frequency === 'custom') {
    return (
      <p className="text-s text-grey-100 font-normal">
        <Trans
          t={t}
          i18nKey="scenarios:scheduled"
          components={{
            ScheduleLocale: <span style={{ fontWeight: 'bold' }} />,
          }}
          values={{
            schedule: cronstrue
              .toString(scheduleOption.scheduleDetail, {
                verbose: false,
                locale: i18n.language,
                throwExceptionOnParseError: false,
              })
              .toLowerCase(),
          }}
        />
      </p>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Checkbox
          name="scheduleScenario"
          defaultChecked={scheduleOption.isScenarioScheduled}
          onCheckedChange={() =>
            setScheduleOption({
              ...scheduleOption,
              isScenarioScheduled: !scheduleOption.isScenarioScheduled,
            })
          }
        />
        <Label htmlFor="scheduleScenario" className="text-s">
          {t('scenarios:trigger.schedule_scenario.option')}
        </Label>
      </div>
      {scheduleOption.isScenarioScheduled && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-s">
              {t('scenarios:trigger.schedule_scenario.frequency_label')}
            </span>
            <ScheduleFrequencySelect
              onChange={(value: string) => {
                if (isFrequency(value)) {
                  setScheduleOption({
                    ...scheduleOption,
                    frequency: value,
                    scheduleDetail: optionsForFrequency(value)[0],
                  });
                }
              }}
              value={scheduleOption.frequency}
            />
            <span className="text-s">
              {textForFrequency(scheduleOption.frequency)}
            </span>
            <ScheduleDetailSelect
              frequency={scheduleOption.frequency}
              onChange={(value: string) =>
                setScheduleOption({ ...scheduleOption, scheduleDetail: value })
              }
              value={scheduleOption.scheduleDetail}
            />
          </div>
          {scheduleOption.frequency === 'monthly' &&
            ['29', '30', '31'].includes(scheduleOption.scheduleDetail) && (
              <p className="text-s text-purple-100">
                <Trans
                  t={t}
                  i18nKey="scenarios:trigger.schedule_scenario.monthly_warning"
                  values={{ scheduleDetail: scheduleOption.scheduleDetail }}
                />
              </p>
            )}
        </>
      )}
    </>
  );
};

const ScheduleFrequencySelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation(handle.i18n);

  const scheduleFrequencies = useMemo(
    () => [
      {
        value: 'daily',
        label: t('scenarios:trigger.schedule_scenario.frequency_daily'),
      },
      {
        value: 'weekly',
        label: t('scenarios:trigger.schedule_scenario.frequency_weekly'),
      },
      {
        value: 'monthly',
        label: t('scenarios:trigger.schedule_scenario.frequency_monthly'),
      },
    ],
    [t]
  );

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger>
        <Select.Value />
        <Select.Arrow />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {scheduleFrequencies.map(({ value, label }) => (
            <Select.Item className="min-w-[110px]" key={value} value={value}>
              <Select.ItemText>
                <span className="text-s text-grey-100">{label}</span>
              </Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
};

const ScheduleDetailSelect = ({
  value,
  onChange,
  frequency,
}: {
  value: string;
  onChange: (value: string) => void;
  frequency: Frequency;
}) => {
  const { i18n } = useTranslation(handle.i18n);
  const options = optionsForFrequency(frequency);

  const displayNameForFrequency =
    (frequency: Frequency) => (option: string) => {
      switch (frequency) {
        case 'daily':
          return option.padStart(2, '0') + ':00';
        case 'weekly':
          return getWeekDayName(option, i18n.language);
        case 'monthly':
          return option;
      }
    };
  const displayName = displayNameForFrequency(frequency);

  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger>
        <Select.Value />
        <Select.Arrow />
      </Select.Trigger>
      <Select.Content className="max-h-60">
        <Select.Viewport>
          {options.map((option) => (
            <Select.Item className="min-w-[110px]" key={option} value={option}>
              <Select.ItemText>
                <span className="text-s text-grey-100">
                  {displayName(option)}
                </span>
              </Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
};

const optionsForFrequency = (frequency: Frequency) => {
  switch (frequency) {
    case 'daily':
      return dailyScheduleOptions;
    case 'weekly':
      return weeklyScheduleOptions;
    case 'monthly':
      return monthlyScheduleOptions;
    case 'custom':
      return [];
  }
};

const dailyScheduleOptions = Array.from({ length: 24 }, (_, i) => i).map(
  (hour) => hour.toString()
);

const weekDays = Array.from({ length: 7 }, (_, i) => i).map((day) =>
  day.toString()
);
const weeklyScheduleOptions = [...weekDays.slice(1), weekDays[0]]; // Display Monday as first day of the week

const monthlyScheduleOptions = Array.from({ length: 31 }, (_, i) => i + 1).map(
  (day) => day.toString()
);

const weeklyRegex = new RegExp(/^0 0 \* \* [0-6]$/);
const monthlyRegex = new RegExp(/^0 0 [1-31] \* \*$/);
const dailyRegex = new RegExp(/^0 [0-23] \* \* \*$/);

const getWeekDayName = (
  option: string,
  locale: string,
  format?: 'long' | 'short' | 'narrow'
) => {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: format ?? 'long',
    timeZone: 'UTC',
  });
  const day = parseInt(option) + 1;
  const date = new Date(`2017-01-0${day}T00:00:00+00:00`);
  return formatter.format(date);
};
