import type { TracfinApiError, TracfinDraft, TracfinDraftInput } from '@app-builder/models/tracfin';
import { tracfinExportFixture, tracfinValidationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { act, cleanup, screen, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DraftNotices } from '../DraftNotices';
import { LeaveGuard } from '../LeaveGuard';
import { blockAddress } from '../model/block-address';
import type { EditTarget } from '../model/pending-edits';
import { type TracfinReview, TracfinReviewProvider, useTracfinReview } from '../review/TracfinReviewContext';
import { cloneDraft, draftTestCatalog, findByCatalogId } from '../test-utils/draft-test-data';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { connectBackend, deferred, ok, renderWithEditor } from '../test-utils/render-page';
import { useTracfinDraftEditorContext } from './TracfinDraftEditorContext';
import type { TracfinDraftEditor } from './useTracfinDraftEditor';

/**
 * The save model at the editor level, driven through the hook itself against the fake backend: the
 * structural changes that fail must survive every later save, an edit made while its PATCH is in flight
 * must not be lost, and a plan that cannot be resolved is never sent.
 */

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  validate: vi.fn(),
  exportDraft: vi.fn(),
  blocker: { options: undefined as undefined | { enableBeforeUnload: () => boolean } },
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
  validateTracfinDraftFn: mocks.validate,
  exportTracfinDraftFn: mocks.exportDraft,
}));
vi.mock('@app-builder/server-fns/data', () => ({}));
vi.mock('@app-builder/server-fns/cases', () => ({}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useBlocker: (options: NonNullable<typeof mocks.blocker.options>) => {
    mocks.blocker.options = options;
    return { status: 'idle', proceed: undefined, reset: undefined };
  },
}));

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
vi.setConfig({ testTimeout: 30_000 });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCatalog.mockResolvedValue(ok(draftTestCatalog));
});
afterEach(cleanup);

const ORGANISME = '115b9983-7211-5d7d-b415-a203798fc8c8';
const LIBELLE = '/ds/organisme/libelle';
const LIBELLE_VALUE = '6477f044-5f8b-5d51-86c2-00bfd953f4df';
const NUM_ID_PRO = '/ds/organisme/numIdPro';

const serverError: TracfinApiError = { kind: 'server', status: 500, message: 'boom' };

let editor!: TracfinDraftEditor;
let review!: TracfinReview;

/** Exposes the editor and the review of the draft page to the tests, and what the editor says about itself. */
function Capture() {
  editor = useTracfinDraftEditorContext();
  review = useTracfinReview();
  return (
    <p data-testid="editor-state">
      {`status:${editor.status} pending:${editor.pendingCount} failed:${editor.failedChanges.length} failure:${editor.failure?.kind ?? 'none'}`}
    </p>
  );
}

const state = () => screen.getByTestId('editor-state').textContent;

async function setup(mutate?: (draft: TracfinDraft) => void) {
  const draft = cloneDraft();
  mutate?.(draft);
  const backend = new FakeDraftBackend(draft);
  connectBackend(mocks, backend);
  mocks.validate.mockResolvedValue(ok(tracfinValidationFixture));
  mocks.exportDraft.mockResolvedValue(ok(tracfinExportFixture));
  const view = await renderWithEditor(() => (
    <TracfinReviewProvider>
      <Capture />
      <DraftNotices />
      <LeaveGuard />
    </TracfinReviewProvider>
  ));
  return { ...view, backend, root: backend.draft.document.root.id };
}

const libelleTarget: EditTarget = {
  block: blockAddress(ORGANISME),
  fieldId: LIBELLE,
  parentValueId: null,
  valueId: LIBELLE_VALUE,
  newKey: null,
};
const numIdProTarget: EditTarget = {
  block: blockAddress(ORGANISME),
  fieldId: NUM_ID_PRO,
  parentValueId: null,
  valueId: null,
  newKey: null,
};

const libelleOf = (backend: FakeDraftBackend) =>
  findByCatalogId(backend.draft.document.root, '/ds/organisme')!.fields![LIBELLE]![0]!;
const actions = (body: TracfinDraftInput) => body.changes.map((change) => change.action);

