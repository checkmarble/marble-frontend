import { type RuleSnoozeCreatedEvent } from '@app-builder/models/cases';

export const RuleSnoozeCreatedDetail = (_: { event: RuleSnoozeCreatedEvent }) => {
  return <span>Rule snooze created</span>;
};
