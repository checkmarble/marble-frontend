import { type UnionToArray } from '@app-builder/utils/types';
import {
  type CaseContributorDto,
  type CaseDetailDto,
  type CaseDto,
  type CaseEventDto,
  type CaseFileDto,
  type CaseStatusDto,
  type CaseStatusForCaseEventDto,
  type CaseTagDto,
  type CreateCaseBodyDto,
  type CreateSuspiciousActivityReportBodyDto,
  type Error,
  type Outcome,
  type PivotObjectDto,
  type SuspiciousActivityReportDto,
  type UpdateCaseBodyDto,
  type UpdateSuspiciousActivityReportBodyDto,
  type UploadSuspiciousActivityReportBodyDto,
} from 'marble-api';
import { match } from 'ts-pattern';

import { adaptClientObjectDetail, type ClientObjectDetail } from './data-model';
import { type ReviewStatus } from './decision';
import { type Outcome as DecisionOutcome } from './outcome';

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

export type CaseStatus = CaseStatusDto;
export const caseStatuses: UnionToArray<CaseStatus> = ['pending', 'investigating', 'closed'];

export type CaseOutcome = Outcome;
export const caseOutcomes: CaseOutcome[] = [
  'false_positive',
  'valuable_alert',
  'confirmed_risk',
  'unset',
];

export type FinalOutcome = Exclude<CaseOutcome, 'unset'>;
export const finalOutcomes: UnionToArray<FinalOutcome> = [
  'false_positive',
  'valuable_alert',
  'confirmed_risk',
];

export interface Case {
  id: string;
  createdAt: string;
  decisionsCount: number;
  name: string;
  status: CaseStatus;
  inboxId: string;
  contributors: CaseContributor[];
  outcome: CaseOutcome;
  tags: CaseTag[];
  snoozedUntil?: string;
  assignedTo?: string;
}

export const adaptCase = (dto: CaseDto): Case => ({
  id: dto.id,
  createdAt: dto.created_at,
  decisionsCount: dto.decisions_count,
  name: dto.name,
  status: dto.status,
  outcome: dto.outcome,
  inboxId: dto.inbox_id,
  contributors: dto.contributors.map(adaptCaseContributor),
  tags: dto.tags.map(adaptCaseTag),
  snoozedUntil: dto.snoozed_until,
  assignedTo: dto.assigned_to,
});

//
// Case Events
//

export type CaseEventType = CaseEventDto['event_type'];
export const caseEventTypes: UnionToArray<CaseEventType> = [
  'case_created',
  'status_updated',
  'outcome_updated',
  'decision_added',
  'comment_added',
  'name_updated',
  'tags_updated',
  'file_added',
  'inbox_changed',
  'rule_snooze_created',
  'decision_reviewed',
  'case_snoozed',
  'case_unsnoozed',
  'case_assigned',
  'sar_created',
  'sar_deleted',
  'sar_status_changed',
  'sar_file_uploaded',
];

interface CaseEventBase<T extends CaseEventType> {
  id: string;
  caseId: string;
  createdAt: string;
  eventType: T;
}

export interface CaseCreatedEvent extends CaseEventBase<'case_created'> {
  userId?: string;
}

export interface CaseStatusUpdatedEvent extends CaseEventBase<'status_updated'> {
  userId: string;
  newStatus: CaseStatusForCaseEventDto;
}

export interface CaseOutcomeUpdatedEvent extends CaseEventBase<'outcome_updated'> {
  userId: string;
  newOutcome: CaseOutcome;
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
  resourceType: string;
  additionalNote: string;
  userId: string;
  comment: string;
}
export interface DecisionReviewedEvent extends CaseEventBase<'decision_reviewed'> {
  userId: string;
  comment: string;
  status: 'approve' | 'decline';
  previous: string;
  decisionId: string;
}

export interface CaseSnoozedEvent extends CaseEventBase<'case_snoozed'> {
  snoozeUntil: string;
  userId: string;
}

export interface CaseUnsnoozedEvent extends CaseEventBase<'case_unsnoozed'> {
  userId: string;
}

export interface CaseAssignedEvent extends CaseEventBase<'case_assigned'> {
  userId?: string;
  assignedTo: string;
}

export interface SarCreatedEvent extends CaseEventBase<'sar_created'> {
  userId?: string;
  sarId: string;
}

export interface SarDeletedEvent extends CaseEventBase<'sar_deleted'> {
  userId?: string;
  sarId: string;
}
export interface SarStatusChangedEvent extends CaseEventBase<'sar_status_changed'> {
  userId?: string;
  sarId: string;
  status: string;
}

export interface SarFileUploadedEvent extends CaseEventBase<'sar_file_uploaded'> {
  userId?: string;
  sarId: string;
  filename: string;
}

