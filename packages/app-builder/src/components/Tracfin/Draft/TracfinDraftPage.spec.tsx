import type { TracfinApiError, TracfinDraftInput } from '@app-builder/models/tracfin';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cloneDraft, draftTestCatalog, draftWithout, findByCatalogId } from './test-utils/draft-test-data';
import { FakeDraftBackend } from './test-utils/fake-backend';
import { CASE_ID, connectBackend, deferred, ok, renderDraftPage } from './test-utils/render-page';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
}));
vi.mock('@app-builder/server-fns/data', () => ({}));
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
const NOT_FOUND = failure({ kind: 'not_found', status: 404, message: 'not found' });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCatalog.mockResolvedValue(ok(draftTestCatalog));
});
afterEach(cleanup);

const nav = (name: RegExp | string) => screen.getByRole('button', { name });

describe('creation (a)', () => {
  it('sends declarant_is_actor: false explicitly when « No » is chosen, with no default answer', async () => {
    mocks.getDraft.mockResolvedValue(NOT_FOUND);
    const created = cloneDraft();
    mocks.createDraft.mockResolvedValue(ok(created));
    const { user } = await renderDraftPage();

    expect(screen.getByText('Are you the declarant of this declaration?')).toBeTruthy();
    expect(screen.getByText(/configuration \(reporting entity, contact\) is copied/)).toBeTruthy();
    const submit = screen.getByRole('button', { name: 'Create the draft' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(screen.getByRole('radio', { name: 'Yes' }).getAttribute('aria-checked')).toBe('false');
    expect(screen.getByRole('radio', { name: 'No' }).getAttribute('aria-checked')).toBe('false');

    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(submit);

    await waitFor(() => expect(mocks.createDraft).toHaveBeenCalledTimes(1));
    expect(mocks.createDraft).toHaveBeenCalledWith({ data: { caseId: CASE_ID, body: { declarant_is_actor: false } } });
    // The draft opens on the Declaration section.
    expect(await screen.findByLabelText('Organisation name')).toBeTruthy();
  });

  it('shows the backend refusal when the case has no outcome, with a link back to the case', async () => {
    mocks.getDraft.mockResolvedValue(NOT_FOUND);
    mocks.createDraft.mockResolvedValue(
      failure({ kind: 'bad_request', status: 400, message: 'case outcome required' }),
    );
    const { user } = await renderDraftPage();

    await user.click(screen.getByRole('radio', { name: 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'Create the draft' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('case outcome required');
    expect(alert.textContent).toContain('outcome is set');
    expect(within(alert).getByRole('link', { name: 'Back to the case' })).toBeTruthy();
    expect(mocks.createDraft.mock.calls[0]?.[0].data.body).toEqual({ declarant_is_actor: true });
  });

  it('opens the existing draft when creation answers 409', async () => {
    const existing = cloneDraft();
    mocks.getDraft.mockResolvedValueOnce(NOT_FOUND).mockResolvedValue(ok(existing));
    mocks.createDraft.mockResolvedValue(failure({ kind: 'conflict', status: 409, message: 'already exists' }));
    const { user } = await renderDraftPage();

    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: 'Create the draft' }));

    expect(await screen.findByLabelText('Organisation name')).toBeTruthy();
    expect(mocks.getDraft.mock.calls.length).toBeGreaterThan(1);
  });
});

describe('save model', () => {
  it('(b) keeps a pending value across section switches, then saves it in one PATCH on the right revision', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    // The PATCH is held back: the edit is in flight while the analyst moves around.
    const gate = deferred();
    mocks.patchDraft.mockImplementation(async ({ data }: { data: { body: TracfinDraftInput } }) => {
      await gate.promise;
      return backend.patch(data.body);
    });
    const { user } = await renderDraftPage();

    await user.type(screen.getByLabelText('Organisation name'), ' Sud');
    expect(screen.getByText('Unsaved changes (1)')).toBeTruthy();

    await user.click(nav(/^Context and analysis/));
    expect(screen.getByLabelText('Internal reference')).toBeTruthy();
    await user.click(nav(/^Declaration/));

    expect((screen.getByLabelText('Organisation name') as HTMLInputElement).value).toBe('Banque Exemple SA Sud');
    expect(screen.getByText('Saving…')).toBeTruthy();

    gate.resolve();
    await screen.findByText('Saved · revision 4');
    expect(mocks.patchDraft).toHaveBeenCalledTimes(1);
    const body = backend.lastBody;
    expect(body.expected_revision).toBe(3);
    expect(body.changes).toHaveLength(1);
    expect(body.changes[0]).toMatchObject({
      action: 'set_field',
      field: { field_id: '/ds/organisme/libelle' },
      value: { kind: 'text', text: 'Banque Exemple SA Sud' },
    });
    expect(body.changes[0]?.field?.value_id).toBeTruthy();
    expect((screen.getByLabelText('Organisation name') as HTMLInputElement).value).toBe('Banque Exemple SA Sud');
  });

  it('(b) keeps the edit pending through section switches when the save fails, and the retry uses the same revision', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    backend.failures = [{ kind: 'network', status: null, message: 'offline' }];
    const { user } = await renderDraftPage();

    await user.type(screen.getByLabelText('Organisation name'), '!');
    await user.click(nav(/^Context and analysis/));
    await screen.findByText('Error — try again');
    await user.click(nav(/^Declaration/));

    expect((screen.getByLabelText('Organisation name') as HTMLInputElement).value).toBe('Banque Exemple SA!');
    expect(screen.getByText(/Your changes are kept/)).toBeTruthy();

    await user.click(screen.getAllByRole('button', { name: 'Try again' })[0]!);
    await screen.findByText('Saved · revision 4');
    expect(backend.bodies.map((body) => body.expected_revision)).toEqual([3, 3]);
    expect(backend.draft.revision).toBe(4);
  });

  it('(d) emptying a saved field sends clear_field with its value_id, and nothing else', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();
    const savedValueId = findByCatalogId(backend.draft.document.root, '/ds/organisme')?.fields?.[
      '/ds/organisme/numIdPro'
    ]?.[0]?.id;

    await user.clear(screen.getByLabelText('Professional identification number'));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByText('Saved · revision 4');
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'clear_field',
        field: { block_id: expect.any(String), field_id: '/ds/organisme/numIdPro', value_id: savedValueId },
      },
    ]);
    // Shown as cleared, not as missing.
    const field = screen.getByLabelText('Professional identification number') as HTMLInputElement;
    expect(field.value).toBe('');
    expect(screen.getAllByText('Cleared').length).toBeGreaterThan(0);
  });

  it('(e) an attribute is disabled until its owner is saved, then goes in a second PATCH with parent_value_id', async () => {
    const draft = cloneDraft();
    const address = findByCatalogId(draft.document.root, '/ds/organisme/adresse')!;
    delete address.fields!['/ds/organisme/adresse/pays'];
    delete address.fields!['/ds/organisme/adresse/pays/@type'];
    const backend = new FakeDraftBackend(draft);
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();

    const attribute = () => screen.getByRole('button', { name: 'Country code type' }) as HTMLButtonElement;
    expect(attribute().disabled).toBe(true);
    expect(screen.getAllByText(/Save the value above first/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Country' }));
    await user.click(await screen.findByRole('option', { name: 'FR — France' }));
    // Picking a code saves at once.
    await screen.findByText('Saved · revision 4');
    expect(backend.bodies).toHaveLength(1);
    expect(backend.lastBody.changes).toHaveLength(1);
    expect(backend.lastBody.changes[0]?.field?.field_id).toBe('/ds/organisme/adresse/pays');

    await waitFor(() => expect(attribute().disabled).toBe(false));
    const ownerId = findByCatalogId(backend.draft.document.root, '/ds/organisme/adresse')?.fields?.[
      '/ds/organisme/adresse/pays'
    ]?.[0]?.id;

    await user.click(attribute());
    await user.click(await screen.findByRole('option', { name: 'code' }));
    await screen.findByText('Saved · revision 5');
    expect(backend.bodies).toHaveLength(2);
    expect(backend.lastBody.expected_revision).toBe(4);
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: expect.any(String), field_id: '/ds/organisme/adresse/pays/@type' },
        value: { kind: 'text', text: 'code', parent_value_id: ownerId },
      },
    ]);
  });

  it('(f) a field in a missing block creates the chain with aliases in one PATCH, then edits use the server ids', async () => {
    const backend = new FakeDraftBackend(draftWithout('/ds/context'));
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage({ initialSection: 'context' });
    const rootId = backend.draft.document.root.id;

    const reference = screen.getByLabelText('Internal reference');
    await user.type(reference, 'CASE-1');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Saved · revision 4');

    expect(backend.bodies).toHaveLength(1);
    const { changes } = backend.lastBody;
    expect(changes).toHaveLength(3);
    const [addContext, addGeneral, setReference] = changes;
    expect(addContext).toMatchObject({ action: 'add_block', parent_block_id: rootId, catalog_id: '/ds/context' });
    expect(addContext?.block_id).toMatch(/^tracfin-new-block-/);
    expect(addGeneral).toMatchObject({
      action: 'add_block',
      parent_block_id: addContext?.block_id,
      catalog_id: '/ds/context/general',
    });
    expect(setReference).toMatchObject({
      action: 'set_field',
      field: { block_id: addGeneral?.block_id, field_id: '/ds/context/general/refInterne' },
      value: { kind: 'text', text: 'CASE-1' },
    });
    expect(setReference?.field?.value_id).toBeUndefined();

    // The blocks now exist under server ids: a later edit replaces the saved value in place.
    const general = findByCatalogId(backend.draft.document.root, '/ds/context/general')!;
    const savedId = general.fields!['/ds/context/general/refInterne']![0]!.id;
    await user.type(screen.getByLabelText('Internal reference'), '-B');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Saved · revision 5');
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: general.id, field_id: '/ds/context/general/refInterne', value_id: savedId },
        value: { kind: 'text', text: 'CASE-1-B' },
      },
    ]);
  });

  it('(f) edits made while the creating PATCH is in flight follow the created value', async () => {
    const backend = new FakeDraftBackend(draftWithout('/ds/context'));
    connectBackend(mocks, backend);
    const gate = deferred();
    mocks.patchDraft.mockImplementation(async ({ data }: { data: { body: TracfinDraftInput } }) => {
      await gate.promise;
      return backend.patch(data.body);
    });
    const { user } = await renderDraftPage({ initialSection: 'context' });

    const reference = screen.getByLabelText('Internal reference');
    await user.type(reference, 'A');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Saving…');
    await user.type(reference, 'B');
    gate.resolve();

    await waitFor(() => expect(backend.draft.revision).toBe(4));
    // The queued edit is a replacement of the occurrence the first PATCH created.
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    await screen.findByText('Saved · revision 5');
    const second = backend.lastBody.changes[0];
    expect(second?.action).toBe('set_field');
    expect(second?.field?.value_id).toMatch(/^srv-/);
    expect(second?.value?.text).toBe('AB');
    expect(backend.bodies[1]?.expected_revision).toBe(4);
  });

  it('(g) confirms a value to review with set_field and the same value', async () => {
    const draft = cloneDraft();
    const organisme = findByCatalogId(draft.document.root, '/ds/organisme')!;
    const value = organisme.fields!['/ds/organisme/libelle']![0]!;
    value.needs_review = true;
    value.origin = { source: 'settings', resolution: 'needs_review' };
    const backend = new FakeDraftBackend(draft);
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();

    expect(screen.getByText('To review')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await screen.findByText('Saved · revision 4');
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: organisme.id, field_id: '/ds/organisme/libelle', value_id: value.id },
        value: { kind: 'text', text: 'Banque Exemple SA' },
      },
    ]);
    expect(screen.queryByText('To review')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Confirm' })).toBeNull();
  });
});

