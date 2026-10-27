import type { TracfinApiError, TracfinDiagnostic, TracfinDraft, TracfinExport } from '@app-builder/models/tracfin';
import { tracfinExportFixture, tracfinValidationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { TracfinDownloadError } from '@app-builder/services/tracfin/download-export';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cloneDraft, draftTestCatalog, findByCatalogId } from '../test-utils/draft-test-data';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { CASE_ID, connectBackend, ok, renderDraftPage } from '../test-utils/render-page';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  prefill: vi.fn(),
  validate: vi.fn(),
  exportDraft: vi.fn(),
  download: vi.fn(),
  // Every server function of the case page that touches the case itself (status, SAR, comments, ...).
  cases: {
    listCaseDecisionsFn: vi.fn(),
    closeCaseFn: vi.fn(),
    openCaseFn: vi.fn(),
    escalateCaseFn: vi.fn(),
    snoozeCaseFn: vi.fn(),
    editSuspicionFn: vi.fn(),
    listSuspicionActivityReportsFn: vi.fn(),
    massUpdateCasesFn: vi.fn(),
    addCommentFn: vi.fn(),
  },
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
  prefillTracfinDraftFn: mocks.prefill,
  validateTracfinDraftFn: mocks.validate,
  exportTracfinDraftFn: mocks.exportDraft,
}));
vi.mock('@app-builder/server-fns/data', () => ({}));
vi.mock('@app-builder/server-fns/cases', () => mocks.cases);
vi.mock('@app-builder/services/tracfin/download-export', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@app-builder/services/tracfin/download-export')>()),
  downloadTracfinExport: mocks.download,
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
    useBlocker: () => ({ status: 'idle', proceed: undefined, reset: undefined }),
  };
});

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
vi.setConfig({ testTimeout: 30_000 });

const failure = (error: TracfinApiError) => ({ ok: false as const, error });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCatalog.mockResolvedValue(ok(draftTestCatalog));
});
afterEach(cleanup);

const ORGANISME = '115b9983-7211-5d7d-b415-a203798fc8c8';
const LIBELLE_VALUE = '6477f044-5f8b-5d51-86c2-00bfd953f4df';
const GENERAL = '7614c618-84a3-515e-a8f3-b817576b523c';
const REF_VALUE = '2588cfae-7600-5148-afea-674203c58d19';

const diagnostic = (
  code: string,
  blockId: string,
  fieldId: string,
  extra: Partial<TracfinDiagnostic> = {},
): TracfinDiagnostic => ({
  code,
  layer: 'business',
  severity: 'error',
  message: `server wording of ${code}`,
  field: { block_id: blockId, field_id: fieldId },
  ...extra,
});

/** Someone else saves the draft: its revision moves on. */
const touchedElsewhere = (draft: TracfinDraft) => {
  draft.updated_by = 'someone-else';
};

const exportOf = (patch: Partial<TracfinExport> = {}): TracfinExport => ({ ...tracfinExportFixture, ...patch });

async function openReview(draft: TracfinDraft = cloneDraft()) {
  const backend = new FakeDraftBackend(draft);
  connectBackend(mocks, backend);
  const rendered = await renderDraftPage({ initialSection: 'review' });
  await screen.findByRole('button', { name: 'Check the saved revision' });
  return { ...rendered, backend };
}

const nav = (name: RegExp | string) => screen.getByRole('button', { name });
const checkButton = () => screen.getByRole('button', { name: 'Check the saved revision' });
const exportButton = () => screen.getByRole('button', { name: 'Export the saved revision' });
const lastExport = () => screen.getByRole('region', { name: 'Last export' });
const validationCard = () => screen.getByRole('region', { name: 'Internal checks' });
const alertWith = async (fragment: string | RegExp) =>
  waitFor(() => {
    const found = screen.getAllByRole('alert').find((alert) => {
      const text = alert.textContent ?? '';
      return typeof fragment === 'string' ? text.includes(fragment) : fragment.test(text);
    });
    if (!found) throw new Error(`no alert with: ${String(fragment)}`);
    return found;
  });

