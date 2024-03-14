import {
  type CaseCreatedEvent,
  type CaseDetailDto,
  type CaseEventDto,
  type CaseStatusUpdatedEvent,
  type CaseTagsUpdatedEventDto,
  type CommentAddedEvent,
  type DecisionAddedEvent,
  type FileAddedEvent,
  type InboxChangedEvent,
  type NameUpdatedEvent,
} from 'marble-api';

import { adaptDecision, type Decision } from './decision';

interface CaseTagsUpdatedEvent
  extends Omit<CaseTagsUpdatedEventDto, 'new_value'> {
  tagIds: string[];
}

export function adaptCaseTagsUpdatedEventDto({
  new_value,
  ...rest
}: CaseTagsUpdatedEventDto): CaseTagsUpdatedEvent {
  return {
    ...rest,
    tagIds: new_value === '' ? [] : new_value.split(','),
  };
}

export type {
  CaseCreatedEvent,
  CaseStatusUpdatedEvent,
  CaseTagsUpdatedEvent,
  CommentAddedEvent,
  DecisionAddedEvent,
  FileAddedEvent,
  InboxChangedEvent,
  NameUpdatedEvent,
};

export type CaseEvent =
  | CaseCreatedEvent
  | CaseStatusUpdatedEvent
  | DecisionAddedEvent
  | CommentAddedEvent
  | NameUpdatedEvent
  | CaseTagsUpdatedEvent
  | FileAddedEvent
  | InboxChangedEvent;

export function adaptCaseEventDto(caseEventDto: CaseEventDto): CaseEvent {
  switch (caseEventDto.event_type) {
    case 'tags_updated':
      return adaptCaseTagsUpdatedEventDto(caseEventDto);
    default:
      return caseEventDto;
  }
}

export interface CaseDetail
  extends Omit<CaseDetailDto, 'events' | 'decisions'> {
  decisions: Decision[];
  events: CaseEvent[];
}

export function adaptCaseDetailDto({
  events,
  decisions,
  ...rest
}: CaseDetailDto): CaseDetail {
  return {
    ...rest,
    decisions: decisions.map(adaptDecision),
    events: events.map(adaptCaseEventDto),
  };
}