describe('a failed structural change is never dropped by a later save (F1)', () => {
  it('is resent by the next explicit save, together with a pending edit', async () => {
    const { backend, root } = await setup();
    backend.failures = [serverError];
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
    });
    expect(state()).toBe('status:failed pending:1 failed:1 failure:unavailable');

    act(() => editor.setField(libelleTarget, { kind: 'text', text: 'Banque Sud' }));
    expect(state()).toBe('status:failed pending:2 failed:1 failure:unavailable');
    await act(async () => {
      await editor.flush();
    });

    // The edit and the change that failed travel together: nothing is forgotten.
    expect(actions(backend.lastBody)).toEqual(['set_field', 'add_block']);
    expect(findByCatalogId(backend.draft.document.root, '/ds/context')).toBeDefined();
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
  });

  it('keeps both of two failed changes in a row and sends both together', async () => {
    const { backend, root } = await setup();
    backend.failures = [serverError, serverError];
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
    });
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/personnes');
    });
    // The second explicit change carried the first one again; both are kept, neither replaced.
    expect(state()).toBe('status:failed pending:2 failed:2 failure:unavailable');
    expect(actions(backend.bodies[1]!)).toEqual(['add_block', 'add_block']);

    await act(async () => {
      await editor.retry();
    });
    expect(backend.lastBody.changes.map((change) => change.catalog_id)).toEqual(['/ds/context', '/ds/personnes']);
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
  });

  it('refuses a check while a failed change waits and cannot be resent, and checks once it was sent', async () => {
    const { backend, root } = await setup();
    backend.failures = [serverError, serverError];
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
    });

    // « Contrôler » resends the change first; it fails again, so nothing is validated.
    await act(async () => {
      await review.validate();
    });
    expect(backend.bodies).toHaveLength(2);
    expect(mocks.validate).not.toHaveBeenCalled();
    expect(review.validationFailure).toMatchObject({ kind: 'save_failed' });
    expect(state()).toContain('failed:1');

    // The next one resends it, it is saved, and the check runs on the revision that holds it.
    await act(async () => {
      await review.validate();
    });
    expect(backend.bodies).toHaveLength(3);
    expect(findByCatalogId(backend.draft.document.root, '/ds/context')).toBeDefined();
    expect(mocks.validate).toHaveBeenCalledTimes(1);
    expect(mocks.validate.mock.calls[0]![0].data.body.expected_revision).toBe(backend.draft.revision);
  });

  it('never reports an export done while a failed change still waits', async () => {
    const { backend, root } = await setup();
    backend.failures = [serverError, serverError];
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
    });

    await act(async () => {
      await review.exportDraft();
    });
    expect(mocks.exportDraft).not.toHaveBeenCalled();
    expect(review.exportOutcome).toMatchObject({ kind: 'save_failed' });
    expect(state()).toContain('failed:1');

    await act(async () => {
      await review.exportDraft();
    });
    expect(mocks.exportDraft).toHaveBeenCalledTimes(1);
    expect(review.exportOutcome).toMatchObject({ kind: 'exported' });
    expect(state()).toContain('failed:0');
  });

  it('counts the failed change for the leave guard until it is saved', async () => {
    const { backend, root } = await setup();
    expect(mocks.blocker.options?.enableBeforeUnload()).toBe(false);
    backend.failures = [serverError];
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
    });
    expect(editor.hasPendingChanges).toBe(true);
    expect(editor.hasUnsavedEdits()).toBe(true);
    expect(mocks.blocker.options?.enableBeforeUnload()).toBe(true);

    await act(async () => {
      await editor.retry();
    });
    expect(editor.hasPendingChanges).toBe(false);
    expect(mocks.blocker.options?.enableBeforeUnload()).toBe(false);
  });

  it('lists a change that failed with a 409 after « Réappliquer », keeps it, and lets the analyst retry or give it up', async () => {
    const { user, backend, root } = await setup();
    backend.editElsewhere((draft) => {
      findByCatalogId(draft.document.root, '/ds/organisme')!.fields![LIBELLE]![0]!.text = 'Banque Autre';
    });
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
    });
    expect(state()).toBe('status:conflict pending:1 failed:1 failure:conflict');
    // The change is on screen, not only in memory.
    const list = screen.getByRole('list', { name: 'Pending structural changes' });
    expect(within(list).getAllByRole('listitem')[0]!.textContent).toContain('Addition');

    await act(async () => {
      await editor.reloadAndCompare();
    });
    await act(async () => {
      await editor.reapply();
    });
    // « Réappliquer » resends the field edits only: the change made on the old draft is not forced onto the new one ...
    expect(backend.bodies).toHaveLength(1);
    // ... and it is not lost either.
    expect(state()).toBe('status:failed pending:1 failed:1 failure:none');
    expect(screen.getByRole('list', { name: 'Pending structural changes' })).toBeTruthy();

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Try again' }));
    });
    expect(backend.bodies).toHaveLength(2);
    expect(backend.lastBody.expected_revision).toBe(4);
    expect(actions(backend.lastBody)).toEqual(['add_block']);
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
  });

  it('gives up a failed change on request, and the draft is saved again', async () => {
    const { user, backend, root } = await setup();
    backend.failures = [serverError];
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
    });
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Give up these changes' }));
    });
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
    expect(mocks.blocker.options?.enableBeforeUnload()).toBe(false);
  });
});

