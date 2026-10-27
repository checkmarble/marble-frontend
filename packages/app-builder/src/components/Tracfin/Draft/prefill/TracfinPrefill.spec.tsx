import type { TracfinDiagnostic, TracfinDraft } from '@app-builder/models/tracfin';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TracfinBlockExtrasContext } from '../fields/block-extras';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { blockAddress } from '../model/block-address';
import { BlockSelectionPanel } from '../persons/BlockSelectionPanel';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { MAPPING_VERSION, type ScriptedProposal, scriptedPrefill } from '../test-utils/fake-prefill';
import { connectPersons, type PersonsMocks } from '../test-utils/persons-harness';
import { ACTIVITY_NAME, CIVIL, IDS, prefillDraft, prefillTestIndex } from '../test-utils/prefill-test-data';
import { ok, renderWithEditor } from '../test-utils/render-page';
import { PrefillButton } from './PrefillButton';
import { PrefillPanel } from './PrefillPanel';
import { TracfinPrefillProvider } from './TracfinPrefillContext';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  prefill: vi.fn(),
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
  prefillTracfinDraftFn: mocks.prefill,
  getTracfinContextFn: mocks.getContext,
  navigateTracfinFn: mocks.navigate,
}));
vi.mock('@app-builder/server-fns/data', () => ({
  getDataModelFn: mocks.getDataModel,
  getObjectDetailsFn: mocks.getObjectDetails,
}));
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

const userSource = (field: string) => ({
  kind: 'ingested',
  table: 'users',
  record_id: 'user_8841',
  field,
  path: [{ id: 'root', table: 'users', record_id: 'user_8841' }],
});

const BIRTH_NAME = `${CIVIL}/nomNaissance`;
const BIRTH_DATE = `${CIVIL}/dateNaissance`;
const SEX = `${CIVIL}/sexe`;
const FIRST_NAME = `${CIVIL}/prenom`;
const USAGE_NAME = `${CIVIL}/nomDusage`;
const PERIOD_START = '/ds/operations/dateDebut';

const civilFields = new Set([BIRTH_NAME, BIRTH_DATE, SEX, FIRST_NAME, USAGE_NAME]);

const script: ScriptedProposal[] = [
  { blockId: IDS.civil, fieldId: BIRTH_NAME, candidates: [{ text: 'Martin', source: userSource('last_name') }] },
  { blockId: IDS.civil, fieldId: BIRTH_DATE, candidates: [{ text: '12/03/1985', source: userSource('birth_date') }] },
  {
    blockId: IDS.activity,
    fieldId: ACTIVITY_NAME,
    candidates: [
      {
        text: 'ACME Holding SAS',
        source: {
          kind: 'ingested',
          table: 'companies',
          record_id: 'company_302',
          field: 'name',
          path: [
            { id: 'root', table: 'users', record_id: 'user_8841' },
            {
              id: 'employer',
              parent_id: 'root',
              link: 'employer',
              direction: 'forward',
              table: 'companies',
              record_id: 'company_302',
            },
          ],
        },
      },
      { text: 'ACME SAS', source: userSource('employer_name') },
    ],
  },
];

const diagnostic = (code: string, blockId: string, fieldId: string): TracfinDiagnostic => ({
  code,
  layer: 'sources',
  severity: 'warning',
  message: code,
  field: { block_id: blockId, field_id: fieldId },
});

const PlainWrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const ExtrasWrapper = ({ children }: { children: React.ReactNode }) => (
  <TracfinBlockExtrasContext.Provider value={BlockSelectionPanel}>{children}</TracfinBlockExtrasContext.Provider>
);

function Harness({ withExtras = false }: { withExtras?: boolean }) {
  const Wrapper = withExtras ? ExtrasWrapper : PlainWrapper;
  return (
    <Wrapper>
      <TracfinPrefillProvider>
        <PrefillButton />
        <PrefillPanel />
        <TracfinBlockEditor address={blockAddress(IDS.civil)} catalogId={CIVIL} include={(id) => civilFields.has(id)} />
        <TracfinBlockEditor
          address={blockAddress(IDS.operations)}
          catalogId="/ds/operations"
          include={(id) => id.startsWith('/ds/operations/date')}
        />
      </TracfinPrefillProvider>
    </Wrapper>
  );
}

