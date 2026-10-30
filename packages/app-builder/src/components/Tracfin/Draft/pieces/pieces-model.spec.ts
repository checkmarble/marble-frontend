import { describe, expect, it } from 'vitest';
import { block, reference, text } from '../test-utils/persons-test-data';
import { FILE, PIECE, piece, piecesDiagnostic, piecesDraft } from '../test-utils/pieces-test-data';
import {
  addedFiles,
  attachmentDiagnosticsOf,
  fileSizeParts,
  groupUsagesByPerson,
  identityDetailsExpected,
  pieceCapacity,
  pieceDisplayName,
  pieceFileIssues,
  piecesReferencing,
  planAddPiece,
  shortHash,
} from './pieces-model';

describe('pieceCapacity', () => {
  it('counts n of 15 and is never negative', () => {
    expect(pieceCapacity(0)).toEqual({ count: 0, max: 15, remaining: 15, full: false, overMaximum: false });
    expect(pieceCapacity(14)).toMatchObject({ remaining: 1, full: false });
    expect(pieceCapacity(15)).toMatchObject({ remaining: 0, full: true, overMaximum: false });
    expect(pieceCapacity(17)).toMatchObject({ remaining: 0, full: true, overMaximum: true });
  });
});

describe('pieceDisplayName', () => {
  it('is the label, else the name, else nothing', () => {
    const labelled = piece('p1', FILE.one, {
      fields: { [`${PIECE}/libelle`]: [text('v1', 'Passeport')], [`${PIECE}/nom`]: [text('v2', 'passport.pdf')] },
    });
    expect(pieceDisplayName(labelled)).toBe('Passeport');
    expect(pieceDisplayName(piece('p2', FILE.one, { fields: { [`${PIECE}/nom`]: [text('v', ' scan.pdf ')] } }))).toBe(
      'scan.pdf',
    );
    expect(pieceDisplayName(piece('p3', FILE.one))).toBeNull();
    expect(pieceDisplayName(piece('p4', FILE.one, { fields: { [`${PIECE}/libelle`]: [text('v', '  ')] } }))).toBeNull();
  });
});

describe('fileSizeParts / shortHash', () => {
  it('uses binary units with at most one decimal', () => {
    expect(fileSizeParts(0)).toEqual({ value: 0, unit: 'B' });
    expect(fileSizeParts(1023)).toEqual({ value: 1023, unit: 'B' });
    expect(fileSizeParts(1536)).toEqual({ value: 1.5, unit: 'KiB' });
    expect(fileSizeParts(64 * 1024 * 1024)).toEqual({ value: 64, unit: 'MiB' });
  });

  it('keeps the first characters of the hash', () => {
    expect(shortHash('0123456789abcdef0123')).toBe('0123456789ab');
  });
});

describe('planAddPiece', () => {
  it('creates the container and the piece in ONE change list, the file id untouched', () => {
    const draft = piecesDraft();
    const plan = planAddPiece({ draft, fileId: FILE.one });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.ops).toHaveLength(1);
    expect(plan.ops[0]).toMatchObject({ type: 'add_block', catalogId: PIECE, sourceFileId: FILE.one });
    expect(plan.ops[0]!.type === 'add_block' && plan.ops[0]!.sourceFileId).toBe(FILE.one);
  });

  it('adds under the existing container', () => {
    const draft = piecesDraft({ pieces: [piece('p1', FILE.one)] });
    const plan = planAddPiece({ draft, fileId: FILE.two });
    expect(plan.ok && plan.ops[0]).toMatchObject({ parent: { kind: 'block', id: 'pieces-1' } });
  });

  it('refuses the 16th piece, a file already taken and a non canonical id, before any request', () => {
    const fifteen = Array.from({ length: 15 }, (_, index) =>
      piece(`p${index}`, `0a1b2c3d-0000-4000-8000-${String(index).padStart(12, '0')}`),
    );
    expect(planAddPiece({ draft: piecesDraft({ pieces: fifteen }), fileId: FILE.one })).toEqual({
      ok: false,
      reason: 'capacity',
    });
    expect(planAddPiece({ draft: piecesDraft({ pieces: [piece('p1', FILE.one)] }), fileId: FILE.one })).toEqual({
      ok: false,
      reason: 'already_added',
    });
    expect(planAddPiece({ draft: piecesDraft(), fileId: FILE.one.toUpperCase() })).toEqual({
      ok: false,
      reason: 'invalid_file_id',
    });
  });
});

describe('addedFiles', () => {
  it('maps a file id to its piece and position', () => {
    const root = piecesDraft({ pieces: [piece('p1', FILE.one), piece('p2', null), piece('p3', FILE.two)] }).document
      .root;
    const added = addedFiles(root);
    expect([...added.keys()]).toEqual([FILE.one, FILE.two]);
    expect(added.get(FILE.two)).toMatchObject({ position: 3 });
  });
});

