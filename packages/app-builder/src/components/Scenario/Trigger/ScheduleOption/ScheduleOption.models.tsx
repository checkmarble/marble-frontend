type Frequency = 'daily' | 'weekly' | 'monthly';

export type ScheduleOption = {
  isScenarioScheduled: boolean;
  frequency: Frequency;
  scheduleDetail: string;
};

type Cron = string;
export const isCron = (value: string | undefined): value is Cron => {
  return value !== undefined && value.split(' ').length === 5;
};

const weeklyRegex = new RegExp(/^0 0 \* \* [0-6]$/);
const monthlyRegex = new RegExp(/^0 0 [1-31] \* \*$/);
const dailyRegex = new RegExp(/^0 [0-23] \* \* \*$/);

export function adaptCronToScheduleOption(
  cron: string
): ScheduleOption | undefined {
  if (!isCron(cron)) {
    return {
      isScenarioScheduled: false,
      frequency: 'daily',
      scheduleDetail: '0',
    };
  }
  console.log(cron.trim(), dailyRegex.test(cron.trim()));

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
  }
}

export function adaptScheduleOptionToCron({
  isScenarioScheduled,
  frequency,
  scheduleDetail,
}: ScheduleOption): Cron {
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
  }
}
