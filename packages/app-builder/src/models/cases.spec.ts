import { marblecoreApi } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { adaptCaseEventDto, caseEventTypes } from './cases';

const eventBase = {
  id: 'event-id',
  case_id: 'case-id',
  created_at: '2026-09-30T12:00:00Z',
  resource_type: 'case_manual_entity' as const,
  resource_id: '9ddc913b-9e51-4db2-a64b-9aee72747610',
  user_id: null,
};

const snapshot = JSON.stringify({ table_name: 'customers', object_id: 'customer-123' });

describe('manual entity case events', () => {
  it.each(['entity_added', 'entity_removed'] as const)(
    'adapts %s using its JSON reference and manual link UUID',
    async (event_type) => {
      const event = await adaptCaseEventDto(
        {
          ...eventBase,
          event_type,
          new_value: event_type === 'entity_added' ? snapshot : '',
          previous_value: event_type === 'entity_removed' ? snapshot : '',
        },
        marblecoreApi,
      );

      expect(caseEventTypes).toContain(event_type);
      expect(event).toEqual({
        id: eventBase.id,
        caseId: eventBase.case_id,
        createdAt: eventBase.created_at,
        eventType: event_type,
        userId: undefined,
        manualLinkId: eventBase.resource_id,
        entity: { tableName: 'customers', objectId: 'customer-123' },
      });
    },
  );

  it.each(['not JSON', '{"table_name":"customers","object_id":123}'])(
    'rejects an invalid serialized reference: %s',
    async (new_value) => {
      await expect(
        adaptCaseEventDto(
          {
            ...eventBase,
            event_type: 'entity_added',
            new_value,
            previous_value: '',
          },
          marblecoreApi,
        ),
      ).rejects.toThrow();
    },
  );
});
