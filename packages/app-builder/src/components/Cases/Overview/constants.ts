import { CaseStatusByInboxResponse } from '@app-builder/models/analytics/case-status-by-inbox';
import { CaseStatusByDateResponse } from '@app-builder/models/analytics/cases-status-by-date';
import { CaseStatus } from '@app-builder/models/cases';

export const INBOX_USER_ROW_VARIANTS = {
  default: 'default',
  panel: 'panel',
} as const;

export type InboxUserRowVariant = (typeof INBOX_USER_ROW_VARIANTS)[keyof typeof INBOX_USER_ROW_VARIANTS];

export const graphCaseStatuses = ['snoozed', 'pending', 'investigating', 'closed'] as const;

export const graphStatusesColors: Record<
  Exclude<CaseStatus, 'waiting_for_action'>,
  { bar: string; bg: string; text: string }
> = {
  snoozed: { bar: '#C1C0C8', bg: '#F3F3F4', text: '#838292' },
  pending: { bar: '#F5D37A', bg: '#FEF6DF', text: '#C78700' },
  investigating: { bar: '#ADA7FD', bg: '#EEEDFE', text: '#5A50FA' },
  closed: { bar: '#7DD4A3', bg: '#E1F4EA', text: '#18AA5F' },
};

// region: graph helpers

const DEFAULT_TICKS_VALUES = [0, 200, 400, 600, 800, 1000];

function getTotalValue(data: CaseStatusByDateResponse | CaseStatusByInboxResponse) {
  return graphCaseStatuses.reduce((acc, status) => acc + data[status], 0);
}

function getLastTickValue(maxValue: number) {
  const highestPow10Divider = Math.max(10, Math.pow(10, Math.floor(Math.log10(maxValue))));
  return Math.ceil(maxValue / highestPow10Divider) * highestPow10Divider;
}

export function getYAxisTicksValues(data: CaseStatusByDateResponse[] | CaseStatusByInboxResponse[]) {
  if (!data.length) {
    return DEFAULT_TICKS_VALUES;
  }

  const maxValue = Math.max(...data.map(getTotalValue));
  if (maxValue === 0) {
    return DEFAULT_TICKS_VALUES;
  }

  const lastTickValue = getLastTickValue(maxValue);
  const ticksValues = Array.from({ length: 6 }, (_, i) => (lastTickValue / 5) * i);

  return ticksValues;
}

// endregion
