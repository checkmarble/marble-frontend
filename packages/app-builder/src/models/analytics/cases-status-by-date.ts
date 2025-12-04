import { CaseStatusByDateResponseDto } from 'marble-api';

export type CaseStatusByDateResponse = {
  date: string;
  pending: number;
  investigating: number;
  closed: number;
  snoozed: number;
};

export const adaptCaseStatusByDate = (value: CaseStatusByDateResponseDto): CaseStatusByDateResponse => {
  return {
    date: value.date,
    pending: value.pending,
    investigating: value.investigating,
    closed: value.closed,
    snoozed: value.snoozed,
  };
};
