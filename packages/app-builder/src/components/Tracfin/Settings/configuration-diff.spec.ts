import { describe, expect, it } from 'vitest';
import { diffConfigurationStates, isDiffEmpty } from './configuration-diff';
import type { TracfinConfigurationFormState } from './form-state';

const mapping = (id: string, field = 'f') => ({
  id,
  target_field: '/a',
  source: { kind: 'ingested' as const, table: 'users', field },
});

describe('diffConfigurationStates', () => {
  // Three-way: what the edits started from, what they became, and what the server holds now.
  const baseline: TracfinConfigurationFormState = {
    settings: {
      '/s1': { kind: 'text', text: 'base' },
      '/s2': { kind: 'text', text: 'same' },
      '/s3': { kind: 'text', text: 'x' },
      '/s5': { kind: 'text', text: 'z' },
    },
    mappings: [mapping('both-same'), mapping('both-changed', 'base'), mapping('gone-on-server'), mapping('gone-here')],
  };
  const server: TracfinConfigurationFormState = {
    settings: {
      '/s1': { kind: 'text', text: 'server' },
      '/s2': { kind: 'text', text: 'same' },
      '/s3': { kind: 'text', text: 'x' },
      '/s6': { kind: 'text', text: 'added elsewhere' },
    },
    mappings: [mapping('both-same'), mapping('both-changed', 'server'), mapping('gone-here'), mapping('server-only')],
  };
  const local: TracfinConfigurationFormState = {
    settings: {
      '/s1': { kind: 'text', text: 'local' },
      '/s2': { kind: 'text', text: 'same' },
      '/s4': { kind: 'text', text: 'y' },
      '/s5': { kind: 'text', text: 'z' },
    },
    mappings: [
      mapping('both-same'),
      mapping('both-changed', 'local'),
      mapping('gone-on-server'),
      mapping('local-only'),
    ],
  };

  it('tells a mapping deleted by someone else from one added locally', () => {
    const diff = diffConfigurationStates(local, server, baseline);
    expect(diff.mappings).toEqual({
      localOnly: ['local-only'],
      deletedOnServer: ['gone-on-server'],
      serverOnly: ['server-only'],
      deletedLocally: ['gone-here'],
      changed: ['both-changed'],
    });
  });

  it('does the same at setting level', () => {
    const diff = diffConfigurationStates(local, server, baseline);
    expect(diff.settings).toEqual({
      localOnly: ['/s4'],
      deletedOnServer: ['/s5'],
      serverOnly: ['/s6'],
      deletedLocally: ['/s3'],
      changed: ['/s1'],
    });
  });

  it('is empty for identical states', () => {
    expect(isDiffEmpty(diffConfigurationStates(server, server, baseline))).toBe(true);
    expect(isDiffEmpty(diffConfigurationStates(local, server, baseline))).toBe(false);
  });
});