describe('(a) a diagnostic leads to its field', () => {
  it('opens the section and focuses and highlights the field of the occurrence', async () => {
    mocks.validate.mockResolvedValue(
      ok({
        ...tracfinValidationFixture,
        diagnostics: [
          {
            ...diagnostic('INVALID_DATE', ORGANISME, '/ds/organisme/libelle'),
            field: { block_id: ORGANISME, field_id: '/ds/organisme/libelle', value_id: LIBELLE_VALUE },
          },
          diagnostic('MISSING_REQUIRED_VALUE', GENERAL, '/ds/context/general/refInterne'),
        ],
      }),
    );
    const { user, section } = await openReview();

    await user.click(checkButton());
    expect(mocks.validate).toHaveBeenCalledWith({ data: { caseId: CASE_ID, body: { expected_revision: 3 } } });

    // Grouped by section, then block, with the French text of the code.
    const card = validationCard();
    expect(await within(card).findByRole('heading', { name: 'Declaration', level: 4 })).toBeTruthy();
    expect(within(card).getByRole('heading', { name: 'Context and analysis', level: 4 })).toBeTruthy();
    expect(within(card).getByText(/Invalid date: the expected format is DD\/MM\/YYYY/)).toBeTruthy();
    expect(within(card).getByTestId('diagnostic-counts').textContent).toBe('Errors: 2 · Warnings: 0');

    await user.click(within(card).getByRole('button', { name: /^Go to field “Organisation name”/ }));
    expect(section()).toBe('declaration');
    const input = await screen.findByLabelText('Organisation name');
    await waitFor(() => expect(document.activeElement).toBe(input));
    // The occurrence the diagnostic names carries the highlight.
    expect(input.closest('li')?.getAttribute('data-tracfin-highlight')).toBe('true');
    // The same diagnostic is shown under the field by the shared block mechanism, in French.
    const field = input.closest('[data-tracfin-field]') as HTMLElement;
    expect(within(field).getByText(/Invalid date: the expected format is DD\/MM\/YYYY/)).toBeTruthy();

    // And from another section back to the review, then to a different one.
    await user.click(nav(/^Review and export/));
    await user.click(within(validationCard()).getByRole('button', { name: /^Go to field “Internal reference”/ }));
    expect(section()).toBe('context');
    const reference = await screen.findByLabelText('Internal reference');
    await waitFor(() => expect(document.activeElement).toBe(reference));
    expect(reference.closest('li')?.getAttribute('data-tracfin-value')).toBe(REF_VALUE);
  });

  it('shows the diagnostics without block in a general group that is not clickable', async () => {
    mocks.validate.mockResolvedValue(
      ok({
        ...tracfinValidationFixture,
        diagnostics: [
          { ...diagnostic('INCOMPATIBLE_PROFILE', '', ''), layer: 'internal_structure' },
          diagnostic('SOMETHING_NEW', ORGANISME, '/ds/organisme/libelle'),
        ],
      }),
    );
    const { user } = await openReview();
    await user.click(checkButton());
    const card = validationCard();
    const general = await within(card).findByRole('region', { name: 'General' });
    expect(within(general).getByText(/created for another version of the TRACFIN profile/)).toBeTruthy();
    expect(within(general).queryByRole('button')).toBeNull();
    // An unknown code falls back to the server's own message.
    expect(within(card).getByText('server wording of SOMETHING_NEW')).toBeTruthy();
  });

  it('lists a value the backend reports twice (XML check, profile check) once, and counts it once', async () => {
    mocks.validate.mockResolvedValue(
      ok({
        ...tracfinValidationFixture,
        diagnostics: [
          {
            ...diagnostic('MISSING_REQUIRED_VALUE', '', '/ds/organisme/libelle'),
            message: 'Required XML element or attribute is absent',
          },
          {
            ...diagnostic('MISSING_REQUIRED_VALUE', ORGANISME, '/ds/organisme/libelle'),
            message: 'Required profile value is absent',
          },
          {
            ...diagnostic('MISSING_REQUIRED_VALUE', '', '/ds/context/general/refInterne'),
            message: 'Required XML element or attribute is absent',
          },
        ],
      }),
    );
    const { user } = await openReview();
    await user.click(checkButton());
    const card = validationCard();
    await within(card).findByTestId('diagnostic-counts');
    // Two problems: the located value (once) and the one that only the XML check named.
    expect(within(card).getByTestId('diagnostic-counts').textContent).toBe('Errors: 2 · Warnings: 0');
    expect(within(card).getAllByRole('button', { name: /^Go to field “Organisation name”/ })).toHaveLength(1);
    expect(within(card).getAllByRole('button', { name: /^Go to field “Internal reference”/ })).toHaveLength(1);
  });

  it('flags the result « to redo » once the draft moved past the revision it ran on', async () => {
    mocks.validate.mockResolvedValue(
      ok({
        ...tracfinValidationFixture,
        diagnostics: [diagnostic('INVALID_DATE', ORGANISME, '/ds/organisme/libelle')],
      }),
    );
    const { user, backend } = await openReview();
    await user.click(checkButton());
    await within(validationCard()).findByText('Result for revision 3');
    expect(within(validationCard()).queryByText(/To redo/)).toBeNull();

    // The analyst saves a change: the draft is at revision 4, the result still dates from 3.
    await user.click(nav(/^Declaration/));
    await user.type(screen.getByLabelText('Organisation name'), 'X');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    await user.click(nav(/^Review and export/));
    expect(await within(validationCard()).findByText(/To redo — draft is at revision/)).toBeTruthy();
  });
});

