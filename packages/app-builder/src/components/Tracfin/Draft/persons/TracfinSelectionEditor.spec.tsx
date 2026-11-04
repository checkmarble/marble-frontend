import type { TracfinContextRoot, TracfinDiagnostic } from '@app-builder/models/tracfin';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TracfinBlockDiagnosticsContext } from '../fields/block-diagnostics';
import { PersonsSection } from '../sections/PersonsSection';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import {
  connectPersons,
  makePersonsMocks,
  type NavigationAnswer,
  page,
  unprocessable,
} from '../test-utils/persons-harness';
import { personsDraft, personsTestIndex } from '../test-utils/persons-test-data';
import { renderWithEditor } from '../test-utils/render-page';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  getContext: vi.fn(),
  navigate: vi.fn(),
  getDataModel: vi.fn(),
  getObjectDetails: vi.fn(),
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
  getTracfinContextFn: mocks.getContext,
  navigateTracfinFn: mocks.navigate,
}));
vi.mock('@app-builder/server-fns/data', () => ({
  getDataModelFn: mocks.getDataModel,
  getObjectDetailsFn: mocks.getObjectDetails,
}));
vi.mock('@app-builder/server-fns/cases', () => ({}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
vi.setConfig({ testTimeout: 30_000 });

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

const ROOT: TracfinContextRoot = { table: 'users', record_id: 'user_8841', origins: ['case_manual_entity'] };

/** The client base of the tests: user_8841 owns A1 (cards C1, C2) and A2 (card C3); accounts come two pages of one. */
function clientBase(body: {
  selection: { bindings?: { id: string; record_id?: string }[] };
  step_id: string;
  cursor?: string;
}): NavigationAnswer {
  const account = body.selection.bindings?.find((binding) => binding.id === 'accounts')?.record_id;
  if (body.step_id === 'accounts') {
    return body.cursor
      ? page(['A2'], { extra: () => ({ user_id: 'user_8841', balance: 20 }) })
      : page(['A1'], { next: 'A1', extra: () => ({ user_id: 'user_8841', balance: 10 }) });
  }
  if (body.step_id === 'cards') {
    const cards: Record<string, string[]> = { A1: ['C1', 'C2'], A2: ['C3'] };
    return page(cards[account ?? ''] ?? [], { extra: (id) => ({ account_id: account, number: `4970-${id}` }) });
  }
  return page([]);
}

async function openCardEditor(options: { navigation?: typeof clientBase; diagnostics?: TracfinDiagnostic[] } = {}) {
  const draft = personsDraft();
  if (options.diagnostics) draft.diagnostics = options.diagnostics;
  const backend = new FakeDraftBackend(draft);
  connectPersons(mocks as unknown as ReturnType<typeof makePersonsMocks>, backend, {
    roots: [ROOT],
    navigation: options.navigation ?? clientBase,
  });
  const rendered = await renderWithEditor(() => <PersonsSection />, { catalogIndex: personsTestIndex });
  const { user } = rendered;
  const person = await screen.findByRole('region', { name: 'Jeanne Martin' });
  await user.click(within(person).getByRole('button', { name: 'Open' }));
  return { ...rendered, backend, person };
}

/** Opens the selection editor of a bank card support, bound to the record the person comes from. */
async function startCardSelection() {
  const opened = await openCardEditor();
  await opened.user.click(
    within(opened.person).getByRole('button', { name: 'From the client base: Bank card number' }),
  );
  return opened;
}

const accountList = () => screen.getByRole('radiogroup', { name: 'Choose in accounts' });
const cardList = () => screen.getByRole('radiogroup', { name: 'Choose in cards' });

describe('selection editor: User → Account → Card (a)', () => {
  it('lists the accounts a page at a time, never as complete, then only the cards of the chosen account', async () => {
    const { user, backend } = await startCardSelection();

    // The first page of accounts: marked partial, with a way to load more.
    await within(await screen.findByRole('radiogroup', { name: 'Choose in accounts' })).findByRole('radio', {
      name: /A1/,
    });
    expect(screen.getByText(/Partial list: 1 record\(s\) loaded, more exist\./)).toBeTruthy();
    expect(within(accountList()).queryByRole('radio', { name: /A2/ })).toBeNull();
    // Each record shows a few of its fields, to tell it from the others.
    expect(within(accountList()).getByRole('radio', { name: /A1/ }).textContent).toContain('balance: 10');
    expect(screen.queryByText(/^1 record\(s\)$/)).toBeNull();

    // Cards cannot be listed before an account is chosen.
    expect(screen.getByText('Choose the previous step first.')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Load more' }));
    await within(accountList()).findByRole('radio', { name: /A2/ });
    expect(within(accountList()).getAllByRole('radio')).toHaveLength(2);
    // The last page: the partial marker is gone.
    await waitFor(() => expect(screen.queryByText(/Partial list/)).toBeNull());
    expect(mocks.navigate.mock.calls.at(-1)?.[0].data.body).toMatchObject({ step_id: 'accounts', cursor: 'A1' });

    await user.click(within(accountList()).getByRole('radio', { name: /A2/ }));
    const cards = await screen.findByRole('radiogroup', { name: 'Choose in cards' });
    await within(cards).findByRole('radio', { name: /C3/ });
    // Only the cards of A2, asked for with the account already chosen.
    expect(within(cards).getAllByRole('radio')).toHaveLength(1);
    expect(within(cards).queryByRole('radio', { name: /C1/ })).toBeNull();
    const cardRequest = mocks.navigate.mock.calls.at(-1)?.[0].data.body;
    expect(cardRequest).toMatchObject({
      step_id: 'cards',
      selection: {
        mapping_id: 'map-card-number',
        root: { id: 'root', table: 'users', record_id: 'user_8841' },
        bindings: [{ id: 'accounts', record_id: 'A2' }],
      },
    });

    await user.click(within(cardList()).getByRole('radio', { name: /C3/ }));
    await user.click(screen.getByRole('button', { name: 'Save the selection' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    const changes = backend.lastBody.changes;
    // /ds/personnes/pp has no financial references yet: they are created by the same PATCH.
    expect(changes.map((change) => change.action)).toEqual(['add_block', 'add_block', 'set_selection']);
    expect(changes[1]).toMatchObject({
      catalog_id: '/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire',
    });
    expect(changes[2]).toEqual({
      action: 'set_selection',
      block_id: changes[1]!.block_id,
      selection: {
        mapping_id: 'map-card-number',
        root: { id: 'root', table: 'users', record_id: 'user_8841' },
        bindings: [
          { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts', record_id: 'A2' },
          {
            id: 'cards',
            parent_id: 'accounts',
            link: 'account',
            direction: 'inverse',
            table: 'cards',
            record_id: 'C3',
          },
        ],
      },
    });
    // The support exists afterwards, with the path it was read from.
    const support = await screen.findByRole('region', { name: 'Bank card number no. 1' });
    const path = within(support).getByLabelText('Path in the client base');
    expect(path.textContent).toContain('accounts · A2');
    expect(path.textContent).toContain('cards · C3');
  });

  it('changing the account clears the card chosen under it before anything is saved (b)', async () => {
    const { user, backend } = await startCardSelection();
    await within(await screen.findByRole('radiogroup', { name: 'Choose in accounts' })).findByRole('radio', {
      name: /A1/,
    });
    await user.click(screen.getByRole('button', { name: 'Load more' }));
    await within(accountList()).findByRole('radio', { name: /A2/ });

    await user.click(within(accountList()).getByRole('radio', { name: /A2/ }));
    await within(await screen.findByRole('radiogroup', { name: 'Choose in cards' })).findByRole('radio', {
      name: /C3/,
    });
    await user.click(within(cardList()).getByRole('radio', { name: /C3/ }));
    expect(within(cardList()).getByRole('radio', { name: /C3/ }).getAttribute('aria-checked')).toBe('true');

    // Another account: the card of A2 is dropped at once and the cards of A1 are listed.
    await user.click(within(accountList()).getByRole('radio', { name: /A1/ }));
    await within(await screen.findByRole('radiogroup', { name: 'Choose in cards' })).findByRole('radio', {
      name: /C1/,
    });
    expect(within(cardList()).queryByRole('radio', { name: /C3/ })).toBeNull();
    for (const radio of within(cardList()).getAllByRole('radio'))
      expect(radio.getAttribute('aria-checked')).toBe('false');
    expect(screen.getByRole('status').textContent).toContain('cards');
    expect(backend.bodies).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Save the selection' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    const selection = backend.lastBody.changes[2]?.selection;
    expect(selection?.bindings?.map((binding) => [binding.id, binding.record_id])).toEqual([['accounts', 'A1']]);
  });

  it('says a hop has no navigation index when the server refuses with 422, instead of showing an empty list (c)', async () => {
    const { user } = await openCardEditor({
      navigation: (body) => (body.step_id === 'cards' ? unprocessable : clientBase(body)),
    });
    await user.click(screen.getByRole('button', { name: 'From the client base: Bank card number' }));
    await within(await screen.findByRole('radiogroup', { name: 'Choose in accounts' })).findByRole('radio', {
      name: /A1/,
    });
    await user.click(within(accountList()).getByRole('radio', { name: /A1/ }));

    const alert = await screen.findByText('Navigation not indexed for this link');
    expect(alert.getAttribute('role')).toBe('alert');
    expect(screen.queryByText('No record returned for this step.')).toBeNull();
    expect(screen.queryByRole('radiogroup', { name: 'Choose in cards' })).toBeNull();
  });

  it('also says it when the server answers 200 with the NAVIGATION_INDEX_UNAVAILABLE diagnostic and no object', async () => {
    const { user } = await openCardEditor({
      navigation: (body) =>
        body.step_id === 'cards'
          ? {
              objects: [],
              has_next_page: false,
              diagnostics: [
                { code: 'NAVIGATION_INDEX_UNAVAILABLE', layer: 'sources', severity: 'warning', message: '' },
              ],
            }
          : clientBase(body),
    });
    await user.click(screen.getByRole('button', { name: 'From the client base: Bank card number' }));
    await within(await screen.findByRole('radiogroup', { name: 'Choose in accounts' })).findByRole('radio', {
      name: /A1/,
    });
    await user.click(within(accountList()).getByRole('radio', { name: /A1/ }));
    expect(await screen.findByText('Navigation not indexed for this link')).toBeTruthy();
    expect(screen.queryByText('No record returned for this step.')).toBeNull();
  });
});

describe('diagnostics on a block with a selection (d)', () => {
  const stale = (code: string): TracfinDiagnostic[] => [
    {
      code,
      layer: 'sources',
      severity: 'warning',
      message: 'raw message',
      field: { block_id: 'civil-1', field_id: '' },
    },
  ];

  it('offers a new selection and sends set_selection with the chosen root', async () => {
    const draftRoots = [ROOT, { table: 'users', record_id: 'user_9', origins: ['decision_pivot'] as const }];
    const draft = personsDraft();
    draft.diagnostics = stale('SELECTION_STALE');
    const backend = new FakeDraftBackend(draft);
    connectPersons(mocks as unknown as ReturnType<typeof makePersonsMocks>, backend, {
      roots: draftRoots.map((root) => ({ ...root, origins: [...root.origins] })),
      navigation: clientBase,
    });
    const { user } = await renderWithEditor(() => <PersonsSection />, { catalogIndex: personsTestIndex });
    const person = await screen.findByRole('region', { name: 'Jeanne Martin' });
    await user.click(within(person).getByRole('button', { name: 'Open' }));

    const panel = (await within(person).findAllByRole('region', { name: 'Client base' }))[0]!;
    expect(within(panel).getByRole('alert').textContent).toContain('no longer matches the configuration');
    await user.click(within(panel).getByRole('button', { name: 'Choose a new selection' }));

    // The current root is checked; the analyst picks the other one.
    const roots = await within(panel).findByRole('radiogroup', { name: 'Starting record' });
    await within(roots).findByRole('radio', { name: /user_9/ });
    expect(
      within(roots)
        .getByRole('radio', { name: /user_8841/ })
        .getAttribute('aria-checked'),
    ).toBe('true');
    await user.click(within(roots).getByRole('radio', { name: /user_9/ }));
    await user.click(within(panel).getByRole('button', { name: 'Save the selection' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_selection',
        block_id: 'civil-1',
        selection: { mapping_id: 'map-user-last-name', root: { id: 'root', table: 'users', record_id: 'user_9' } },
      },
    ]);
  });

  it('flags the values of the block « to review » after a new selection, and they are confirmed as before', async () => {
    const draft = personsDraft();
    draft.diagnostics = stale('SELECTION_STALE');
    const backend = new FakeDraftBackend(draft);
    connectPersons(mocks as unknown as ReturnType<typeof makePersonsMocks>, backend, {
      roots: [ROOT, { table: 'users', record_id: 'user_9', origins: ['decision_pivot'] }],
    });
    const { user } = await renderWithEditor(() => <PersonsSection />, { catalogIndex: personsTestIndex });
    const person = await screen.findByRole('region', { name: 'Jeanne Martin' });
    await user.click(within(person).getByRole('button', { name: 'Open' }));
    const panel = (await within(person).findAllByRole('region', { name: 'Client base' }))[0]!;
    await user.click(within(panel).getByRole('button', { name: 'Choose a new selection' }));
    await user.click(await within(panel).findByRole('radio', { name: /user_9/ }));
    await user.click(within(panel).getByRole('button', { name: 'Save the selection' }));

    const civil = await screen.findByRole('region', { name: 'Civil status' });
    const confirms = await within(civil).findAllByRole('button', { name: 'Confirm' });
    expect(confirms.length).toBeGreaterThan(0);
    await user.click(confirms[0]!);
    await waitFor(() => expect(backend.bodies).toHaveLength(2));
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      field: { block_id: 'civil-1', value_id: expect.stringMatching(/^v-/) },
    });
  });

  it('shows the diagnostics the prefill panel keeps in the shared store, not only those of the draft', async () => {
    const backend = new FakeDraftBackend(personsDraft());
    connectPersons(mocks as unknown as ReturnType<typeof makePersonsMocks>, backend, { roots: [ROOT] });
    const { user } = await renderWithEditor(
      () => (
        <TracfinBlockDiagnosticsContext.Provider value={stale('MAPPING_UNAVAILABLE')}>
          <PersonsSection />
        </TracfinBlockDiagnosticsContext.Provider>
      ),
      { catalogIndex: personsTestIndex },
    );
    const person = await screen.findByRole('region', { name: 'Jeanne Martin' });
    await user.click(within(person).getByRole('button', { name: 'Open' }));
    expect((await within(person).findByRole('alert')).textContent).toContain(
      'no longer exists in the draft configuration',
    );
  });

  it.each([
    'SELECTION_PARENT_CHANGED',
    'SOURCE_UNAVAILABLE',
    'MAPPING_UNAVAILABLE',
    'LINK_UNAVAILABLE',
    'NAVIGATION_INDEX_UNAVAILABLE',
  ])('explains %s on the block it concerns', async (code) => {
    const draft = personsDraft();
    draft.diagnostics = stale(code);
    const backend = new FakeDraftBackend(draft);
    connectPersons(mocks as unknown as ReturnType<typeof makePersonsMocks>, backend, { roots: [ROOT] });
    const { user } = await renderWithEditor(() => <PersonsSection />, { catalogIndex: personsTestIndex });
    const person = await screen.findByRole('region', { name: 'Jeanne Martin' });
    await user.click(within(person).getByRole('button', { name: 'Open' }));
    const panel = (await within(person).findAllByRole('region', { name: 'Client base' }))[0]!;
    expect(within(panel).getByRole('alert').textContent).not.toContain('raw message');
    expect(within(panel).getByRole('button', { name: 'Choose a new selection' })).toBeTruthy();
    expect(within(panel).getByRole('button', { name: 'Remove this block' })).toBeTruthy();
  });

  it('removes the block after a confirmation and sends remove_block', async () => {
    const draft = personsDraft();
    draft.diagnostics = stale('SELECTION_STALE');
    const backend = new FakeDraftBackend(draft);
    connectPersons(mocks as unknown as ReturnType<typeof makePersonsMocks>, backend, { roots: [ROOT] });
    const { user } = await renderWithEditor(() => <PersonsSection />, { catalogIndex: personsTestIndex });
    const person = await screen.findByRole('region', { name: 'Jeanne Martin' });
    await user.click(within(person).getByRole('button', { name: 'Open' }));
    const panel = (await within(person).findAllByRole('region', { name: 'Client base' }))[0]!;

    await user.click(within(panel).getByRole('button', { name: 'Remove this block' }));
    expect(backend.bodies).toHaveLength(0);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([{ action: 'remove_block', block_id: 'civil-1' }]);
  });
});
