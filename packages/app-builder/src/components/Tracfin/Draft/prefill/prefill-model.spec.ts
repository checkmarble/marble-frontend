import type { TracfinBlock, TracfinDiagnostic, TracfinPrefillProposal } from '@app-builder/models/tracfin';
import { describe, expect, it } from 'vitest';
import { cloneDraft } from '../test-utils/draft-test-data';
import { ACTIVITY_NAME, CIVIL, IDS, prefillDraft, prefillTestIndex } from '../test-utils/prefill-test-data';
import {
  buildApplyOps,
  classifyProposal,
  cleanChoices,
  groupPrefill,
  isPrefillStale,
  isProtectedField,
  normalizePrefill,
  prefillAvailability,
  scopeGroups,
  tagDiagnostics,
} from './prefill-model';

const candidate = (id: string, value: string, resolution = 'resolved') => ({
  id,
  kind: 'text' as const,
  text: value,
  origin: { source: 'ingested' as const, resolution: resolution as 'resolved' },
});

const proposal = (
  id: string,
  blockId: string,
  fieldId: string,
  candidates: TracfinPrefillProposal['candidates'],
  resolution: TracfinPrefillProposal['resolution'] = 'resolved',
): TracfinPrefillProposal => ({ id, field: { block_id: blockId, field_id: fieldId }, candidates, resolution });

const result = (proposals: TracfinPrefillProposal[], diagnostics: TracfinDiagnostic[] | null = []) =>
  normalizePrefill({ draft_revision: 3, mapping_version: 'v', proposals, diagnostics });

const diagnostic = (code: string, blockId?: string, fieldId = ''): TracfinDiagnostic => ({
  code,
  layer: 'sources',
  severity: 'warning',
  message: code,
  ...(blockId ? { field: { block_id: blockId, field_id: fieldId } } : {}),
});

describe('normalizePrefill', () => {
  it('turns null proposals and diagnostics into arrays', () => {
    const view = normalizePrefill({ draft_revision: 3, mapping_version: 'v', proposals: null, diagnostics: null });
    expect(view).toEqual({ draftRevision: 3, mappingVersion: 'v', proposals: [], diagnostics: [] });
  });
});

describe('classifyProposal', () => {
  it('is clean for one resolved or partial candidate', () => {
    expect(classifyProposal(proposal('p', 'b', 'f', [candidate('c', 'x')]))).toBe('clean');
    expect(classifyProposal(proposal('p', 'b', 'f', [candidate('c', 'x')], 'partial'))).toBe('clean');
  });

  it('is a conflict for several candidates or a conflict resolution', () => {
    expect(classifyProposal(proposal('p', 'b', 'f', [candidate('c', 'x'), candidate('d', 'y')], 'conflict'))).toBe(
      'conflict',
    );
    expect(classifyProposal(proposal('p', 'b', 'f', [candidate('c', 'x'), candidate('d', 'y')]))).toBe('conflict');
    expect(classifyProposal(proposal('p', 'b', 'f', [candidate('c', 'x')], 'conflict'))).toBe('conflict');
  });

  it('shows nothing for a proposal without candidate', () => {
    expect(classifyProposal(proposal('p', 'b', 'f', []))).toBeNull();
  });
});

describe('isPrefillStale', () => {
  it('flags a result once the draft revision moved past it', () => {
    const view = result([]);
    expect(isPrefillStale(view, 3)).toBe(false);
    expect(isPrefillStale(view, 4)).toBe(true);
    expect(isPrefillStale(null, 4)).toBe(false);
  });

  it('tags the shared diagnostics with the staleness of the result', () => {
    const view = result([], [diagnostic('UNKNOWN_CODE', IDS.civil, `${CIVIL}/sexe`)]);
    expect(tagDiagnostics(view, 3).map((entry) => entry.stale)).toEqual([false]);
    expect(tagDiagnostics(view, 5).map((entry) => entry.stale)).toEqual([true]);
    expect(tagDiagnostics(null, 5)).toEqual([]);
  });
});

describe('isProtectedField', () => {
  it('protects cleared, manual and origin-less values', () => {
    const civil = findCivil();
    expect(isProtectedField(civil, `${CIVIL}/prenom`)).toBe(true); // typed by hand
    expect(isProtectedField(civil, `${CIVIL}/nomDusage`)).toBe(true); // cleared
    expect(isProtectedField(civil, `${CIVIL}/nomNaissance`)).toBe(false); // empty
    expect(
      isProtectedField({ id: 'b', catalog_id: 'c', fields: { f: [{ id: 'v', kind: 'text', text: 'x' }] } }, 'f'),
    ).toBe(true); // no origin
    expect(
      isProtectedField(
        {
          id: 'b',
          catalog_id: 'c',
          fields: { f: [{ id: 'v', kind: 'text', text: 'x', origin: { source: 'ingested', resolution: 'resolved' } }] },
        },
        'f',
      ),
    ).toBe(false);
  });
});

function findCivil(): TracfinBlock {
  const draft = prefillDraft();
  const pp = draft.document.root.children!.find((child) => child.catalog_id === '/ds/personnes')!.children![0]!;
  return pp.children!.find((child) => child.id === IDS.civil)!;
}

