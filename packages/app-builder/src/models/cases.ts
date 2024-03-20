import {
  type CaseCreatedEvent,
  type CaseDetailDto,
  type CaseEventDto,
  type CaseStatusUpdatedEvent,
  type CaseTagsUpdatedEventDto,
  type CommentAddedEvent,
  type DecisionAddedEvent,
  type Error,
  type FileAddedEvent,
  type InboxChangedEvent,
  type NameUpdatedEvent,
  type Outcome,
} from 'marble-api';

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
  decisions: {
    id: string;
    createdAt: string;
    triggerObject: Record<string, unknown>;
    triggerObjectType: string;
    outcome: Outcome;
    scenario: {
      id: string;
      name: string;
      description: string;
      scenarioIterationId: string;
      version: number;
    };
    score: number;
    error?: Error;
  }[];
  events: CaseEvent[];
}

export function adaptCaseDetailDto({
  events,
  decisions,
  ...rest
}: CaseDetailDto): CaseDetail {
  return {
    ...rest,
    decisions: decisions.map((decisionDto) => ({
      id: decisionDto.id,
      createdAt: decisionDto.created_at,
      triggerObject: decisionDto.trigger_object,
      triggerObjectType: decisionDto.trigger_object_type,
      outcome: decisionDto.outcome,
      scenario: {
        id: decisionDto.scenario.id,
        name: decisionDto.scenario.name,
        description: decisionDto.scenario.description,
        scenarioIterationId: decisionDto.scenario.scenario_iteration_id,
        version: decisionDto.scenario.version,
      },
      score: decisionDto.score,
    })),
    events: events.map(adaptCaseEventDto),
  };
}