describe('(b) a forbidden character', () => {
  it('is shown by the validation, and the export 422 is linked to the field', async () => {
    const draft = cloneDraft();
    findByCatalogId(draft.document.root, '/ds/organisme')!.fields!['/ds/organisme/libelle']![0]!.text = 'Banque\u0001';
    mocks.validate.mockResolvedValue(
      ok({
        ...tracfinValidationFixture,
        layers: { ...tracfinValidationFixture.layers, internal_structure: { status: 'failed' } },
        diagnostics: [
          {
            ...diagnostic('XML_FORBIDDEN_CHARACTER', ORGANISME, '/ds/organisme/libelle', {
              layer: 'internal_structure',
              message: 'Forbidden XML character U+0001; export is refused until the value is corrected',
            }),
            field: { block_id: ORGANISME, field_id: '/ds/organisme/libelle', value_id: LIBELLE_VALUE },
          },
        ],
      }),
    );
    mocks.exportDraft.mockResolvedValue(
      failure({
        kind: 'unprocessable',
        status: 422,
        message: `XML export /ds/organisme/libelle block ${ORGANISME} value ${LIBELLE_VALUE}: Forbidden XML character U+0001: unprocessable entity`,
      }),
    );
    const { user, section } = await openReview(draft);

    await user.click(checkButton());
    expect(
      await within(validationCard()).findByText(/contains a character that XML 1.0 cannot represent/),
    ).toBeTruthy();

    await user.click(exportButton());
    const refusal = await alertWith('Export refused');
    expect(refusal.textContent).toContain(
      'the value of the field “Organisation name” contains the forbidden character U+0001',
    );
    expect(refusal.textContent).toContain('No file was created');
    // Nothing is shown as exported.
    expect(within(lastExport()).getByText('This draft has not been exported yet.')).toBeTruthy();

    await user.click(within(refusal).getByRole('button', { name: 'Go to field “Organisation name”' }));
    expect(section()).toBe('declaration');
    const input = await screen.findByLabelText('Organisation name');
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(input.closest('li')?.getAttribute('data-tracfin-value')).toBe(LIBELLE_VALUE);
  });
});

