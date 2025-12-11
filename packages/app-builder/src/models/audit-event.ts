import { type AuditEventDto } from 'marble-api/generated/marblecore-api';

export interface AuditEventActor {
  type: 'user' | 'api_key';
  id: string;
  name: string;
}

export type AuditEventOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditEvent {
  id: string;
  actor: AuditEventActor | null;
  operation: AuditEventOperation | null;
  table: string | null;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string | null;
}

export function adaptAuditEvent(dto: AuditEventDto): AuditEvent {
  return {
    id: dto.id ?? '',
    actor: dto.actor
      ? {
          type: dto.actor.type ?? 'user',
          id: dto.actor.id ?? '',
          name: dto.actor.name ?? '',
        }
      : null,
    operation: dto.operation ?? null,
    table: dto.table ?? null,
    entityId: dto.entity_id ?? null,
    oldData: dto.old_data ?? null,
    newData: dto.new_data ?? null,
    createdAt: dto.created_at ?? null,
  };
}

export interface ListAuditEventsFilters {
  from: string;
  to: string;
  userId?: string;
  apiKeyId?: string;
  table?: string;
  entityId?: string;
  after?: string;
}