describe('shell', () => {
  it('shows what TRACFIN expects and is still empty on each section, without blocking anything', async () => {
    const backend = new FakeDraftBackend(draftWithout('/ds/context'));
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();

    const badge = (section: RegExp) => within(nav(section)).queryByTitle(/expected by TRACFIN not filled in/);
    // Declarant phone.
    expect(badge(/^Declaration/)?.textContent).toBe('1');
    // Legal framework, internal reference, the report flag; the analysis is filled.
    expect(badge(/^Context and analysis/)?.textContent).toBe('3');
    expect(badge(/^Review and export/)).toBeNull();

    await user.click(nav(/^Context and analysis/));
    await user.type(screen.getByLabelText('Internal reference'), 'R');
    expect(badge(/^Context and analysis/)?.textContent).toBe('2');
  });

  it('keeps the section in the page state and shows the placeholder of a section built later', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user, section } = await renderDraftPage();
    for (const [name, expected] of [
      [/^Operations/, 'operations'],
      [/^Attachments/, 'pieces'],
      [/^Review and export/, 'review'],
    ] as const) {
      await user.click(nav(name));
      expect(section()).toBe(expected);
      expect(screen.getByText(/section is not available yet/)).toBeTruthy();
    }
  });

  it('refreshes from the configuration only after a confirmation that says every value becomes « to review »', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();

    expect(screen.getByText(/Configuration revision 3/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Refresh from the configuration' }));
    expect(await screen.findByText(/Every value of the draft will be marked/)).toBeTruthy();
    expect(backend.bodies).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    await screen.findByText('Saved · revision 4');
    expect(backend.lastBody.changes).toEqual([{ action: 'refresh_configuration' }]);
    expect(screen.getByText(/Configuration revision 4/)).toBeTruthy();
    expect(screen.getAllByText('To review').length).toBeGreaterThan(0);
  });

  it('sends the pending field edits first when a structural change is made', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();

    await user.type(screen.getByLabelText('Organisation name'), '!');
    await user.click(screen.getByRole('button', { name: 'Refresh from the configuration' }));
    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    await screen.findByText(/Saved · revision/);
    expect(backend.bodies.flatMap((body) => body.changes.map((change) => change.action))).toEqual([
      'set_field',
      'refresh_configuration',
    ]);
    expect(backend.bodies).toHaveLength(2);
  });
});