describe('(c) a partial export', () => {
  it('succeeds with its diagnostics, keeps official_xsd unavailable, and says neither « validated » nor « accepted »', async () => {
    const draft = cloneDraft();
    draft.document.root.children = [
      ...(draft.document.root.children ?? []),
      {
        id: 'pieces-container',
        catalog_id: '/ds/pieceJointe',
        children: [
          {
            id: 'piece-1',
            catalog_id: '/ds/pieceJointe/piece',
            attachment: { source_file_id: 'f', sha256: 'a'.repeat(64), size: 3 },
          },
        ],
      },
    ];
    const exported = exportOf({
      id: 'e-partial',
      draft_revision: 3,
      validation: {
        ...tracfinExportFixture.validation,
        diagnostics: [
          diagnostic('ATTACHMENT_MISSING', 'piece-1', '/ds/pieceJointe/piece', { layer: 'references' }),
          diagnostic('MISSING_REQUIRED_VALUE', ORGANISME, '/ds/organisme/profession', { layer: 'internal_structure' }),
          diagnostic('INACTIVE_BRANCH_DATA_NOT_EXPORTED', ORGANISME, '/ds/organisme/numIdPro', { severity: 'warning' }),
        ],
      },
    });
    mocks.exportDraft.mockResolvedValue(ok(exported));
    const { user, section } = await openReview(draft);

    await user.click(exportButton());
    expect(mocks.exportDraft).toHaveBeenCalledWith({ data: { caseId: CASE_ID, body: { expected_revision: 3 } } });
    expect(await screen.findByText(/Export finished for revision 3/)).toBeTruthy();

    const card = lastExport();
    // Three states, kept apart.
    expect(within(card).getByText(/^XML exported on/)).toBeTruthy();
    expect(within(card).getByText(/Internal checks: incomplete/)).toBeTruthy();
    expect(within(card).getByText('Not transmitted — acceptance by ERMES has not been verified')).toBeTruthy();
    expect(within(card).queryByText(/validated|accepted by ERMES/i)).toBeNull();
    // Date, size, full hash.
    expect(within(card).getByText(tracfinExportFixture.sha256)).toBeTruthy();
    expect(within(card).getByText(/17\.9 KiB/)).toBeTruthy();
    // The official XSD layer is always there and unavailable.
    const row = card.querySelector('[data-layer="official_xsd"]') as HTMLElement;
    expect(within(row).getByText('unavailable — no official XSD validator integrated')).toBeTruthy();
    // The diagnostics of the export are listed and the pieces left out are called out.
    expect(within(card).getByText(/A value TRACFIN expects is missing/)).toBeTruthy();
    expect(within(card).getByText(/This data belongs to the other branch of a choice/)).toBeTruthy();
    expect(within(card).getByText('Piece(s) left out of the export: 1')).toBeTruthy();

    // The attachment diagnostic goes to the Attachments section.
    await user.click(within(card).getByRole('button', { name: 'Open the piece' }));
    expect(section()).toBe('pieces');

    // Back in the review, the export is the last export of the draft (cache), not only a toast.
    await user.click(nav(/^Review and export/));
    expect(within(lastExport()).getByText(/^XML exported on/)).toBeTruthy();
  });
});