describe('an edit undone while its PATCH is in flight is sent afterwards (F2)', () => {
  /** Holds the PATCH in flight until `release()`. */
  function holdPatch(backend: FakeDraftBackend) {
    const gate = deferred();
    mocks.patchDraft.mockImplementation(async ({ data }: { data: { body: TracfinDraftInput } }) => {
      await gate.promise;
      return backend.patch(data.body);
    });
    return gate.resolve;
  }

  it('retyping the saved value while B is being saved sends A in a second PATCH', async () => {
    const { backend } = await setup();
    const original = libelleOf(backend).text;
    const release = holdPatch(backend);

    act(() => editor.setField(libelleTarget, { kind: 'text', text: 'Banque B' }));
    let first!: Promise<unknown>;
    act(() => {
      first = editor.flush();
    });
    await vi.waitFor(() => expect(mocks.patchDraft).toHaveBeenCalledTimes(1));
    expect(state()).toContain('status:saving');

    // The analyst types the saved value back while B is on its way.
    act(() => editor.setField(libelleTarget, { kind: 'text', text: original! }));
    expect(editor.pendingCount).toBe(1);

    release();
    await act(async () => {
      await first;
    });
    // B landed, A is still pending (it was not seen as « same as saved »).
    expect(libelleOf(backend).text).toBe('Banque B');
    expect(editor.pendingCount).toBe(1);

    await act(async () => {
      await editor.flush();
    });
    expect(backend.bodies).toHaveLength(2);
    expect(backend.lastBody.changes[0]).toMatchObject({ action: 'set_field', value: { kind: 'text', text: original } });
    expect(libelleOf(backend).text).toBe(original);
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
  });

  it('emptying a new occurrence while it is being saved sends the clear afterwards', async () => {
    const { backend } = await setup((draft) => {
      delete findByCatalogId(draft.document.root, '/ds/organisme')!.fields![NUM_ID_PRO];
    });
    const release = holdPatch(backend);

    act(() => editor.setField(numIdProTarget, { kind: 'text', text: '12345' }));
    let first!: Promise<unknown>;
    act(() => {
      first = editor.flush();
    });
    await vi.waitFor(() => expect(mocks.patchDraft).toHaveBeenCalledTimes(1));

    act(() => editor.clearField(numIdProTarget));
    expect(editor.pendingCount).toBe(1);

    release();
    await act(async () => {
      await first;
    });
    const created = findByCatalogId(backend.draft.document.root, '/ds/organisme')!.fields![NUM_ID_PRO]![0]!;
    expect(created).toMatchObject({ kind: 'text', text: '12345' });
    expect(editor.pendingCount).toBe(1);

    await act(async () => {
      await editor.flush();
    });
    expect(backend.lastBody.changes).toEqual([
      { action: 'clear_field', field: { block_id: ORGANISME, field_id: NUM_ID_PRO, value_id: created.id } },
    ]);
    expect(findByCatalogId(backend.draft.document.root, '/ds/organisme')!.fields![NUM_ID_PRO]![0]!.kind).toBe(
      'cleared',
    );
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
  });

  it('does not keep an emptied new occurrence when its PATCH fails: there is nothing to clear', async () => {
    const { backend } = await setup((draft) => {
      delete findByCatalogId(draft.document.root, '/ds/organisme')!.fields![NUM_ID_PRO];
    });
    const release = holdPatch(backend);
    backend.failures = [{ kind: 'bad_request', status: 400, message: 'bad parameter' }];

    act(() => editor.setField(numIdProTarget, { kind: 'text', text: '12345' }));
    let first!: Promise<unknown>;
    act(() => {
      first = editor.flush();
    });
    await vi.waitFor(() => expect(mocks.patchDraft).toHaveBeenCalledTimes(1));
    act(() => editor.clearField(numIdProTarget));
    release();
    await act(async () => {
      await first;
    });
    // No `clear_field` without an occurrence to clear is left behind.
    expect(editor.pendingCount).toBe(0);
    expect(state()).toContain('status:failed');
  });
});

