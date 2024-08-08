import {
  type CaseContributorDto,
  type CaseDetailDto,
  type CaseDto,
  type CaseEventDto,
  type CaseFileDto,
  type CaseTagDto,
  type CreateCaseBodyDto,
  type Error,
  type Outcome,
  type UpdateCaseBodyDto,
} from 'marble-api';
import * as R from 'remeda';
import { assertNever } from 'typescript-utils';

export const caseStatuses = [
  'open',
  'investigating',
  'discarded',
  'resolved',
] as const;
export type CaseStatus = (typeof caseStatuses)[number];

export interface CaseContributor {
  id: string;
  caseId: string;
  userId: string;
  createdAt: string;
}

export function adaptCaseContributor(dto: CaseContributorDto): CaseContributor {
  return {
    id: dto.id,
    caseId: dto.case_id,
    userId: dto.user_id,
    createdAt: dto.created_at,
  };
}

export interface CaseTag {
  id: string;
  caseId: string;
  tagId: string;
  createdAt: string;
}

export function adaptCaseTag(dto: CaseTagDto): CaseTag {
  return {
    id: dto.id,
    caseId: dto.case_id,
    tagId: dto.tag_id,
    createdAt: dto.created_at,
  };
}

export interface Case {
  id: string;
  createdAt: string;
  decisionsCount: number;
  name: string;
  status: CaseStatus;
  inboxId: string;
  contributors: CaseContributor[];
  tags: CaseTag[];
}

export function adaptCase(dto: CaseDto): Case {
  return {
    id: dto.id,
    createdAt: dto.created_at,
    decisionsCount: dto.decisions_count,
    name: dto.name,
    status: dto.status,
    inboxId: dto.inbox_id,
    contributors: dto.contributors.map(adaptCaseContributor),
    tags: dto.tags.map(adaptCaseTag),
  };
}

interface CaseEventBase {
  id: string;
  caseId: string;
  createdAt: string;
}

export interface CaseCreatedEvent extends CaseEventBase {
  eventType: 'case_created';
  userId?: string;
}
export interface CaseStatusUpdatedEvent extends CaseEventBase {
  eventType: 'status_updated';
  userId: string;
  newStatus: CaseStatus;
}
export interface DecisionAddedEvent extends CaseEventBase {
  eventType: 'decision_added';
  userId?: string;
}
export interface CommentAddedEvent extends CaseEventBase {
  eventType: 'comment_added';
  comment: string;
  userId: string;
}
export interface NameUpdatedEvent extends CaseEventBase {
  eventType: 'name_updated';
  newName: string;
  userId: string;
}
export interface CaseTagsUpdatedEvent extends CaseEventBase {
  eventType: 'tags_updated';
  tagIds: string[];
  userId: string;
}
export interface FileAddedEvent extends CaseEventBase {
  eventType: 'file_added';
  fileName: string;
  userId: string;
}
export interface InboxChangedEvent extends CaseEventBase {
  eventType: 'inbox_changed';
  newInboxId: string;
  userId: string;
}
export interface RuleSnoozeCreated extends CaseEventBase {
  eventType: 'rule_snooze_created';
  ruleSnoozeId: string;
  userId: string;
  comment: string;
}

export type CaseEvent =
  | CaseCreatedEvent
  | CaseStatusUpdatedEvent
  | DecisionAddedEvent
  | CommentAddedEvent
  | NameUpdatedEvent
  | CaseTagsUpdatedEvent
  | FileAddedEvent
  | InboxChangedEvent
  | RuleSnoozeCreated;

