import { FormatContext } from '@app-builder/contexts/FormatContext';
import type { DetailedCaseDecision } from '@app-builder/models/cases';
import type { TracfinBlock, TracfinDiagnostic, TracfinDraft } from '@app-builder/models/tracfin';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TracfinBlockDiagnosticsContext } from '../fields/block-diagnostics';
import { OperationsSection } from '../sections/OperationsSection';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { DECISION, decision, line, operationsDraft, operationsTestIndex } from '../test-utils/operations-test-data';
import { connectPersons, type PersonsMocks } from '../test-utils/persons-harness';
import { reference, text } from '../test-utils/persons-test-data';
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
  listDecisions: vi.fn(),
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
vi.mock('@app-builder/server-fns/cases', () => ({ listCaseDecisionsFn: mocks.listDecisions }));
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

const TRANSFER_T77 = decision(DECISION.one, 'Transfer', 'T-77');
const TRANSFER_T9 = decision(DECISION.two, 'Transfer', 'T-9', { createdAt: '2026-03-05T08:00:00.000Z' });
const DELETED = decision(DECISION.three, 'DeletedType', 'D-1');
const UNMAPPED = decision(DECISION.four, 'Unmapped', 'U-1');

/** The listing as the case endpoint serves it: pages chained by cursor. */
function serveDecisions(pages: DetailedCaseDecision[][]) {
  mocks.listDecisions.mockImplementation(async ({ data }: { data: { cursorId?: string } }) => {
    const index = data.cursorId ? Number(data.cursorId.replace('cursor-', '')) : 0;
    return {
      decisions: pages[index] ?? [],
      pagination: {
        hasMore: index < pages.length - 1,
        cursorId: index < pages.length - 1 ? `cursor-${index + 1}` : null,
      },
    };
  });
}

async function renderSection(draft: TracfinDraft, pages: DetailedCaseDecision[][] = [[]]) {
  const backend = new FakeDraftBackend(draft);
  connectPersons(mocks as unknown as PersonsMocks, backend);
  serveDecisions(pages);
  const rendered = await renderWithEditor(
    () => (
      <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
        <OperationsSection />
      </FormatContext.Provider>
    ),
    { catalogIndex: operationsTestIndex },
  );
  return { ...rendered, backend };
}

const storedValueOf = (backend: FakeDraftBackend, blockId: string, fieldId: string) => {
  const find = (block: TracfinBlock): TracfinBlock | null =>
    block.id === blockId ? block : ((block.children ?? []).map(find).find(Boolean) ?? null);
  return find(backend.draft.document.root)?.fields?.[fieldId]?.[0];
};

const addFromDecisions = () => screen.getByRole('button', { name: 'Add from decisions' });
const selectBox = (objectId: string, type: string) =>
  screen.findByRole('checkbox', { name: `Select the decision on object ${objectId} (${type})` });
const confirm = (count: number) => screen.getByRole('button', { name: `Add the lines (${count})` });