type Setup = {
  draft?: TracfinDraft;
  script?: ScriptedProposal[];
  diagnostics?: TracfinDiagnostic[];
  withExtras?: boolean;
};

async function setup({
  draft = prefillDraft(),
  script: proposals = script,
  diagnostics = [],
  withExtras = false,
}: Setup = {}) {
  const backend = new FakeDraftBackend(draft);
  backend.prefill = scriptedPrefill(proposals, diagnostics);
  connectPersons(mocks as unknown as PersonsMocks, backend);
  mocks.prefill.mockImplementation(async ({ data }: { data: { body: { expected_revision: number } } }) =>
    data.body.expected_revision === backend.draft.revision
      ? ok(backend.prefill!(backend.draft))
      : { ok: false, error: { kind: 'conflict', status: 409, message: 'stale revision' } },
  );
  const rendered = await renderWithEditor(() => <Harness withExtras={withExtras} />, {
    catalogIndex: prefillTestIndex,
  });
  return { backend, ...rendered };
}

async function propose(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: 'Propose values' }));
  return screen.findByRole('dialog');
}

async function closePanel(user: UserEvent) {
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}

const valuesOf = (backend: FakeDraftBackend, blockId: string, fieldId: string) => {
  const find = (block: TracfinDraft['document']['root']): TracfinDraft['document']['root'] | null =>
    block.id === blockId ? block : ((block.children ?? []).map(find).find(Boolean) ?? null);
  return find(backend.draft.document.root)?.fields?.[fieldId] ?? [];
};

const proposalId = (blockId: string, fieldId: string, revision = 3) => `proposal:${revision}:${blockId}:${fieldId}`;
const applyOf = (blockId: string, fieldId: string, candidate = 0, revision = 3) => ({
  action: 'apply_prefill',
  proposal_id: proposalId(blockId, fieldId, revision),
  candidate_id: `${proposalId(blockId, fieldId, revision)}:candidate:${candidate}`,
  mapping_version: MAPPING_VERSION,
});

