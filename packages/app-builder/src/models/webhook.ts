import {
  type WebhookDto,
  type WebhookRegisterBodyDto,
  type WebhookSecretDto,
  type WebhookUpdateBodyDto,
  type WebhookWithSecretDto,
} from 'marble-api/generated/marblecore-api';
import invariant from 'tiny-invariant';

export const eventTypes = [
  'case.updated',
  'case.created_manually',
  'case.created_from_workflow',
  'case.decisions_updated',
  'case.tags_updated',
  'case.comment_created',
  'case.file_created',
  'case.rule_snooze_created',
  'case.decision_reviewed',
  'decision.created',
] as const;
export type EventType = (typeof eventTypes)[number];

function isEventType(value: string): value is EventType {
  return eventTypes.includes(value as EventType);
}

export interface Webhook {
  id: string;
  eventTypes: EventType[];
  url: string;
  httpTimeout?: number;
  rateLimit?: number;
  rateLimitDuration?: number;
}

export function adaptWebhook(dto: WebhookDto): Webhook {
  const eventTypes = dto.event_types ?? [];
  invariant(eventTypes.every(isEventType), `Invalid event types: ${eventTypes.join(', ')}`);
  return {
    id: dto.id,
    eventTypes,
    url: dto.url,
    httpTimeout: dto.http_timeout !== 0 ? dto.http_timeout : undefined,
    rateLimit: dto.rate_limit !== 0 ? dto.rate_limit : undefined,
    rateLimitDuration: dto.rate_limit_duration !== 0 ? dto.rate_limit_duration : undefined,
  };
}

export interface WebhookSecret {
  id: string;
  createdAt: string;
  deletedAt?: string;
  expiresAt?: string;
  updatedAt?: string;
  value: string;
}

export function adaptWebhookSecret(dto: WebhookSecretDto): WebhookSecret {
  invariant(dto.id, 'Webhook secret id is required');
  invariant(dto.created_at, 'Webhook secret created_at is required');
  invariant(dto.value, 'Webhook secret value is required');
  return {
    id: dto.id,
    createdAt: dto.created_at,
    deletedAt: dto.deleted_at,
    expiresAt: dto.expires_at,
    updatedAt: dto.updated_at,
    value: dto.value,
  };
}

export interface WebhookWithSecret extends Webhook {
  secrets: WebhookSecret[];
}

export function adaptWebhookWithSecret(dto: WebhookWithSecretDto): WebhookWithSecret {
  return {
    ...adaptWebhook(dto),
    secrets: dto.secrets?.map(adaptWebhookSecret) ?? [],
  };
}

export interface WebhookCreateBody {
  eventTypes: string[];
  url: string;
  httpTimeout?: number;
  rateLimit?: number;
  rateLimitDuration?: number;
}

export function adaptWebhookRegisterBodyDto(body: WebhookCreateBody): WebhookRegisterBodyDto {
  return {
    event_types: body.eventTypes,
    url: body.url,
    http_timeout: body.httpTimeout,
    rate_limit: body.rateLimit,
    rate_limit_duration: body.rateLimitDuration,
  };
}

export interface WebhookUpdateBody {
  eventTypes?: string[];
  url?: string;
  httpTimeout?: number;
  rateLimit?: number;
  rateLimitDuration?: number;
}

export function adaptWebhookUpdateBodyDto(body: WebhookUpdateBody): WebhookUpdateBodyDto {
  return {
    event_types: body.eventTypes,
    url: body.url,
    http_timeout: body.httpTimeout,
    rate_limit: body.rateLimit,
    rate_limit_duration: body.rateLimitDuration,
  };
}