describe('decision picker', () => {
  it('selects a decision whose historical type is not in the data model and sends its set_selection verbatim', async () => {
    const { user, backend } = await renderSection(operationsDraft(), [[DELETED]]);
    expect(mocks.getDataModel).not.toHaveBeenCalled();

    await user.click(addFromDecisions());
    await user.click(await selectBox('D-1', 'DeletedType'));
    await user.click(confirm(1));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    const changes = backend.lastBody.changes;
    // `/ds/operations` does not exist yet: created in the same PATCH, then the line, then its selection.
    expect(changes.map((change) => change.action)).toEqual(['add_block', 'add_block', 'set_selection']);
    expect(changes[0]).toMatchObject({ parent_block_id: backend.draft.document.root.id, catalog_id: '/ds/operations' });
    expect(changes[1]).toMatchObject({ parent_block_id: changes[0]!.block_id, catalog_id: '/ds/operations/operation' });
    expect(changes[2]).toEqual({
      action: 'set_selection',
      block_id: changes[1]!.block_id,
      selection: {
        mapping_id: 'map-deleted-amount',
        root: { id: 'root', table: 'DeletedType' },
        decision_id: DECISION.three,
        historical_type: 'DeletedType',
      },
    });
    const created = backend.draft.document.root.children!.find((child) => child.catalog_id === '/ds/operations')!;
    expect(created.children).toHaveLength(1);
    expect(created.children![0]!.selection?.decision_id).toBe(DECISION.three);
    expect(await screen.findByRole('region', { name: 'Principal operation no. 1' })).toBeTruthy();
  });

  it('adds one line per decision in a single PATCH, each with its own selection', async () => {
    const { user, backend } = await renderSection(operationsDraft({ lines: [] }), [[TRANSFER_T77, TRANSFER_T9]]);
    await user.click(addFromDecisions());
    await user.click(await selectBox('T-77', 'Transfer'));
    await user.click(await selectBox('T-9', 'Transfer'));
    await user.click(confirm(2));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes.map((change) => change.action)).toEqual([
      'add_block',
      'set_selection',
      'add_block',
      'set_selection',
    ]);
    const lines = backend.draft.document.root.children!.find((child) => child.catalog_id === '/ds/operations')!
      .children!;
    expect(lines.map((entry) => entry.selection?.decision_id)).toEqual([DECISION.one, DECISION.two]);
    expect(lines.map((entry) => entry.selection?.mapping_id)).toEqual(['map-transfer-amount', 'map-transfer-amount']);
  });

  it('adds a decision whose type has no snapshot mapping as a line without selection, and says so', async () => {
    const { user, backend } = await renderSection(operationsDraft({ lines: [] }), [[UNMAPPED]]);
    await user.click(addFromDecisions());
    expect(await screen.findByText('Historical type without mapping')).toBeTruthy();
    expect(screen.getByText(/No snapshot mapping is configured for the type "Unmapped"/)).toBeTruthy();
    await user.click(await selectBox('U-1', 'Unmapped'));
    await user.click(confirm(1));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes.map((change) => change.action)).toEqual(['add_block']);
    expect(
      await screen.findByText(/no snapshot mapping is configured for the historical type "Unmapped"/),
    ).toBeTruthy();
    const card = screen.getByRole('region', { name: 'Principal operation no. 1' });
    expect(within(card).getByText('No linked decision')).toBeTruthy();
  });

  it('refuses the 31st line with a message and sends nothing', async () => {
    const lines = Array.from({ length: 30 }, (_, index) =>
      line(`line-${index}`, `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`),
    );
    const { user, backend } = await renderSection(operationsDraft({ lines }), [[TRANSFER_T77]]);
    expect(screen.getByText(/Maximum of 30 principal operations reached/)).toBeTruthy();

    await user.click(addFromDecisions());
    expect(await screen.findByText('Existing lines: 30 / 30 · places left: 0')).toBeTruthy();
    await user.click(await selectBox('T-77', 'Transfer'));

    expect(screen.getByRole('alert').textContent).toContain('Maximum of 30 principal operations');
    expect((await selectBox('T-77', 'Transfer')).getAttribute('aria-checked')).toBe('false');
    expect(confirm(0).hasAttribute('disabled')).toBe(true);
    expect(backend.bodies).toHaveLength(0);
  });

  it('lets the analyst tick only the places that are left, and never truncates a draft above the maximum', async () => {
    const twentyNine = Array.from({ length: 29 }, (_, index) =>
      line(`line-${index}`, `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`),
    );
    const first = await renderSection(operationsDraft({ lines: twentyNine }), [[TRANSFER_T77, TRANSFER_T9]]);
    await first.user.click(addFromDecisions());
    await first.user.click(await selectBox('T-77', 'Transfer'));
    await first.user.click(await selectBox('T-9', 'Transfer'));
    expect(screen.getByRole('alert').textContent).toContain('no more can be selected');
    await first.user.click(confirm(1));
    await waitFor(() => expect(first.backend.bodies).toHaveLength(1));
    expect(first.backend.lastBody.changes.filter((change) => change.action === 'add_block')).toHaveLength(1);
    cleanup();

    const thirtyTwo = Array.from({ length: 32 }, (_, index) =>
      line(`over-${index}`, `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`),
    );
    await renderSection(operationsDraft({ lines: thirtyTwo }), [[TRANSFER_T77]]);
    expect(screen.getAllByRole('region', { name: /^Principal operation no\. / })).toHaveLength(32);
    expect(screen.getByText(/already holds 32 lines, above the maximum of 30/)).toBeTruthy();
  });

  it('does not let the same decision be selected twice', async () => {
    const { user, backend } = await renderSection(operationsDraft({ lines: [line('line-1', DECISION.one)] }), [
      [TRANSFER_T77, TRANSFER_T9],
    ]);
    await user.click(addFromDecisions());
    const taken = await selectBox('T-77', 'Transfer');
    expect(taken.hasAttribute('disabled')).toBe(true);
    expect(taken.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByText('Already selected')).toBeTruthy();
    await user.click(taken);
    expect(confirm(0).hasAttribute('disabled')).toBe(true);

    await user.click(await selectBox('T-9', 'Transfer'));
    await user.click(confirm(1));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(
      backend.lastBody.changes
        .filter((change) => change.action === 'set_selection')
        .map((c) => c.selection?.decision_id),
    ).toEqual([DECISION.two]);
  });

  it('loads the listing page by page and never presents a partial list as complete', async () => {
    const { user } = await renderSection(operationsDraft(), [[TRANSFER_T77], [TRANSFER_T9], [DELETED]]);
    await user.click(addFromDecisions());
    expect(await screen.findByText('Partial list: 1 decisions loaded, more exist.')).toBeTruthy();
    expect(screen.queryByText(/End of the list/)).toBeNull();
    expect(mocks.listDecisions).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('Partial list: 2 decisions loaded, more exist.')).toBeTruthy();
    expect(mocks.listDecisions).toHaveBeenLastCalledWith({
      data: { caseId: expect.any(String), cursorId: 'cursor-1' },
    });
    expect(await selectBox('T-9', 'Transfer')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('End of the list: 3 decisions loaded.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();
    expect(mocks.listDecisions).toHaveBeenLastCalledWith({
      data: { caseId: expect.any(String), cursorId: 'cursor-2' },
    });
  });

  it('shows what identifies a decision and states that listed amounts are indicative', async () => {
    const { user } = await renderSection(operationsDraft(), [[TRANSFER_T77]]);
    await user.click(addFromDecisions());
    const row = (await selectBox('T-77', 'Transfer')).closest('li')!;
    expect(within(row).getByText('Fraude virements · v3')).toBeTruthy();
    expect(within(row).getByText('Transfer')).toBeTruthy();
    expect(within(row).getByText('T-77')).toBeTruthy();
    expect(within(row).getByText('label')).toBeTruthy();
    expect(screen.getByText(/Any amounts shown are indicative: they are not used in any calculation/)).toBeTruthy();
  });
});