describe('piecesReferencing', () => {
  it('finds the references to a piece with the declared person they sit under', () => {
    const draft = piecesDraft({
      pieces: [piece('p1', FILE.one), piece('p2', FILE.two)],
      mutate: (d) => {
        const civil = d.document.root.children!.find((c) => c.catalog_id === '/ds/personnes')!.children![0]!
          .children![0]!;
        civil.fields = {
          ...civil.fields,
          '/ds/personnes/pp/etatCivil/idPieceJointe': [reference('r1', 'p1'), reference('r2', 'p2')],
        };
        d.document.root.children!.push(
          block('/ds/operations', { fields: { '/ds/operations/x': [reference('r3', 'p1')] } }, 'ops-1'),
        );
      },
    });
    const usages = piecesReferencing(draft.document.root, 'p1');
    expect(usages.map((usage) => [usage.holderBlockId, usage.person?.block.id ?? null])).toEqual([
      ['civil-1', 'pp-1'],
      ['ops-1', null],
    ]);
    expect(piecesReferencing(draft.document.root, 'p2')).toHaveLength(1);
    expect(piecesReferencing(draft.document.root, 'nobody')).toEqual([]);
  });

  it('groups usages by person, outside-person usages last', () => {
    const draft = piecesDraft({
      pieces: [piece('p1', FILE.one)],
      mutate: (d) => {
        const civil = d.document.root.children!.find((c) => c.catalog_id === '/ds/personnes')!.children![0]!
          .children![0]!;
        civil.fields = {
          '/ds/personnes/pp/etatCivil/idPieceJointe': [reference('r1', 'p1')],
          '/ds/personnes/pp/etatCivil/other': [reference('r2', 'p1')],
        };
      },
    });
    const groups = groupUsagesByPerson(piecesReferencing(draft.document.root, 'p1'));
    expect(groups).toHaveLength(1);
    expect(groups[0]!.usages).toHaveLength(2);
  });
});

describe('pieceFileIssues', () => {
  const located = (code: string, id = 'p1') =>
    attachmentDiagnosticsOf(id, { fromDraft: [], fromLastExport: [piecesDiagnostic(code, id)] });

  it('has no issue for a listed file', () => {
    const p = piece('p1', FILE.one);
    expect(pieceFileIssues({ piece: p, files: [{ id: FILE.one }], diagnostics: [] })).toEqual([]);
  });

  it('flags a piece without any file', () => {
    expect(pieceFileIssues({ piece: piece('p1', null), files: [], diagnostics: [] })).toEqual([
      { kind: 'no_file', evidence: ['export'] },
    ]);
  });

  it('flags a file the case no longer lists, only when the listing is known', () => {
    const p = piece('p1', FILE.one);
    expect(pieceFileIssues({ piece: p, files: [{ id: FILE.two }], diagnostics: [] })).toEqual([
      { kind: 'missing', evidence: ['case_files'] },
    ]);
    expect(pieceFileIssues({ piece: p, files: null, diagnostics: [] })).toEqual([]);
  });

  it('reads ATTACHMENT_MISSING and ATTACHMENT_CHANGED from the diagnostics, once each', () => {
    const p = piece('p1', FILE.one);
    expect(pieceFileIssues({ piece: p, files: null, diagnostics: located('ATTACHMENT_CHANGED') })).toEqual([
      { kind: 'changed', evidence: ['export'] },
    ]);
    expect(
      pieceFileIssues({
        piece: p,
        files: [],
        diagnostics: [...located('ATTACHMENT_MISSING'), ...located('ATTACHMENT_MISSING')],
      }),
    ).toEqual([{ kind: 'missing', evidence: ['case_files', 'export'] }]);
  });

  it('ignores other codes and diagnostics located on another block', () => {
    expect(
      attachmentDiagnosticsOf('p1', {
        fromDraft: [piecesDiagnostic('SOMETHING_ELSE', 'p1'), piecesDiagnostic('ATTACHMENT_MISSING', 'p2')],
        fromLastExport: [],
      }),
    ).toEqual([]);
  });
});

describe('identityDetailsExpected', () => {
  const typed = (code: string, children = []) =>
    piece('p1', FILE.one, { fields: { [`${PIECE}/type`]: [text('v', code)] }, children });

  it('is expected for TA2, TA3 and TA5 until the details block exists', () => {
    for (const code of ['TA2', 'TA3', 'TA5']) expect(identityDetailsExpected(typed(code))).toBe(true);
    expect(identityDetailsExpected(typed('TA1'))).toBe(false);
    expect(identityDetailsExpected(piece('p1', FILE.one))).toBe(false);
    expect(identityDetailsExpected(typed('TA2', [block(`${PIECE}/infoPieceIdentite`) as never]))).toBe(false);
  });
});