describe('conflicts (c)', () => {
  it('keeps the pending value on 409, compares server and local, and re-applies on the refetched revision', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();

    // Someone else changed the same field and the revision moved on.
    backend.editElsewhere((draft) => {
      findByCatalogId(draft.document.root, '/ds/organisme')!.fields!['/ds/organisme/libelle']![0]!.text =
        'Banque Autre';
    });

    await user.type(screen.getByLabelText('Organisation name'), ' Sud');
    await user.click(nav(/^Context and analysis/));

    const banner = await screen.findByText('The draft was modified elsewhere');
    expect(banner).toBeTruthy();
    expect(screen.getByText('Conflict')).toBeTruthy();
    await user.click(nav(/^Declaration/));
    expect((screen.getByLabelText('Organisation name') as HTMLInputElement).value).toBe('Banque Exemple SA Sud');

    await user.click(screen.getByRole('button', { name: 'Reload and compare' }));
    const table = await screen.findByRole('table');
    const row = within(table).getByText('Organisation name').closest('tr')!;
    expect(within(row).getByText('Banque Autre')).toBeTruthy();
    expect(within(row).getByText('Banque Exemple SA Sud')).toBeTruthy();
    // Nothing was overwritten yet.
    expect(backend.draft.revision).toBe(4);
    expect(backend.bodies).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Re-apply my changes' }));
    await screen.findByText('Saved · revision 5');
    expect(backend.bodies).toHaveLength(2);
    expect(backend.lastBody.expected_revision).toBe(4);
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      value: { text: 'Banque Exemple SA Sud' },
    });
    expect((screen.getByLabelText('Organisation name') as HTMLInputElement).value).toBe('Banque Exemple SA Sud');
  });

  it('lists an edit whose value no longer exists instead of dropping it, and discards on request', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();

    backend.editElsewhere((draft) => {
      delete findByCatalogId(draft.document.root, '/ds/organisme')!.fields!['/ds/organisme/numIdPro'];
    });
    await user.type(screen.getByLabelText('Professional identification number'), '9');
    await user.click(nav(/^Context and analysis/));
    await screen.findByText('The draft was modified elsewhere');
    await user.click(screen.getByRole('button', { name: 'Reload and compare' }));

    const table = await screen.findByRole('table');
    expect(within(table).getByText('no longer exists')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Re-apply my changes' }));

    const alert = await screen.findByText('Changes that could not be re-applied');
    expect(alert).toBeTruthy();
    expect(backend.bodies).toHaveLength(1); // nothing was sent
    expect(screen.getByText('Unsaved changes (1)')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Discard Professional identification number' }));
    expect(await screen.findByText('Saved · revision 4')).toBeTruthy();
  });

  it('discarding after a conflict gives the server version back', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();
    backend.editElsewhere((draft) => {
      findByCatalogId(draft.document.root, '/ds/organisme')!.fields!['/ds/organisme/libelle']![0]!.text =
        'Banque Autre';
    });

    await user.type(screen.getByLabelText('Organisation name'), '!');
    await user.click(nav(/^Context and analysis/));
    await screen.findByText('The draft was modified elsewhere');
    await user.click(screen.getByRole('button', { name: 'Reload and compare' }));
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: 'Discard my changes' }));
    await user.click(nav(/^Declaration/));

    expect((screen.getByLabelText('Organisation name') as HTMLInputElement).value).toBe('Banque Autre');
    expect(screen.getByText('Saved · revision 4')).toBeTruthy();
  });

  it('keeps the edits and offers a retry after a 400, and lets the analyst discard one edit', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    // The first refusal comes from the save on blur; once refused, nothing is re-sent automatically.
    backend.failures = [
      { kind: 'bad_request', status: 400, message: 'bad parameter' },
      { kind: 'bad_request', status: 400, message: 'bad parameter' },
    ];
    const { user } = await renderDraftPage();

    await user.type(screen.getByLabelText('Organisation name'), '!');
    await user.type(screen.getByLabelText('Professional identification number'), '9');
    expect(backend.bodies).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('The server refused the changes')).toBeTruthy();
    expect(screen.getByText('bad parameter')).toBeTruthy();
    expect(within(screen.getByRole('list', { name: 'Pending changes' })).getAllByRole('listitem')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Discard Professional identification number' }));
    expect(within(screen.getByRole('list', { name: 'Pending changes' })).getAllByRole('listitem')).toHaveLength(1);
    await user.click(screen.getAllByRole('button', { name: 'Try again' })[0]!);
    await screen.findByText('Saved · revision 4');
    expect(backend.lastBody.changes).toHaveLength(1);
  });

  it('goes to the comparison when a failed save left the draft at a newer revision (an uncertain outcome)', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderDraftPage();
    // The PATCH times out although the server applied it: the draft advanced.
    mocks.patchDraft.mockImplementationOnce(async ({ data }: { data: { body: TracfinDraftInput } }) => {
      backend.patch(data.body);
      return failure({ kind: 'timeout', status: 408, message: 'timeout' });
    });

    await user.type(screen.getByLabelText('Organisation name'), '!');
    await user.click(nav(/^Context and analysis/));

    expect(await screen.findByText('The draft was modified elsewhere')).toBeTruthy();
    const table = await screen.findByRole('table');
    expect(within(table).getAllByText('Banque Exemple SA!').length).toBeGreaterThan(0);
    expect(within(table).getByText('already on the server')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Re-apply my changes' }));
    await screen.findByText('Saved · revision 4');
    // Already there: nothing was sent a second time.
    expect(backend.bodies).toHaveLength(1);
  });
});