describe('operation lines', () => {
  const duplicate = (blockId: string): TracfinDiagnostic => ({
    code: 'POTENTIAL_DUPLICATE_OPERATION',
    layer: 'sources',
    severity: 'warning',
    message: 'Several selected decisions record the same historical object; they are not merged or summed',
    field: { block_id: blockId, field_id: '' },
    sources: [
      { kind: 'decision_snapshot', decision_id: DECISION.one, historical_type: 'Transfer', field: 'object_id' },
      { kind: 'decision_snapshot', decision_id: DECISION.two, historical_type: 'Transfer', field: 'object_id' },
    ],
  });
  const twoLines = () => [
    line('line-1', DECISION.one, 'Transfer', {
      '/ds/operations/operation/montantTotal': [{ id: 'a', kind: 'decimal', decimal: '100.50' }],
    }),
    line('line-2', DECISION.two, 'Transfer', {
      '/ds/operations/operation/montantTotal': [{ id: 'b', kind: 'decimal', decimal: '200.25' }],
    }),
  ];

  it('shows the duplicate warning on both lines, keeps them separate and never adds their amounts', async () => {
    await renderSection(
      operationsDraft({ lines: twoLines(), diagnostics: [duplicate('line-1'), duplicate('line-2')] }),
      [[TRANSFER_T77, TRANSFER_T9]],
    );
    const first = await screen.findByRole('region', { name: 'Principal operation no. 1' });
    const second = screen.getByRole('region', { name: 'Principal operation no. 2' });
    for (const [card, peer] of [
      [first, '2'],
      [second, '1'],
    ] as const) {
      expect(card.querySelector('[data-diagnostic-code="POTENTIAL_DUPLICATE_OPERATION"]')).not.toBeNull();
      expect(within(card).getByText('Potential duplicate')).toBeTruthy();
      expect(
        within(card).getByText(
          `Same historical object as operation no. ${peer}. Separate lines, amounts never added up.`,
        ),
      ).toBeTruthy();
    }
    expect(within(first).getByDisplayValue('100.50')).toBeTruthy();
    expect(within(second).getByDisplayValue('200.25')).toBeTruthy();
    expect(screen.queryByText(/300[.,]75/)).toBeNull();
    expect(screen.queryByDisplayValue(/300[.,]75/)).toBeNull();
  });

  it('flags a duplicate from the prefill store as to recompute once it is stale', async () => {
    const { container } = await (async () => {
      const draft = operationsDraft({ lines: twoLines() });
      const backend = new FakeDraftBackend(draft);
      connectPersons(mocks as unknown as PersonsMocks, backend);
      serveDecisions([[TRANSFER_T77, TRANSFER_T9]]);
      return renderWithEditor(
        () => (
          <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
            <TracfinBlockDiagnosticsContext.Provider value={[{ ...duplicate('line-1'), stale: true }]}>
              <OperationsSection />
            </TracfinBlockDiagnosticsContext.Provider>
          </FormatContext.Provider>
        ),
        { catalogIndex: operationsTestIndex },
      ).then(() => ({ container: document.body }));
    })();
    const first = await screen.findByRole('region', { name: 'Principal operation no. 1' });
    expect(within(first).getByText('Potential duplicate')).toBeTruthy();
    expect(within(first).getByText('To recompute')).toBeTruthy();
    expect(container.querySelectorAll('[data-diagnostic-code="POTENTIAL_DUPLICATE_OPERATION"]')).toHaveLength(1);
  });

  it('references the decision of a line from the loaded listing, and removes a line after confirmation', async () => {
    const { user, backend } = await renderSection(operationsDraft({ lines: [line('line-1', DECISION.one)] }), [
      [TRANSFER_T77],
    ]);
    const card = await screen.findByRole('region', { name: 'Principal operation no. 1' });
    expect(await within(card).findByText('Fraude virements · v3')).toBeTruthy();
    expect(within(card).getByText('T-77')).toBeTruthy();

    await user.click(within(card).getByRole('button', { name: 'Remove Principal operation no. 1' }));
    await user.click(await screen.findByRole('button', { name: 'Remove', hidden: false }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([{ action: 'remove_block', block_id: 'line-1' }]);
  });
});

describe('text or reference fields', () => {
  const ISSUER = '/ds/operations/operation/emetteurTypeEmetteur';
  const ISSUER_REF = '/ds/operations/operation/refFinanciereEmission';
  const BENEFICIARY = '/ds/operations/operation/beneficiaireTypeBeneficiaire';
  const group = (name: string) => screen.getByRole('radiogroup', { name: `Representation of "${name}"` });
  const mode = (name: string, option: string) => within(group(name)).getByRole('radio', { name: option });

  it('sends free numeric text as text, never as a reference', async () => {
    const { user, backend } = await renderSection(operationsDraft({ lines: [line('op-1')] }));
    expect(mode('Issuer', 'Free text').getAttribute('aria-checked')).toBe('true');

    await user.type(screen.getByRole('textbox', { name: 'Issuer (free text)' }), '00123456');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toHaveLength(1);
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      field: { block_id: 'op-1', field_id: ISSUER },
      value: { kind: 'text', text: '00123456' },
    });
    // The leading zeros survive: it is a string, not a number and not a person.
    expect(backend.lastBody.changes[0]!.value).toEqual({ kind: 'text', text: '00123456' });
  });

  it('switching to a person sends nothing; the reference replaces the stored text when it is picked', async () => {
    const { user, backend } = await renderSection(
      operationsDraft({ lines: [line('op-1', undefined, 'Transfer', { [ISSUER]: [text('em-1', '99')] })] }),
    );
    await user.click(mode('Issuer', 'Declared person'));
    expect(mode('Issuer', 'Declared person').getAttribute('aria-checked')).toBe('true');
    // The radio is a view change: the stored text is neither cleared nor saved.
    expect(backend.bodies).toHaveLength(0);
    expect(screen.getByText('The saved value is kept until you enter a new one.')).toBeTruthy();

    await user.click(await screen.findByRole('button', { name: 'Issuer' }));
    const option = (await screen.findAllByRole('option')).find((entry) =>
      entry.textContent?.includes('Jeanne Martin'),
    )!;
    await user.click(option);
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: 'op-1', field_id: ISSUER, value_id: 'em-1' },
        value: { kind: 'reference', reference: { block_id: 'pp-1' } },
      },
    ]);
    // The same occurrence now holds the reference, not the text.
    expect(storedValueOf(backend, 'op-1', ISSUER)).toMatchObject({ id: 'em-1', kind: 'reference' });
  });

  it('switching to free text keeps the stored reference until text is typed, and keeps free text a text', async () => {
    const { user, backend } = await renderSection(
      operationsDraft({ lines: [line('op-1', undefined, 'Transfer', { [BENEFICIARY]: [reference('b-1', 'pp-1')] })] }),
    );
    expect(mode('Beneficiary', 'Declared person').getAttribute('aria-checked')).toBe('true');
    await user.click(mode('Beneficiary', 'Free text'));
    expect(mode('Beneficiary', 'Free text').getAttribute('aria-checked')).toBe('true');
    expect(backend.bodies).toHaveLength(0);

    await user.type(await screen.findByRole('textbox', { name: 'Beneficiary (free text)' }), '12345');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toHaveLength(1);
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      field: { block_id: 'op-1', field_id: BENEFICIARY, value_id: 'b-1' },
      value: { kind: 'text', text: '12345' },
    });
    expect(storedValueOf(backend, 'op-1', BENEFICIARY)).toMatchObject({ id: 'b-1', kind: 'text', text: '12345' });
  });

  it('a stored reference keeps reference mode when its picker is emptied', async () => {
    const { user, backend } = await renderSection(
      operationsDraft({ lines: [line('op-1', undefined, 'Transfer', { [BENEFICIARY]: [reference('b-1', 'pp-1')] })] }),
    );
    expect(mode('Beneficiary', 'Declared person').getAttribute('aria-checked')).toBe('true');
    // Emptying the choice must not flip the radio to free text.
    await user.click(screen.getByRole('button', { name: 'Clear Beneficiary' }));
    expect(mode('Beneficiary', 'Declared person').getAttribute('aria-checked')).toBe('true');
    expect(mode('Beneficiary', 'Free text').getAttribute('aria-checked')).toBe('false');
    expect(backend.bodies.flatMap((body) => body.changes).every((change) => change.action !== 'set_field')).toBe(true);
  });

  it('sends a support reference with the person it belongs to', async () => {
    const { user, backend } = await renderSection(
      operationsDraft({ lines: [line('op-1', undefined, 'Transfer', { [ISSUER]: [reference('em-1', 'pp-1')] })] }),
    );
    await user.click(mode('Financial reference of the issuance', 'Declared support'));
    // Nothing was stored in that field: switching mode sends nothing.
    expect(backend.bodies).toHaveLength(0);

    await user.click(await screen.findByRole('button', { name: 'Financial reference of the issuance' }));
    const options = await screen.findAllByRole('option');
    expect(options.map((entry) => entry.textContent)).toEqual(['IBAN · FR76-PP']);
    await user.click(options[0]!);
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: 'op-1', field_id: ISSUER_REF },
        value: { kind: 'reference', reference: { block_id: 'iban-1', person_block_id: 'pp-1' } },
      },
    ]);
  });
});

