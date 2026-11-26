import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type CaseEventDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { adaptCaseEvents } from './cases';

const unusedClient = {} as MarbleCoreApi;

const baseEvent = {
  case_id: 'case-1',
  created_at: '2026-11-20T10:00:00Z',
  previous_value: '',
};

describe('adaptCaseEvents', () => {
  it('skips an event type the frontend does not know', async () => {
    const dtos = [
      { ...baseEvent, id: 'event-1', event_type: 'case_created', user_id: 'user-1' },
      { ...baseEvent, id: 'event-2', event_type: 'a_future_event_type', new_value: 'whatever' },
    ] as CaseEventDto[];

    const events = await adaptCaseEvents(dtos, unusedClient);

    expect(events.map((event) => event.id)).toEqual(['event-1']);
  });

  it('adapts a tentative review event', async () => {
    const dtos: CaseEventDto[] = [
      {
        ...baseEvent,
        id: 'event-1',
        event_type: 'screening_match_commented',
        user_id: 'user-1',
        new_value: 'no_hit',
        additional_note: 'Different date of birth',
        resource_type: 'continuous_screening_match',
        resource_id: 'match-1',
      },
    ];

    const [event] = await adaptCaseEvents(dtos, unusedClient);

    expect(event).toMatchObject({
      eventType: 'screening_match_commented',
      userId: 'user-1',
      status: 'no_hit',
      comment: 'Different date of birth',
      matchId: 'match-1',
    });
  });
});