describe('a plan that cannot be resolved is never sent (F3)', () => {
  it('refuses the whole PATCH when a change names a block that is gone, and shows why', async () => {
    const { backend } = await setup();
    const before = structuredClone(backend.draft);
    let result: Awaited<ReturnType<typeof editor.applyStructural>> | undefined;
    await act(async () => {
      result = await editor.applyStructural([
        // The removal alone would lose the link; the recreation names a person that is gone.
        { type: 'remove_block', blockId: ORGANISME },
        { type: 'add_block', parent: blockAddress('person-that-vanished'), catalogId: '/ds/personnes/pp/lien' },
      ]);
    });
    expect(result).toMatchObject({ ok: false, error: { kind: 'bad_request' } });
    expect(backend.bodies).toHaveLength(0);
    expect(backend.draft).toEqual(before);
    expect(state()).toContain('failure:unresolved');
    expect(screen.getByText('Change not sent')).toBeTruthy();
    // It is not kept for a retry that could only fail again.
    expect(editor.failedChanges).toHaveLength(0);
  });

  it('is silent for a quiet caller, which gets the error and keeps the editor as it was', async () => {
    const { backend } = await setup();
    let result: Awaited<ReturnType<typeof editor.applyStructural>> | undefined;
    await act(async () => {
      result = await editor.applyStructural(
        [{ type: 'add_block', parent: blockAddress('person-that-vanished'), catalogId: '/ds/x' }],
        { quiet: true },
      );
    });
    expect(result).toMatchObject({ ok: false });
    expect(backend.bodies).toHaveLength(0);
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
  });
});

describe('the quiet branch restores the failure as it was (F5)', () => {
  it('keeps an earlier failure even when the refusal follows it before the screen re-rendered', async () => {
    const { backend, root } = await setup();
    backend.failures = [serverError];
    // One tick, no render in between: the failure was just set when the quiet request starts.
    await act(async () => {
      await editor.addBlock(blockAddress(root), '/ds/context');
      await editor.applyStructural(
        [{ type: 'apply_prefill', proposalId: 'x', candidateId: 'y', mappingVersion: 'z' }],
        { quiet: true },
      );
    });
    expect(state()).toBe('status:failed pending:1 failed:1 failure:unavailable');
  });
});

describe('« Réappliquer » moves the base revision only while edits remain (F7)', () => {
  it('guards the next edit by the revision it was made on, not by a stale one from the comparison', async () => {
    const { backend, queryClient } = await setup();
    backend.editElsewhere((draft) => {
      findByCatalogId(draft.document.root, '/ds/organisme')!.fields![LIBELLE]![0]!.text = 'Banque Autre';
    });
    // The analyst typed the same value as the one the other person saved: nothing is left to resend.
    act(() => editor.setField(libelleTarget, { kind: 'text', text: 'Banque Autre' }));
    await act(async () => {
      await editor.flush();
    });
    expect(state()).toContain('status:conflict');
    await act(async () => {
      await editor.reloadAndCompare();
    });
    await act(async () => {
      await editor.reapply();
    });
    expect(editor.pendingCount).toBe(0);

    // The draft moves on again; the cache catches up; then a new edit is made and saved.
    backend.editElsewhere((draft) => {
      draft.updated_by = 'someone-else-again';
    });
    await act(async () => {
      await queryClient.refetchQueries();
    });
    act(() => editor.setField(libelleTarget, { kind: 'text', text: 'Banque Finale' }));
    await act(async () => {
      await editor.flush();
    });
    expect(backend.lastBody.expected_revision).toBe(backend.draft.revision - 1);
    expect(state()).toBe('status:idle pending:0 failed:0 failure:none');
  });
});