describe('global amount and period', () => {
  const GLOBAL = 'Global suspicion amount — entered, never computed';

  it('saves the global amount on its own as an exact decimal string and shows no total', async () => {
    const lines = [
      line('line-1', DECISION.one, 'Transfer', {
        '/ds/operations/operation/montantTotal': [{ id: 'a', kind: 'decimal', decimal: '100.50' }],
      }),
      line('line-2', DECISION.two, 'Transfer', {
        '/ds/operations/operation/montantTotal': [{ id: 'b', kind: 'decimal', decimal: '200.25' }],
      }),
    ];
    const { user, backend } = await renderSection(operationsDraft({ lines }), [[TRANSFER_T77, TRANSFER_T9]]);
    expect(screen.getByText('Global suspicion amount')).toBeTruthy();

    await user.type(screen.getByRole('textbox', { name: GLOBAL }), '12345.67');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: 'operations-1', field_id: '/ds/operations/montantTotal' },
        value: { kind: 'decimal', decimal: '12345.67' },
      },
    ]);
    // The lines were not touched, and nothing on screen is their sum.
    expect(screen.queryByText(/300[.,]75/)).toBeNull();
    expect(screen.queryByDisplayValue(/300[.,]75/)).toBeNull();
    expect(screen.getByDisplayValue('100.50')).toBeTruthy();
    expect(screen.getByDisplayValue('200.25')).toBeTruthy();
    expect(screen.getByDisplayValue('12345.67')).toBeTruthy();
  });

  it('keeps a proposed partial period to review until it is confirmed', async () => {
    const draft = operationsDraft({
      lines: [line('line-1', DECISION.one)],
      fields: {
        '/ds/operations/dateDebut': [
          {
            id: 'v-debut',
            kind: 'text',
            text: '01/03/2026',
            needs_review: true,
            origin: { source: 'calculated', resolution: 'needs_review' },
          },
        ],
      },
      diagnostics: [
        {
          code: 'PARTIAL_PERIOD',
          layer: 'sources',
          severity: 'warning',
          message: '1 of 2 selected principal operations have no usable date',
          field: { block_id: 'operations-1', field_id: '/ds/operations/dateDebut' },
        },
      ],
    });
    const { user, backend } = await renderSection(draft);
    const period = await screen.findByRole('region', { name: 'Period and nature of the suspicion' });
    expect(within(period).getByText('To review')).toBeTruthy();
    expect(within(period).getByText(/Some selected operations have no usable date/)).toBeTruthy();

    await user.click(within(period).getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: 'operations-1', field_id: '/ds/operations/dateDebut', value_id: 'v-debut' },
        value: { kind: 'text', text: '01/03/2026' },
      },
    ]);
  });
});