export function adaptCaseEventDto(caseEventDto: CaseEventDto): CaseEvent {
  const caseEvent = {
    id: caseEventDto.id,
    caseId: caseEventDto.case_id,
    createdAt: caseEventDto.created_at,
  };
  const { event_type } = caseEventDto;
  switch (event_type) {
    case 'case_created': {
      return {
        ...caseEvent,
        eventType: 'case_created',
        userId: caseEventDto.user_id,
      };
    }
    case 'status_updated': {
      return {
        ...caseEvent,
        eventType: 'status_updated',
        newStatus: caseEventDto.new_value,
        userId: caseEventDto.user_id,
      };
    }
    case 'decision_added': {
      return {
        ...caseEvent,
        eventType: 'decision_added',
        userId: caseEventDto.user_id,
      };
    }
    case 'comment_added': {
      return {
        ...caseEvent,
        eventType: 'comment_added',
        comment: caseEventDto.additional_note,
        userId: caseEventDto.user_id,
      };
    }
    case 'name_updated': {
      return {
        ...caseEvent,
        eventType: 'name_updated',
        newName: caseEventDto.new_value,
        userId: caseEventDto.user_id,
      };
    }
    case 'tags_updated': {
      return {
        ...caseEvent,
        eventType: 'tags_updated',
        tagIds:
          caseEventDto.new_value === ''
            ? []
            : caseEventDto.new_value.split(','),
        userId: caseEventDto.user_id,
      };
    }
    case 'file_added': {
      return {
        ...caseEvent,
        eventType: 'file_added',
        fileName: caseEventDto.additional_note,
        userId: caseEventDto.user_id,
      };
    }
    case 'inbox_changed': {
      return {
        ...caseEvent,
        eventType: 'inbox_changed',
        newInboxId: caseEventDto.new_value,
        userId: caseEventDto.user_id,
      };
    }
    case 'rule_snooze_created': {
      return {
        ...caseEvent,
        eventType: 'rule_snooze_created',
        userId: caseEventDto.user_id,
        ruleSnoozeId: caseEventDto.resource_id,
        comment: caseEventDto.additional_note,
      };
    }
    default:
      assertNever('[CaseEventDto] unknown event:', event_type);
  }
}

export interface CaseFile {
  id: string;
  caseId: string;
  fileName: string;
  createdAt: string;
}

export function adaptCaseFile(dto: CaseFileDto): CaseFile {
  return {
    id: dto.id,
    caseId: dto.case_id,
    fileName: dto.file_name,
    createdAt: dto.created_at,
  };
}

export interface CaseDetail extends Case {
  decisions: {
    id: string;
    createdAt: string;
    triggerObject: Record<string, unknown>;
    triggerObjectType: string;
    outcome: Outcome;
    pivotValues: {
      id?: string;
      value?: string;
    }[];
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
  files: CaseFile[];
}

export function adaptCaseDetail(dto: CaseDetailDto): CaseDetail {
  return {
    ...adaptCase(dto),
    decisions: dto.decisions.map((decisionDto) => ({
      id: decisionDto.id,
      createdAt: decisionDto.created_at,
      triggerObject: decisionDto.trigger_object,
      triggerObjectType: decisionDto.trigger_object_type,
      outcome: decisionDto.outcome,
      pivotValues: decisionDto.pivot_values.map(
        ({ pivot_id, pivot_value }) => ({
          id: pivot_id ?? undefined,
          value: pivot_value ?? undefined,
        }),
      ),
      scenario: {
        id: decisionDto.scenario.id,
        name: decisionDto.scenario.name,
        description: decisionDto.scenario.description,
        scenarioIterationId: decisionDto.scenario.scenario_iteration_id,
        version: decisionDto.scenario.version,
      },
      score: decisionDto.score,
    })),
    events: dto.events.map(adaptCaseEventDto).filter(R.isNonNullish),
    files: dto.files.map(adaptCaseFile),
  };
}

export interface CaseCreateBody {
  name: string;
  inboxId: string;
  decisionIds?: string[];
}

export function adaptCaseCreateBody(body: CaseCreateBody): CreateCaseBodyDto {
  return {
    name: body.name,
    inbox_id: body.inboxId,
    decision_ids: body.decisionIds?.filter(Boolean),
  };
}

export interface CaseUpdateBody {
  name?: string;
  inboxId?: string;
  status?: CaseStatus;
}

export function adaptUpdateCaseBodyDto(
  body: CaseUpdateBody,
): UpdateCaseBodyDto {
  return {
    name: body.name,
    inbox_id: body.inboxId,
    status: body.status,
  };
}
