import type { TracfinExport } from '@app-builder/models/tracfin';
import { tracfinExportFixture } from '@app-builder/models/tracfin/__fixtures__';
import { describe, expect, it } from 'vitest';
import { judgeUncertainExport, lastExportRelation } from './export-outcome';

const exportOf = (id: string, draft_revision: number): TracfinExport => ({
  ...tracfinExportFixture,
  id,
  draft_revision,
});

describe('judgeUncertainExport (a lost answer is settled by last_export, never by a blind retry)', () => {
  it('treats a new export of the requested revision as done', () => {
    const after = { revision: 4, last_export: exportOf('new', 4) };
    expect(judgeUncertainExport({ requestedRevision: 4, before: exportOf('old', 3), after })).toEqual({
      kind: 'exported',
      export: after.last_export,
    });
    expect(judgeUncertainExport({ requestedRevision: 4, before: null, after }).kind).toBe('exported');
  });

  it('does not mistake the export that was already there for the attempt', () => {
    const previous = exportOf('same', 4);
    expect(
      judgeUncertainExport({ requestedRevision: 4, before: previous, after: { revision: 4, last_export: previous } }),
    ).toEqual({ kind: 'unchanged', export: previous });
  });

  it('says the draft moved when it is no longer at the requested revision and holds no export of it', () => {
    expect(
      judgeUncertainExport({
        requestedRevision: 4,
        before: exportOf('old', 3),
        after: { revision: 5, last_export: exportOf('old', 3) },
      }),
    ).toEqual({ kind: 'moved', revision: 5 });
  });

  it('still recognises the export when the draft moved on after it', () => {
    expect(
      judgeUncertainExport({
        requestedRevision: 4,
        before: null,
        after: { revision: 5, last_export: exportOf('new', 4) },
      }).kind,
    ).toBe('exported');
  });

  it('reports no export at the same revision, or only an older one, as not exported', () => {
    expect(judgeUncertainExport({ requestedRevision: 4, before: null, after: { revision: 4 } })).toEqual({
      kind: 'not_exported',
    });
    expect(
      judgeUncertainExport({
        requestedRevision: 4,
        before: exportOf('old', 3),
        after: { revision: 4, last_export: exportOf('old', 3) },
      }),
    ).toEqual({ kind: 'not_exported' });
  });
});

describe('lastExportRelation', () => {
  it('is current at the same revision', () => {
    expect(lastExportRelation({ draft_revision: 3 }, 3)).toEqual({ kind: 'current', revision: 3 });
  });
  it('is older when the draft moved on, with both revisions', () => {
    expect(lastExportRelation({ draft_revision: 3 }, 5)).toEqual({
      kind: 'older',
      exportRevision: 3,
      draftRevision: 5,
    });
  });
  it('never offers a re-export for an export beyond the draft held here', () => {
    expect(lastExportRelation({ draft_revision: 6 }, 5)).toEqual({
      kind: 'ahead',
      exportRevision: 6,
      draftRevision: 5,
    });
  });
});
