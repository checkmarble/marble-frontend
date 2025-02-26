type Frequency = 'daily' | 'weekly' | 'monthly';

export type ScheduleOption = {
  isScenarioScheduled: boolean;
  frequency: Frequency;
  scheduleDetail: string;
};

const editableCron = [
  {
    frequency: 'daily',
    regex: new RegExp(/^0 (?<scheduleDetail>([0-9]|1[0-9]|[2][0-3])) \* \* \*$/),
  },
  {
    frequency: 'weekly',
    regex: new RegExp(/^0 0 \* \* (?<scheduleDetail>[0-6])$/),
  },
  {
    frequency: 'monthly',
    regex: new RegExp(/^0 0 (?<scheduleDetail>([1-9]|[12][0-9]|3[01])) \* \*$/),
  },
] satisfies { frequency: Frequency; regex: RegExp }[];

export function isEditableScheduleOption(schedule: string): boolean {
  if (!schedule) return true;

  for (const { regex } of editableCron) {
    if (regex.test(schedule)) {
      return true;
    }
  }

  return false;
}

export function adaptScheduleOption(schedule: string): ScheduleOption {
  for (const { frequency, regex } of editableCron) {
    const match = schedule.trim().match(regex);
    const scheduleDetail = match?.groups?.['scheduleDetail'];

    if (scheduleDetail) {
      return {
        isScenarioScheduled: true,
        frequency,
        scheduleDetail,
      };
    }
  }

  return {
    isScenarioScheduled: false,
    frequency: 'daily',
    scheduleDetail: '0',
  };
}

export function adaptScheduleOptionToCron({
  isScenarioScheduled,
  frequency,
  scheduleDetail,
}: ScheduleOption): string {
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
