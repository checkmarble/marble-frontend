import { CaseStatusByInboxResponseDto } from 'marble-api';

export type CaseStatusByInboxResponse = {
  inbox: string;
  pending: number;
  investigating: number;
  closed: number;
  snoozed: number;
};

export const adaptCaseStatusByInbox = (value: CaseStatusByInboxResponseDto): CaseStatusByInboxResponse => {
  return {
    inbox: value.inbox,
    pending: value.pending,
    investigating: value.investigating,
    closed: value.closed,
    snoozed: value.snoozed,
  };
};