describe('batch apply (a)', () => {
  it('lists the counts and sends every selected proposal in ONE PATCH of apply_prefill changes', async () => {
    const { user, backend } = await setup({ diagnostics: [diagnostic('UNKNOWN_CODE', IDS.civil, SEX)] });
    const dialog = within(await propose(user));

    expect(await dialog.findByText('2 proposals without conflict')).toBeTruthy();
    expect(dialog.getByText('1 conflict')).toBeTruthy();
    expect(dialog.getByText('1 diagnostic')).toBeTruthy();
    // Grouped by section, then by block (the person's name behind the block title).
    expect(dialog.getByRole('region', { name: 'Persons' })).toBeTruthy();
    expect(dialog.getByRole('region', { name: 'Jeanne — Civil status' })).toBeTruthy();
    expect(dialog.getByText('Martin')).toBeTruthy();
    expect(dialog.getAllByText('Customer data').length).toBeGreaterThan(0);

    await user.click(dialog.getByRole('button', { name: 'Apply the 2 proposals' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody).toEqual({
      expected_revision: 3,
      changes: [applyOf(IDS.civil, BIRTH_NAME), applyOf(IDS.civil, BIRTH_DATE)],
    });
    await dialog.findByText(/2 values applied/);
    expect(valuesOf(backend, IDS.civil, BIRTH_NAME)[0]).toMatchObject({
      text: 'Martin',
      origin: { source: 'ingested' },
    });
    expect(valuesOf(backend, IDS.civil, BIRTH_DATE)[0]).toMatchObject({ text: '12/03/1985' });
    // Nothing is applied silently: the conflict stays listed and unwritten.
    expect(valuesOf(backend, IDS.activity, ACTIVITY_NAME)).toEqual([]);
    expect(await dialog.findByText('1 conflict')).toBeTruthy();
    // The proposals were recomputed on the new revision; the applied ones are gone.
    await waitFor(() => expect(mocks.prefill).toHaveBeenCalledTimes(2));
    expect(mocks.prefill.mock.calls[1]![0].data.body.expected_revision).toBe(4);
    expect(await dialog.findByText('0 proposals without conflict')).toBeTruthy();
  });

  it('applies only the proposals that stay checked', async () => {
    const { user, backend } = await setup();
    const dialog = within(await propose(user));
    await dialog.findByText('2 proposals without conflict');

    await user.click(dialog.getByRole('checkbox', { name: 'Apply the proposal for Date of birth' }));
    await user.click(dialog.getByRole('button', { name: 'Apply the proposal' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([applyOf(IDS.civil, BIRTH_NAME)]);
    expect(valuesOf(backend, IDS.civil, BIRTH_DATE)).toEqual([]);
  });
});

describe('conflicts (b)', () => {
  it('shows both candidates with their origins and applies only the chosen one', async () => {
    const { user, backend } = await setup();
    const dialog = within(await propose(user));
    const conflict = within(await dialog.findByRole('region', { name: /Conflict on/ }));

    // Both values, side by side, each with its origin.
    expect(conflict.getByText('ACME Holding SAS')).toBeTruthy();
    expect(conflict.getByText('ACME SAS')).toBeTruthy();
    for (const expected of ['companies', 'company_302', 'name', 'employer_name', 'user_8841']) {
      expect(conflict.getAllByText(expected).length).toBeGreaterThan(0);
    }
    expect(conflict.getByText('users → companies')).toBeTruthy(); // path steps
    expect(conflict.getAllByText(MAPPING_VERSION.slice(0, 12))).toHaveLength(2); // mapping version
    expect(backend.bodies).toHaveLength(0);

    await user.click(conflict.getAllByRole('button', { name: /Choose value 2 for/ })[0]!);

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([applyOf(IDS.activity, ACTIVITY_NAME, 1)]);
    expect(valuesOf(backend, IDS.activity, ACTIVITY_NAME)[0]).toMatchObject({ text: 'ACME SAS' });
    // The two clean proposals were not part of it.
    expect(valuesOf(backend, IDS.civil, BIRTH_NAME)).toEqual([]);
  });

  it('« Saisir une autre valeur » opens the field in the generic editor: a manual set_field, no apply', async () => {
    const { user, backend } = await setup();
    const dialog = within(await propose(user));
    const conflict = within(await dialog.findByRole('region', { name: /Conflict on/ }));

    await user.click(conflict.getByRole('button', { name: 'Enter another value' }));
    await user.type(conflict.getByRole('textbox'), 'ACME Group');
    await user.tab();

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: IDS.activity, field_id: ACTIVITY_NAME },
        value: { kind: 'text', text: 'ACME Group' },
      },
    ]);
    expect(valuesOf(backend, IDS.activity, ACTIVITY_NAME)[0]).toMatchObject({ origin: { source: 'manual' } });
    // The revision moved: the proposals are to be recomputed, and after that the field is not proposed any more.
    expect(await dialog.findByText('To recompute')).toBeTruthy();
    await user.click(dialog.getByRole('button', { name: 'Recompute' }));
    await dialog.findByText('0 conflicts');
    expect(dialog.queryByRole('region', { name: /Conflict on/ })).toBeNull();
  });
});

describe('what the analyst decided stays decided (c, d)', () => {
  it('a field corrected by hand before the prefill gets no proposal and is not overwritten', async () => {
    const { user, backend } = await setup();
    await user.type(screen.getByRole('textbox', { name: 'Birth name' }), 'Dupont');
    const dialog = within(await propose(user));

    // The edit was saved first: the server then knows the field is manual and proposes nothing for it.
    await dialog.findByText('1 proposal without conflict');
    expect(dialog.queryByText('Martin')).toBeNull();
    expect(dialog.queryByRole('checkbox', { name: 'Apply the proposal for Birth name' })).toBeNull();

    await user.click(dialog.getByRole('button', { name: 'Apply the proposal' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(2));
    expect(backend.lastBody.changes).toEqual([applyOf(IDS.civil, BIRTH_DATE, 0, 4)]);
    expect(valuesOf(backend, IDS.civil, BIRTH_NAME)[0]).toMatchObject({ text: 'Dupont', origin: { source: 'manual' } });
  });

  it('a cleared field stays cleared, even if a proposal for it comes back', async () => {
    const { user, backend } = await setup({
      script: [
        ...script,
        { blockId: IDS.civil, fieldId: USAGE_NAME, candidates: [{ text: 'Durand', source: userSource('usage_name') }] },
      ],
    });
    // The server never proposes it ...
    const dialog = within(await propose(user));
    await dialog.findByText('2 proposals without conflict');
    expect(dialog.queryByText('Durand')).toBeNull();
    await closePanel(user);

    // ... and a forged proposal for a cleared or hand-typed field is ignored by the client.
    const honest = backend.prefill!;
    backend.prefill = (draft) => {
      const result = honest(draft);
      const forged = (fieldId: string, text: string) => ({
        id: `forged:${fieldId}`,
        field: { block_id: IDS.civil, field_id: fieldId },
        resolution: 'resolved' as const,
        candidates: [
          {
            id: `forged:${fieldId}:c`,
            kind: 'text' as const,
            text,
            origin: { source: 'ingested' as const, resolution: 'resolved' as const },
          },
        ],
      });
      return {
        ...result,
        proposals: [...(result.proposals ?? []), forged(USAGE_NAME, 'Durand'), forged(FIRST_NAME, 'Jeanne-Marie')],
      };
    };
    const reopened = within(await propose(user));
    await reopened.findByText('2 proposals without conflict');
    expect(reopened.queryByText('Durand')).toBeNull();
    expect(reopened.queryByText('Jeanne-Marie')).toBeNull();
    await user.click(reopened.getByRole('button', { name: 'Apply the 2 proposals' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes.map((change) => change.proposal_id)).toEqual([
      proposalId(IDS.civil, BIRTH_NAME),
      proposalId(IDS.civil, BIRTH_DATE),
    ]);
    expect(valuesOf(backend, IDS.civil, USAGE_NAME)[0]).toMatchObject({ kind: 'cleared' });
    expect(valuesOf(backend, IDS.civil, FIRST_NAME)[0]).toMatchObject({ text: 'Jeanne', origin: { source: 'manual' } });
  });
});

describe('the partial period (e)', () => {
  const periodScript: ScriptedProposal[] = [
    {
      blockId: IDS.operations,
      fieldId: PERIOD_START,
      partial: true,
      candidates: [
        {
          text: '03/02/2026',
          origin: 'calculated',
          source: {
            kind: 'decision_snapshot',
            decision_id: 'a7a3f9ac-0a4a-4a4f-9f0e-5d0a8c3b1f11',
            historical_type: 'decision',
            field: 'created_at',
          },
        },
      ],
    },
  ];

  it('is shown as partial, applied as « à revoir », and confirmable', async () => {
    const { user, backend } = await setup({
      script: periodScript,
      diagnostics: [diagnostic('PARTIAL_PERIOD', IDS.operations, PERIOD_START)],
    });
    const dialog = within(await propose(user));

    await dialog.findByText('1 proposal without conflict');
    expect(dialog.getByText('Partial — to review')).toBeTruthy();
    expect(dialog.getByText(/Some selected operations have no usable date/)).toBeTruthy();
    expect(dialog.getAllByText('Calculated').length).toBeGreaterThan(0);

    await user.click(dialog.getByRole('button', { name: 'Apply the proposal' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(valuesOf(backend, IDS.operations, PERIOD_START)[0]).toMatchObject({
      text: '03/02/2026',
      needs_review: true,
      origin: { source: 'calculated' },
    });
    await closePanel(user);

    // On the field: the value, its origin, « à revoir » and the diagnostic.
    expect((screen.getByRole('textbox', { name: 'Date debut' }) as HTMLInputElement).value).toBe('03/02/2026');
    expect(screen.getByText('To review')).toBeTruthy();
    expect(screen.getAllByText(/Some selected operations have no usable date/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(2));
    const valueId = valuesOf(backend, IDS.operations, PERIOD_START)[0]!.id;
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: IDS.operations, field_id: PERIOD_START, value_id: valueId },
        value: { kind: 'text', text: '03/02/2026' },
      },
    ]);
    await waitFor(() => expect(screen.queryByText('To review')).toBeNull());
  });
});

describe('unknown code (f)', () => {
  it('lets the analyst pick the TRACFIN code for this draft: a manual set_field, configuration untouched', async () => {
    const { user, backend } = await setup({
      script: [],
      diagnostics: [diagnostic('UNKNOWN_CODE', IDS.civil, SEX)],
    });
    const configuration = structuredClone(backend.draft.configuration);
    const dialog = within(await propose(user));

    expect(await dialog.findByText(/no match in the TRACFIN code table/)).toBeTruthy();
    await user.click(dialog.getByRole('button', { name: /Choose the code for this draft/ }));
    expect(dialog.getByText(/configuration is not changed/)).toBeTruthy();
    await user.click(dialog.getByRole('button', { name: 'Sex' }));
    await user.click(await screen.findByRole('option', { name: 'SEX2 — F' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      { action: 'set_field', field: { block_id: IDS.civil, field_id: SEX }, value: { kind: 'text', text: 'SEX2' } },
    ]);
    expect(backend.draft.configuration).toEqual(configuration);
    expect(valuesOf(backend, IDS.civil, SEX)[0]).toMatchObject({ text: 'SEX2', origin: { source: 'manual' } });
  });

  it('explains REFERENCE_SELECTION_REQUIRED and opens the picker of the field', async () => {
    const { user } = await setup({
      script: [],
      diagnostics: [diagnostic('REFERENCE_SELECTION_REQUIRED', IDS.civil, `${CIVIL}/idPieceJointe`)],
    });
    const dialog = within(await propose(user));
    expect(await dialog.findByText(/designates a declared object/)).toBeTruthy();
    expect(dialog.getByRole('button', { name: /Choose the declared object/ })).toBeTruthy();
  });
});

describe('saved revision (g)', () => {
  it('saves the pending edits first, then prefills on the revision that results', async () => {
    const { user, backend } = await setup();
    await user.type(screen.getByRole('textbox', { name: 'First name' }), '-Marie');

    await propose(user);
    await waitFor(() => expect(mocks.prefill).toHaveBeenCalledTimes(1));

    expect(backend.bodies).toHaveLength(1);
    expect(backend.bodies[0]!.expected_revision).toBe(3);
    expect(backend.bodies[0]!.changes[0]).toMatchObject({ action: 'set_field' });
    expect(mocks.prefill.mock.calls[0]![0].data.body).toEqual({ expected_revision: 4 });
    expect(mocks.patchDraft.mock.invocationCallOrder[0]!).toBeLessThan(mocks.prefill.mock.invocationCallOrder[0]!);
  });

  it('does nothing and says so when the pending edits cannot be saved', async () => {
    const { user, backend } = await setup();
    // The automatic save on blur and the one of the prefill both fail.
    backend.failures = [
      { kind: 'bad_request', status: 400, message: 'refused' },
      { kind: 'bad_request', status: 400, message: 'refused' },
    ];
    await user.type(screen.getByRole('textbox', { name: 'First name' }), '-Marie');
    const dialog = within(await propose(user));

    expect(await dialog.findByText(/could not be saved/)).toBeTruthy();
    expect(mocks.prefill).not.toHaveBeenCalled();
  });

  it('sends nothing when the draft moved after the proposals were computed', async () => {
    const { user, backend, queryClient } = await setup();
    const dialog = within(await propose(user));
    await dialog.findByText('2 proposals without conflict');

    backend.editElsewhere(() => undefined);
    await queryClient.invalidateQueries({ queryKey: ['tracfin'] });

    expect(await dialog.findByText('To recompute')).toBeTruthy();
    expect((dialog.getByRole('button', { name: 'Apply the 2 proposals' }) as HTMLButtonElement).disabled).toBe(true);
    expect(backend.bodies).toHaveLength(0);
  });

  it('recomputes when the server refuses the choices, and applies nothing', async () => {
    const { user, backend } = await setup();
    const dialog = within(await propose(user));
    await dialog.findByText('2 proposals without conflict');
    // The sources changed under the proposals: the server recomputes and finds the choice unknown.
    backend.prefill = scriptedPrefill([]);

    await user.click(dialog.getByRole('button', { name: 'Apply the 2 proposals' }));

    expect(await dialog.findByText(/The server refused these choices/)).toBeTruthy();
    await waitFor(() => expect(mocks.prefill).toHaveBeenCalledTimes(2));
    expect(valuesOf(backend, IDS.civil, BIRTH_NAME)).toEqual([]);
    // The refusal is not an editor failure: the analyst can keep working and apply again.
    expect(await dialog.findByText('0 proposals without conflict')).toBeTruthy();
  });
});

describe('diagnostics are revision-tagged (h)', () => {
  it('flags the diagnostics « à recalculer » once a later save moved the revision', async () => {
    const { user, backend } = await setup({
      script: [],
      diagnostics: [diagnostic('UNKNOWN_CODE', IDS.civil, SEX)],
    });
    await propose(user);
    await screen.findAllByText(/no match in the TRACFIN code table/);
    await closePanel(user);

    // On the field, fresh: no flag.
    expect(screen.getByText(/no match in the TRACFIN code table/)).toBeTruthy();
    expect(screen.queryByText('To recompute')).toBeNull();

    // A later save (any field) moves the draft past the revision of the result.
    await user.type(screen.getByRole('textbox', { name: 'First name' }), 'x');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(1));

    expect(await screen.findByText('To recompute')).toBeTruthy();
    expect(screen.getByText(/no match in the TRACFIN code table/)).toBeTruthy();

    // Recomputing on the new revision clears the flag.
    const dialog = within(await propose(user));
    await waitFor(() => expect(mocks.prefill).toHaveBeenCalledTimes(2));
    expect(mocks.prefill.mock.calls[1]![0].data.body.expected_revision).toBe(4);
    await dialog.findByText('1 diagnostic');
    await closePanel(user);
    await waitFor(() => expect(screen.queryByText('To recompute')).toBeNull());
  });
});

describe('selection diagnostics on a block that shows the selection panel', () => {
  it('are shown once, by the panel, and flagged « à recalculer » when stale', async () => {
    const { user } = await setup({
      script: [],
      withExtras: true,
      diagnostics: [diagnostic('SELECTION_STALE', IDS.civil, '')],
    });
    await propose(user);
    await screen.findAllByText(/no longer matches the configuration/);
    await closePanel(user);
    // One line on the block (the selection panel), not one more from the generic rendering.
    expect(screen.getAllByText(/no longer matches the configuration/)).toHaveLength(1);
    expect(screen.queryByText('To recompute')).toBeNull();

    await user.type(screen.getByRole('textbox', { name: 'First name' }), 'x');
    await user.tab();
    expect(await screen.findByText('To recompute')).toBeTruthy();
  });
});

describe('no configuration (CONFIGURATION_UNAVAILABLE)', () => {
  it('explains that prefill needs an organization configuration and computes nothing', async () => {
    const draft = prefillDraft();
    draft.configuration.revision = 0;
    draft.diagnostics = [
      {
        code: 'CONFIGURATION_UNAVAILABLE',
        layer: 'sources',
        severity: 'warning',
        message: 'No organization configuration',
      },
    ];
    const { user } = await setup({ draft });
    const dialog = within(await propose(user));

    expect(await dialog.findByText('No TRACFIN configuration for the organization')).toBeTruthy();
    expect(dialog.getByText(/You can still enter every value by hand/)).toBeTruthy();
    expect(dialog.queryByRole('button', { name: /Apply/ })).toBeNull();
    expect(mocks.prefill).not.toHaveBeenCalled();
    // Manual entry stays possible.
    await closePanel(user);
    expect(screen.getByRole('textbox', { name: 'Birth name' })).toBeTruthy();
  });
});