describe('(d) a truncated download', () => {
  it('fails visibly, saves nothing, and the retry downloads the same export', async () => {
    const draft = cloneDraft();
    draft.last_export = exportOf();
    mocks.download
      .mockRejectedValueOnce(new TracfinDownloadError({ kind: 'truncated', received: 100, expected: 18342 }))
      .mockResolvedValueOnce({ received: 18342, sha256Verified: true });
    const { user } = await openReview(draft);

    await user.click(within(lastExport()).getByRole('button', { name: 'Download the XML' }));
    const failed = await alertWith('Incomplete download — try again');
    expect(failed.textContent).toContain('100 bytes received out of 18,342');
    expect(failed.textContent).toContain('No file was saved');
    expect(screen.queryByText('Download finished.')).toBeNull();

    await user.click(within(failed).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Download finished.')).toBeTruthy();
    expect(screen.getByText('Size verified')).toBeTruthy();
    expect(screen.getByText('Fingerprint verified')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();

    // Same export both times, and no new export was made.
    expect(mocks.download).toHaveBeenCalledTimes(2);
    expect(mocks.download.mock.calls[0]).toEqual([draft.last_export, CASE_ID]);
    expect(mocks.download.mock.calls[1]).toEqual(mocks.download.mock.calls[0]);
    expect(mocks.exportDraft).not.toHaveBeenCalled();
  });

  it('says when the fingerprint could not be verified, and never calls that a complete check', async () => {
    const draft = cloneDraft();
    draft.last_export = exportOf();
    mocks.download.mockResolvedValue({ received: 18342, sha256Verified: false });
    const { user } = await openReview(draft);
    await user.click(within(lastExport()).getByRole('button', { name: 'Download the XML' }));
    expect(await screen.findByText('Size verified')).toBeTruthy();
    expect(screen.getByText(/Fingerprint not verified/)).toBeTruthy();
    expect(screen.queryByText('Fingerprint verified')).toBeNull();
  });

  it.each([
    [{ kind: 'hash_mismatch' as const }, /does not match the export's: the file is rejected/],
    [{ kind: 'http' as const, status: 404, message: 'not found' }, /refused the download \(status 404\)/],
    [
      { kind: 'unexpected_content' as const, contentType: 'text/plain' },
      /did not return an XML file \(content type received: text\/plain\)/,
    ],
  ])('reports %o as a failure with nothing saved', async (failureKind, expected) => {
    const draft = cloneDraft();
    draft.last_export = exportOf();
    mocks.download.mockRejectedValue(new TracfinDownloadError(failureKind));
    const { user } = await openReview(draft);
    await user.click(within(lastExport()).getByRole('button', { name: 'Download the XML' }));
    const alert = await alertWith(expected);
    expect(alert.textContent).toContain('No file was saved');
    expect(screen.queryByText('Download finished.')).toBeNull();
  });

  it('sends an expired session to sign in again, in a new tab', async () => {
    const draft = cloneDraft();
    draft.last_export = exportOf();
    mocks.download.mockRejectedValue(new TracfinDownloadError({ kind: 'auth' }));
    const { user } = await openReview(draft);
    await user.click(within(lastExport()).getByRole('button', { name: 'Download the XML' }));
    const alert = await alertWith('session has expired');
    const link = within(alert).getByRole('link', { name: 'Sign in again (new tab)' });
    expect(link.getAttribute('href')).toBe('/sign-in');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});

describe('the report of the last export', () => {
  it('does not list the unlocated copy of a located diagnostic, nor count it', async () => {
    const draft = cloneDraft();
    draft.last_export = exportOf({
      validation: {
        ...tracfinValidationFixture,
        diagnostics: [
          { ...diagnostic('MISSING_REQUIRED_VALUE', '', '/ds/organisme/libelle'), layer: 'internal_structure' },
          { ...diagnostic('MISSING_REQUIRED_VALUE', ORGANISME, '/ds/organisme/libelle'), layer: 'internal_structure' },
        ],
      },
    });
    await openReview(draft);
    const card = lastExport();
    expect(within(card).getByTestId('diagnostic-counts').textContent).toBe('Errors: 1 · Warnings: 0');
    expect(within(card).getAllByRole('button', { name: /^Go to field “Organisation name”/ })).toHaveLength(1);
    // The statement of the internal checks counts the same single error.
    expect(within(card).getByText(/\(1 error\(s\)\)/)).toBeTruthy();
  });
});

describe('(e) a last export older than the draft', () => {
  it('shows both revisions and exports the new changes on request', async () => {
    const draft = cloneDraft();
    draft.revision = 5;
    draft.last_export = exportOf({ draft_revision: 3 });
    mocks.exportDraft.mockResolvedValue(ok(exportOf({ id: 'e-5', draft_revision: 5 })));
    const { user } = await openReview(draft);

    const card = lastExport();
    expect(within(card).getByTestId('export-relation').textContent).toContain(
      'This export is of revision 3; the draft is at revision 5.',
    );
    await user.click(within(card).getByRole('button', { name: 'Export the new changes' }));
    expect(mocks.exportDraft).toHaveBeenCalledWith({ data: { caseId: CASE_ID, body: { expected_revision: 5 } } });

    await waitFor(() =>
      expect(within(lastExport()).getByTestId('export-relation').textContent).toContain(
        'This export is of revision 5, the current revision of the draft.',
      ),
    );
    expect(within(lastExport()).queryByRole('button', { name: 'Export the new changes' })).toBeNull();
  });

  it('offers no re-export when the export is of the current revision', async () => {
    const draft = cloneDraft();
    draft.last_export = exportOf({ draft_revision: 3 });
    await openReview(draft);
    expect(within(lastExport()).getByTestId('export-relation').textContent).toContain(
      'the current revision of the draft',
    );
    expect(within(lastExport()).queryByRole('button', { name: 'Export the new changes' })).toBeNull();
  });
});

describe('(f) an export whose answer is lost', () => {
  const timeout: TracfinApiError = { kind: 'timeout', status: 408, message: 'request timed out' };

  it('re-reads the draft and treats an export of the requested revision as done, without retrying', async () => {
    const { user, backend } = await openReview();
    mocks.exportDraft.mockImplementation(async () => {
      // The server did write the export; only the answer was lost.
      backend.draft.last_export = exportOf({ id: 'written-anyway', draft_revision: 3 });
      return failure(timeout);
    });
    const readsBefore = mocks.getDraft.mock.calls.length;

    await user.click(exportButton());

    expect(await screen.findByText(/does hold an export of revision 3: it is treated as done/)).toBeTruthy();
    expect(mocks.getDraft.mock.calls.length).toBeGreaterThan(readsBefore);
    expect(mocks.exportDraft).toHaveBeenCalledTimes(1);
    expect(within(lastExport()).getByText(/^XML exported on/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try the export again' })).toBeNull();
  });

  it('offers a retry, never taken for the analyst, when the draft shows no such export', async () => {
    const { user } = await openReview();
    mocks.exportDraft.mockResolvedValueOnce(failure({ kind: 'server', status: 503, message: 'unavailable' }));
    await user.click(exportButton());

    const notice = await alertWith('The export could not be confirmed (server error)');
    expect(notice.textContent).toContain('Nothing was resent automatically');
    expect(mocks.exportDraft).toHaveBeenCalledTimes(1);
    expect(within(lastExport()).getByText('This draft has not been exported yet.')).toBeTruthy();

    mocks.exportDraft.mockResolvedValueOnce(ok(exportOf({ id: 'second', draft_revision: 3 })));
    await user.click(within(notice).getByRole('button', { name: 'Try the export again' }));
    expect(await screen.findByText(/Export finished for revision 3/)).toBeTruthy();
    expect(mocks.exportDraft).toHaveBeenCalledTimes(2);
  });

  it('does not take the export that was already there for the lost attempt', async () => {
    const draft = cloneDraft();
    draft.last_export = exportOf({ id: 'earlier', draft_revision: 3 });
    const { user } = await openReview(draft);
    mocks.exportDraft.mockResolvedValue(failure({ kind: 'network', status: null, message: 'offline' }));
    await user.click(exportButton());
    const notice = await alertWith('could not be confirmed (network error)');
    expect(notice.textContent).toContain('The last known export (revision 3) is unchanged');
  });

  it('says the draft moved when the revision is no longer the requested one', async () => {
    const { user, backend } = await openReview();
    mocks.exportDraft.mockImplementation(async () => {
      backend.editElsewhere(touchedElsewhere);
      return failure(timeout);
    });
    await user.click(exportButton());
    const notice = await alertWith('the draft is now at revision 4');
    expect(notice.textContent).toContain('Nothing was resent');
  });

  it('says nothing is known when the draft cannot be read again', async () => {
    const { user } = await openReview();
    mocks.exportDraft.mockResolvedValue(failure(timeout));
    mocks.getDraft.mockResolvedValue(failure({ kind: 'forbidden', status: 403, message: 'no access' }));
    await user.click(exportButton());
    const notice = await alertWith('could not be read again');
    expect(notice.textContent).toContain('It is not known whether the export happened');
    expect(within(notice).getByRole('button', { name: 'Read the draft again' })).toBeTruthy();
    expect(mocks.exportDraft).toHaveBeenCalledTimes(1);
  });
});

describe('after a lost answer that could not be judged', () => {
  const timeout: TracfinApiError = { kind: 'timeout', status: 408, message: 'request timed out' };

  it('judges again when the draft is read again, and keeps the doubt until it can', async () => {
    const { user, backend } = await openReview();
    mocks.exportDraft.mockResolvedValue(failure(timeout));
    mocks.getDraft.mockResolvedValue(failure({ kind: 'forbidden', status: 403, message: 'no access' }));
    await user.click(exportButton());
    const notice = await alertWith('could not be read again');

    // Still unreadable: the notice stays, nothing is retried, nothing is claimed.
    await user.click(within(notice).getByRole('button', { name: 'Read the draft again' }));
    const still = await alertWith('could not be read again');
    expect(still.textContent).toContain('It is not known whether the export happened');
    expect(mocks.exportDraft).toHaveBeenCalledTimes(1);

    // Readable again, and the draft shows the export of the revision that was asked for.
    const exported = exportOf({ id: 'export-late', draft_revision: backend.draft.revision });
    mocks.getDraft.mockImplementation(async () => ok({ ...structuredClone(backend.draft), last_export: exported }));
    await user.click(within(still).getByRole('button', { name: 'Read the draft again' }));
    expect(await screen.findByText(/the draft does hold an export of revision/)).toBeTruthy();
    expect(screen.queryByText('It is not known whether the export happened')).toBeNull();
    expect(mocks.exportDraft).toHaveBeenCalledTimes(1);
  });
});

describe('other export outcomes', () => {
  it('on a 409 says the revision changed and nothing was exported', async () => {
    const { user } = await openReview();
    mocks.exportDraft.mockResolvedValue(failure({ kind: 'conflict', status: 409, message: 'conflict' }));
    await user.click(exportButton());
    expect(await alertWith('The revision changed during the export (409): nothing was exported.')).toBeTruthy();
  });

  it('on a 413 names the technical limits and says they are not regulatory', async () => {
    const { user } = await openReview();
    mocks.exportDraft.mockResolvedValue(failure({ kind: 'too_large', status: 413, message: 'TRACFIN XML limit' }));
    await user.click(exportButton());
    const notice = await alertWith('Technical limit reached');
    expect(notice.textContent).toContain('96 MiB');
    expect(notice.textContent).toContain('64 MiB');
    expect(notice.textContent).toContain('not regulatory limits');
  });

  it('saves the unsent edits first and exports the revision that results', async () => {
    const { user, backend } = await openReview();
    await user.click(nav(/^Declaration/));
    await user.type(screen.getByLabelText('Organisation name'), ' bis');
    await user.click(nav(/^Review and export/));
    // The section change already saved it; type again here to leave an edit pending on the review.
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    mocks.exportDraft.mockResolvedValue(ok(exportOf({ draft_revision: 4 })));
    await user.click(exportButton());
    await screen.findByText(/Export finished for revision 4/);
    expect(mocks.exportDraft).toHaveBeenCalledWith({ data: { caseId: CASE_ID, body: { expected_revision: 4 } } });
  });

  it('does not export while an edit cannot be sent (a malformed amount), and says so', async () => {
    const { user, backend } = await openReview();
    await user.click(nav(/^Operations/));
    await user.type(screen.getAllByLabelText('Global suspicion amount — entered, never computed')[0]!, 'abc');
    await user.click(nav(/^Review and export/));
    await user.click(exportButton());

    const notice = await alertWith('Some changes cannot be saved');
    expect(notice.textContent).toContain('nothing was exported');
    expect(mocks.exportDraft).not.toHaveBeenCalled();
    expect(backend.bodies).toHaveLength(0);
  });

  it('does not check or export when a conflict blocks the save', async () => {
    const { user, backend } = await openReview();
    await user.click(nav(/^Declaration/));
    await user.type(screen.getByLabelText('Organisation name'), 'Z');
    // Someone else saved meanwhile: the PATCH is refused (409).
    backend.editElsewhere(touchedElsewhere);
    await user.click(nav(/^Review and export/));
    await user.click(exportButton());
    expect(await alertWith('modified elsewhere')).toBeTruthy();
    expect(mocks.exportDraft).not.toHaveBeenCalled();
    await user.click(checkButton());
    expect(await alertWith('no check was run')).toBeTruthy();
    expect(mocks.validate).not.toHaveBeenCalled();
  });
});

describe('(g) the case and its manual SAR are left alone', () => {
  it('never calls a case or SAR server function, and only TRACFIN reads, checks and exports', async () => {
    mocks.validate.mockResolvedValue(ok(tracfinValidationFixture));
    mocks.exportDraft.mockResolvedValue(ok(exportOf()));
    mocks.download.mockResolvedValue({ received: 18342, sha256Verified: true });
    const { user } = await openReview();

    await user.click(checkButton());
    await within(validationCard()).findByText('Result for revision 3');
    await user.click(exportButton());
    await screen.findByText(/Export finished for revision 3/);
    await user.click(within(lastExport()).getByRole('button', { name: 'Download the XML' }));
    await screen.findByText('Download finished.');

    for (const [name, fn] of Object.entries(mocks.cases)) expect(fn, name).not.toHaveBeenCalled();
    // Nothing was written to the draft either: a check and an export send no PATCH.
    expect(mocks.patchDraft).not.toHaveBeenCalled();
    expect(mocks.prefill).not.toHaveBeenCalled();
  });

  it('has no import of the case, SAR or comment modules in the review sources', () => {
    const sources = import.meta.glob('./*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<
      string,
      string
    >;
    const imports = Object.entries(sources)
      .filter(([file]) => !file.includes('.spec.'))
      .flatMap(([file, text]) =>
        (text.match(/from '[^']+'/g) ?? [])
          .filter((line) =>
            /server-fns\/cases|queries\/cases|repositories|suspicion|(^|[^a-z])sar([^a-z]|$)/i.test(line),
          )
          .map((line) => `${file}: ${line}`),
      );
    expect(imports).toEqual([]);
  });
});

describe('wording', () => {
  it('says what the screen establishes and what it does not', async () => {
    await openReview();
    expect(
      screen.getByText(/“Exported”, “internal checks passed” and “accepted by ERMES” are three different states/),
    ).toBeTruthy();
    // Before any check: the layers are listed, official_xsd already unavailable, the others not run.
    const card = validationCard();
    expect(within(card).getAllByText('Not run')).toHaveLength(4);
    expect(within(card).getByText('unavailable — no official XSD validator integrated')).toBeTruthy();
  });
});