describe('groupPrefill', () => {
  const draft = prefillDraft();
  const root = draft.document.root;

  const conflict = proposal(
    'p-conflict',
    IDS.activity,
    ACTIVITY_NAME,
    [candidate('c1', 'ACME SAS'), candidate('c2', 'ACME')],
    'conflict',
  );
  const clean = proposal('p-birth', IDS.civil, `${CIVIL}/nomNaissance`, [candidate('c3', 'Martin')]);
  const cleanDate = proposal('p-date', IDS.civil, `${CIVIL}/dateNaissance`, [candidate('c4', '12/03/1985')]);
  const period = proposal(
    'p-period',
    IDS.operations,
    '/ds/operations/dateDebut',
    [candidate('c5', '01/01/2026')],
    'partial',
  );

  it('groups by section then block, with the counts', () => {
    const groups = groupPrefill({
      result: result(
        [period, conflict, cleanDate, clean],
        [
          diagnostic('UNKNOWN_CODE', IDS.civil, `${CIVIL}/sexe`),
          diagnostic('PARTIAL_PERIOD', IDS.operations, '/ds/operations/dateDebut'),
        ],
      ),
      root,
      catalogIndex: prefillTestIndex,
    });
    expect(groups.sections.map((entry) => entry.section)).toEqual(['persons', 'operations']);
    const persons = groups.sections[0]!.blocks;
    expect(persons.map((group) => group.blockId)).toEqual([IDS.civil, IDS.activity]);
    expect(persons[0]!.clean.map((entry) => entry.proposal.id)).toEqual(['p-birth', 'p-date']); // catalog order
    expect(persons[0]!.diagnostics.map((entry) => entry.code)).toEqual(['UNKNOWN_CODE']);
    expect(persons[1]!.conflicts.map((entry) => entry.proposal.id)).toEqual(['p-conflict']);
    expect(groups.counts).toEqual({ clean: 3, conflicts: 1, diagnostics: 2 });
  });

  it('drops a proposal for a field the analyst corrected or cleared, and for a block that is gone', () => {
    const forged = [
      proposal('p-typed', IDS.civil, `${CIVIL}/prenom`, [candidate('x1', 'Jeanne-Marie')]),
      proposal('p-cleared', IDS.civil, `${CIVIL}/nomDusage`, [candidate('x2', 'Durand')]),
      proposal('p-gone', 'no-such-block', `${CIVIL}/nomNaissance`, [candidate('x3', 'Martin')]),
    ];
    const groups = groupPrefill({ result: result(forged), root, catalogIndex: prefillTestIndex });
    expect(groups.counts).toEqual({ clean: 0, conflicts: 0, diagnostics: 0 });
    expect(groups.sections).toEqual([]);
  });

  it('keeps diagnostics that locate no block as general ones', () => {
    const groups = groupPrefill({
      result: result([], [diagnostic('CATALOG_UNAVAILABLE'), diagnostic('SOURCE_UNAVAILABLE', 'no-such-block', 'f')]),
      root,
      catalogIndex: prefillTestIndex,
    });
    expect(groups.general.map((entry) => entry.code)).toEqual(['CATALOG_UNAVAILABLE', 'SOURCE_UNAVAILABLE']);
    expect(groups.counts.diagnostics).toBe(2);
  });

  it('scopes the groups to one section', () => {
    const groups = groupPrefill({ result: result([clean, period]), root, catalogIndex: prefillTestIndex });
    const operations = scopeGroups(groups, 'operations');
    expect(operations.sections.map((entry) => entry.section)).toEqual(['operations']);
    expect(operations.counts.clean).toBe(1);
    expect(scopeGroups(groups, null)).toBe(groups);
  });

  it('builds one apply_prefill per checked non-conflicting proposal, in one list', () => {
    const groups = groupPrefill({ result: result([clean, cleanDate, conflict]), root, catalogIndex: prefillTestIndex });
    const choices = cleanChoices(groups, new Set(['p-date']));
    expect(choices).toEqual([{ proposalId: 'p-birth', candidateId: 'c3' }]);
    expect(buildApplyOps(cleanChoices(groups, new Set()), 'mapping-v')).toEqual([
      { type: 'apply_prefill', proposalId: 'p-birth', candidateId: 'c3', mappingVersion: 'mapping-v' },
      { type: 'apply_prefill', proposalId: 'p-date', candidateId: 'c4', mappingVersion: 'mapping-v' },
    ]);
  });
});

describe('prefillAvailability', () => {
  it('needs a configuration with mappings', () => {
    expect(prefillAvailability(prefillDraft())).toBe('available');

    const noConfig = cloneDraft();
    noConfig.configuration.revision = 0;
    expect(prefillAvailability(noConfig)).toBe('no_configuration');

    const flagged = cloneDraft();
    flagged.diagnostics = [diagnostic('CONFIGURATION_UNAVAILABLE')];
    expect(prefillAvailability(flagged)).toBe('no_configuration');

    const noMappings = cloneDraft();
    noMappings.configuration.mappings = [];
    expect(prefillAvailability(noMappings)).toBe('no_mappings');
  });
});
