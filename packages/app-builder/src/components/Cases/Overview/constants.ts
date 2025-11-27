import { CaseStatusByInboxResponse } from '@app-builder/models/analytics/case-status-by-inbox';
import { CaseStatusByDateResponse } from '@app-builder/models/analytics/cases-status-by-date';
import { CaseStatus } from '@app-builder/models/cases';

export const inboxUserRoles = ['admin', 'member'] as const;
export type InboxUserRole = (typeof inboxUserRoles)[number];

export const inboxUserRoleLabels: Record<InboxUserRole, string> = {
  admin: 'Admin',
  member: 'Member',
};

export const graphCaseStatuses = ['snoozed', 'pending', 'investigating', 'closed'] as const;
export const graphStatusesColors: Record<Exclude<CaseStatus, 'waiting_for_action'>, string> = {
  snoozed: '#C1C0C8',
  pending: '#FFD57E',
  investigating: '#ADA7FD',
  closed: '#89D4AD',
};

// region: graph helpers

function getTotalValue(data: CaseStatusByDateResponse | CaseStatusByInboxResponse) {
  return graphCaseStatuses.reduce((acc, status) => acc + data[status], 0);
}

function getLastTickValue(maxValue: number) {
  const highestPow10Divider = Math.max(10, Math.pow(10, Math.floor(Math.log10(maxValue))));
  return Math.ceil(maxValue / highestPow10Divider) * highestPow10Divider;
}

export function getYAxisTicksValues(data: CaseStatusByDateResponse[] | CaseStatusByInboxResponse[]) {
  const maxValue = Math.max(...data.map(getTotalValue));
  if (maxValue === 0) {
    return [0, 200, 400, 600, 800, 1000];
  }

  const lastTickValue = getLastTickValue(maxValue);
  const ticksValues = Array.from({ length: 6 }, (_, i) => (lastTickValue / 5) * i);

  return ticksValues;
}

// endregion
