import {
  type CaseContributorDto,
  type CaseDetailDto,
  type CaseDto,
  type CaseEventDto,
  type CaseFileDto,
  type CaseTagDto,
  type ClientObjectDetailDto,
  type CreateCaseBodyDto,
  type Error,
  type PivotObjectDto,
  type UpdateCaseBodyDto,
} from 'marble-api';
import * as R from 'remeda';
import { assertNever } from 'typescript-utils';

import { adaptClientObjectDetail, type ClientObjectDetail } from './data-model';
import { type ReviewStatus } from './decision';
import { type Outcome } from './outcome';

export const caseStatuses = ['open', 'investigating', 'discarded', 'resolved'] as const;
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
  snoozedUntil?: string;
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
    snoozedUntil: dto.snoozed_until,
  };
}

export const caseEventTypes = [
  'case_snoozed',
  'case_unsnoozed',
  'case_created',
  'status_updated',
  'decision_added',
  'comment_added',
  'name_updated',
  'tags_updated',
  'file_added',
  'inbox_changed',
  'rule_snooze_created',
  'decision_reviewed',
] as const;
export type CaseEventType = (typeof caseEventTypes)[number];

interface CaseEventBase<T extends CaseEventType> {
  id: string;
  caseId: string;
  createdAt: string;
  eventType: T;
}

export interface CaseSnoozedEvent extends CaseEventBase<'case_snoozed'> {
  snoozeUntil: string;
  userId: string;
}

export interface CaseUnsnoozedEvent extends CaseEventBase<'case_unsnoozed'> {
  userId: string;
}

export interface CaseCreatedEvent extends CaseEventBase<'case_created'> {
  userId?: string;
}
export interface CaseStatusUpdatedEvent extends CaseEventBase<'status_updated'> {
  userId: string;
  newStatus: CaseStatus;
}
export interface DecisionAddedEvent extends CaseEventBase<'decision_added'> {
  userId?: string;
}
export interface CommentAddedEvent extends CaseEventBase<'comment_added'> {
  comment: string;
  userId: string;
}
export interface NameUpdatedEvent extends CaseEventBase<'name_updated'> {
  newName: string;
  userId: string;
}
export interface CaseTagsUpdatedEvent extends CaseEventBase<'tags_updated'> {
  tagIds: string[];
  userId: string;
}
export interface FileAddedEvent extends CaseEventBase<'file_added'> {
  fileName: string;
  userId: string;
}
export interface InboxChangedEvent extends CaseEventBase<'inbox_changed'> {
  newInboxId: string;
  userId: string;
}
export interface RuleSnoozeCreatedEvent extends CaseEventBase<'rule_snooze_created'> {
  ruleSnoozeId: string;
  userId: string;
  comment: string;
}
export interface DecisionReviewedEvent extends CaseEventBase<'decision_reviewed'> {
  userId: string;
  reviewComment: string;
  finalStatus: 'approve' | 'decline';
  decisionId: string;
}

export type CaseEvent =
  | CaseSnoozedEvent
  | CaseUnsnoozedEvent
  | CaseCreatedEvent
  | CaseStatusUpdatedEvent
  | DecisionAddedEvent
  | CommentAddedEvent
  | NameUpdatedEvent
  | CaseTagsUpdatedEvent
  | FileAddedEvent
  | InboxChangedEvent
  | RuleSnoozeCreatedEvent
  | DecisionReviewedEvent;

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
        tagIds: caseEventDto.new_value === '' ? [] : caseEventDto.new_value.split(','),
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
    case 'decision_reviewed': {
      return {
        ...caseEvent,
        decisionId: caseEventDto.resource_id,
        eventType: 'decision_reviewed',
        reviewComment: caseEventDto.additional_note,
        finalStatus: caseEventDto.new_value,
        userId: caseEventDto.user_id,
      };
    }
    case 'case_snoozed': {
      return {
        ...caseEvent,
        eventType: 'case_snoozed',
        snoozeUntil: caseEventDto.new_value,
        userId: caseEventDto.user_id as string,
      };
    }
    case 'case_unsnoozed': {
      return {
        ...caseEvent,
        eventType: 'case_unsnoozed',
        userId: caseEventDto.user_id,
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
    reviewStatus?: ReviewStatus;
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
      reviewStatus: decisionDto.review_status,
      pivotValues: decisionDto.pivot_values.map(({ pivot_id, pivot_value }) => ({
        id: pivot_id ?? undefined,
        value: pivot_value ?? undefined,
      })),
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

export function adaptUpdateCaseBodyDto(body: CaseUpdateBody): UpdateCaseBodyDto {
  return {
    name: body.name,
    inbox_id: body.inboxId,
    status: body.status,
  };
}

export type PivotObject = {
  /** The "object_id" field of the pivot object. Can be null if the pivot type is "field" or if the pivot does point to another unique field than "object_id", and the object has not been ingested yet. */
  pivotObjectId?: string;
  /** The actual pivot value, as on the decision. This value is used for grouping decisions. */
  pivotValue: string;
  pivotId?: string;
  pivotType: 'field' | 'object';
  /** Name of the entity on which the pivot value is found. */
  pivotObjectName: string;
  /** Name of the field used as a pivot value */
  pivotFieldName: string;
  /** Whether the pivot object has been ingested or not (only for pivot type "object") */
  isIngested: boolean;
  /** Metadata of the pivot object, if it has been ingested (only for pivot type "object") */
  pivotObjectMetadata?: {
    validFrom?: string;
    [key: string]: unknown;
  };
  /** -> Data of the pivot object, if it is a pivot object and it has been ingested (only for pivot type "object"), otherwise {key:value} with the pivot field used. If it is an ingested object, may include nested objects {link_name:{object}} where link_name is the name of a link pointing from the pivot object, and object is the full data present on the object found following that link. */
  pivotObjectData: ClientObjectDetail;
  numberOfDecisions: number;
};

export function adaptPivotObject(dto: PivotObjectDto): PivotObject {
  return {
    pivotObjectId: dto.pivot_object_id,
    pivotValue: dto.pivot_value,
    pivotId: dto.pivot_id,
    pivotType: dto.pivot_type,
    pivotObjectName: dto.pivot_object_name,
    pivotFieldName: dto.pivot_field_name,
    isIngested: dto.is_ingested,
    pivotObjectData: adaptClientObjectDetail(dto.pivot_object_data),
    numberOfDecisions: dto.number_of_decisions,
  };
}