export type CaseEvent =
  | CaseCreatedEvent
  | CaseStatusUpdatedEvent
  | CaseOutcomeUpdatedEvent
  | DecisionAddedEvent
  | CommentAddedEvent
  | NameUpdatedEvent
  | CaseTagsUpdatedEvent
  | FileAddedEvent
  | InboxChangedEvent
  | RuleSnoozeCreatedEvent
  | DecisionReviewedEvent
  | CaseSnoozedEvent
  | CaseUnsnoozedEvent
  | CaseAssignedEvent
  | SarCreatedEvent
  | SarDeletedEvent
  | SarStatusChangedEvent
  | SarFileUploadedEvent;

export function adaptCaseEventDto(caseEventDto: CaseEventDto): CaseEvent {
  const baseEvent = {
    eventType: caseEventDto.event_type,
    id: caseEventDto.id,
    caseId: caseEventDto.case_id,
    createdAt: caseEventDto.created_at,
  };

  return match<CaseEventDto, CaseEvent>(caseEventDto)
    .with({ event_type: 'case_created' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
    }))
    .with({ event_type: 'status_updated' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      newStatus: dto.new_value,
    }))
    .with({ event_type: 'outcome_updated' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      newOutcome: dto.new_value,
    }))
    .with({ event_type: 'decision_added' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
    }))
    .with({ event_type: 'comment_added' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      comment: dto.additional_note,
    }))
    .with({ event_type: 'name_updated' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      newName: dto.new_value,
    }))
    .with({ event_type: 'tags_updated' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      tagIds: dto.new_value.split(','),
    }))
    .with({ event_type: 'file_added' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      fileName: dto.additional_note,
    }))
    .with({ event_type: 'inbox_changed' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      newInboxId: dto.new_value,
    }))
    .with({ event_type: 'rule_snooze_created' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      comment: dto.additional_note,
      ruleSnoozeId: dto.resource_id,
      resourceType: dto.resource_type,
      additionalNote: dto.additional_note,
    }))
    .with({ event_type: 'decision_reviewed' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      comment: dto.additional_note,
      status: dto.new_value,
      previous: dto.previous_value,
      decisionId: dto.resource_id,
    }))
    .with({ event_type: 'case_snoozed' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      snoozeUntil: dto.new_value,
    }))
    .with({ event_type: 'case_unsnoozed' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
    }))
    .with({ event_type: 'case_assigned' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      assignedTo: dto.new_value,
    }))
    .with({ event_type: 'sar_created' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      sarId: dto.resource_id,
    }))
    .with({ event_type: 'sar_deleted' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      sarId: dto.resource_id,
    }))
    .with({ event_type: 'sar_status_changed' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      sarId: dto.resource_id,
      status: dto.new_value,
    }))
    .with({ event_type: 'sar_file_uploaded' }, (dto) => ({
      ...baseEvent,
      eventType: dto.event_type,
      userId: dto.user_id,
      sarId: dto.resource_id,
      filename: dto.new_value,
    }))
    .exhaustive();
}

//
// Case Files
//

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
    outcome: DecisionOutcome;
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
    events: dto.events.filter((e) => caseEventTypes.includes(e.event_type)).map(adaptCaseEventDto),
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
  outcome?: CaseOutcome;
}

export function adaptUpdateCaseBodyDto(body: CaseUpdateBody): UpdateCaseBodyDto {
  return {
    name: body.name,
    inbox_id: body.inboxId,
    status: body.status,
    outcome: body.outcome,
  };
}

//
// Suspicious Activity Report
//

export type SuspiciousActivityReportStatus = 'pending' | 'completed';
export const suspiciousActivityReportStatuses: UnionToArray<SuspiciousActivityReportStatus> = [
  'pending',
  'completed',
];

export interface SuspiciousActivityReport {
  id: string;
  createdAt: string;
  status: SuspiciousActivityReportStatus;
  hasFile: boolean;
  createdBy: string;
}

export function adaptSuspiciousActivityReport(
  dto: SuspiciousActivityReportDto,
): SuspiciousActivityReport {
  return {
    id: dto.id,
    createdAt: dto.created_at,
    status: dto.status,
    hasFile: dto.has_file,
    createdBy: dto.created_by,
  };
}

export interface CreateSuspiciousActivityReportBody {
  status: SuspiciousActivityReportStatus;
}

export function adaptCreateSuspiciousActivityReportBody(
  body: CreateSuspiciousActivityReportBody,
): CreateSuspiciousActivityReportBodyDto {
  return {
    status: body.status,
  };
}

export interface UpdateSuspiciousActivityReportBody {
  status: SuspiciousActivityReportStatus;
}

export function adaptUpdateSuspiciousActivityReportBody(
  body: UpdateSuspiciousActivityReportBody,
): UpdateSuspiciousActivityReportBodyDto {
  return {
    status: body.status,
  };
}

export interface UploadSuspiciousActivityReportBody {
  file: File;
}

export function adaptUploadSuspiciousActivityReportBody(
  body: UploadSuspiciousActivityReportBody,
): UploadSuspiciousActivityReportBodyDto {
  return {
    file: body.file,
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
