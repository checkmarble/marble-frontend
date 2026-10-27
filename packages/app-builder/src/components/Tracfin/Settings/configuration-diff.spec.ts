import { describe, expect, it } from 'vitest';
import { diffConfigurationStates, isDiffEmpty } from './configuration-diff';
import type { TracfinConfigurationFormState } from './form-state';

const mapping = (id: string, field = 'f') => ({
  id,
  target_field: '/a',
  source: { kind: 'ingested' as const, table: 'users', field },
});

describe('diffConfigurationStates', () => {
  const server: TracfinConfigurationFormState = {
    settings: {
      '/s1': { kind: 'text', text: 'server' },
      '/s2': { kind: 'text', text: 'same' },
      '/s3': { kind: 'text', text: 'x' },
    },
    mappings: [mapping('both-same'), mapping('both-changed', 'server'), mapping('server-only')],
  };
  const local: TracfinConfigurationFormState = {
    settings: {
      '/s1': { kind: 'text', text: 'local' },
      '/s2': { kind: 'text', text: 'same' },
      '/s4': { kind: 'text', text: 'y' },
    },
    mappings: [mapping('both-same'), mapping('both-changed', 'local'), mapping('local-only')],
  };

  it('reports differences at mapping id and setting field level', () => {
    expect(diffConfigurationStates(local, server)).toEqual({
      mappings: { localOnly: ['local-only'], serverOnly: ['server-only'], changed: ['both-changed'] },
      settings: { localOnly: ['/s4'], serverOnly: ['/s3'], changed: ['/s1'] },
    });
  });

  it('is empty for identical states', () => {
    expect(isDiffEmpty(diffConfigurationStates(server, server))).toBe(true);
    expect(isDiffEmpty(diffConfigurationStates(local, server))).toBe(false);
  });
});