describe('operations in progress', () => {
  it('adds a manual operation under /ds/operations', async () => {
    const { user, backend } = await renderSection(operationsDraft({ lines: [] }));
    await user.click(screen.getByRole('button', { name: 'Add: Operation in progress' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'add_block',
        parent_block_id: 'operations-1',
        catalog_id: '/ds/operations/operationEnCours',
        block_id: expect.any(String),
      },
    ]);
  });

  it('picks the issuer among the declared persons and a support of that person', async () => {
    const ongoing = [
      {
        id: 'ongoing-1',
        catalog_id: '/ds/operations/operationEnCours',
        fields: { '/ds/operations/operationEnCours/identEmetteur': [reference('ie', 'pp-1')] },
      },
    ];
    const { user, backend } = await renderSection(operationsDraft({ lines: [], ongoing }));
    await user.click(await screen.findByRole('button', { name: 'Financial reference (support of the issuer)' }));
    const options = await screen.findAllByRole('option');
    expect(options.map((entry) => entry.textContent)).toEqual(['IBAN · FR76-PP']);
    await user.click(options[0]!);
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      field: { block_id: 'ongoing-1', field_id: '/ds/operations/operationEnCours/refFinanciere' },
      value: { kind: 'reference', reference: { block_id: 'iban-1', person_block_id: 'pp-1' } },
    });
  });
});
