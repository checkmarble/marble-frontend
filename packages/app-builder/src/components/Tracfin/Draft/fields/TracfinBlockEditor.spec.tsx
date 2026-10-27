import type { TracfinBlock, TracfinDraftInput } from '@app-builder/models/tracfin';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { topLevelAddress } from '../sections/section-addresses';
import { cloneDraft, draftTestCatalog, draftWithout, findByCatalogId } from '../test-utils/draft-test-data';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { connectBackend, renderWithEditor } from '../test-utils/render-page';
import { defaultTracfinFieldRenderers, genericTracfinFieldRenderers, TracfinFieldRenderersContext } from './registry';
import { TracfinBlockEditor } from './TracfinBlockEditor';

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

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
vi.setConfig({ testTimeout: 30_000 });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCatalog.mockResolvedValue({ ok: true, data: draftTestCatalog });
});
afterEach(cleanup);

const editorFor = (catalogId: string) => (draft: Parameters<Parameters<typeof renderWithEditor>[0]>[0]) => (
  <TracfinBlockEditor address={topLevelAddress(draft, catalogId)} catalogId={catalogId} />
);

describe('manual entry of persons through the generic editor (h)', () => {
  it('adds a natural person, a legal entity and a non-customer person with no root selection', async () => {
    // The draft holds no /ds/personnes at all.
    const backend = new FakeDraftBackend(draftWithout('/ds/personnes'));
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/personnes'));

    // Natural person: the first add creates /ds/personnes and the person in one PATCH.
    await user.click(screen.getByRole('button', { name: 'Add: Natural person' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      expect.objectContaining({ action: 'add_block', catalog_id: '/ds/personnes' }),
      expect.objectContaining({ action: 'add_block', catalog_id: '/ds/personnes/pp' }),
    ]);
    expect(backend.lastBody.changes[1]?.parent_block_id).toBe(backend.lastBody.changes[0]?.block_id);

    const person = await screen.findByRole('region', { name: 'Natural person no. 1' });
    // Its civil status is expected by the catalog: it is edited at once, the first value creates it.
    await user.type(within(person).getByLabelText('Birth name'), 'Martin');
    await user.type(within(person).getByLabelText('Date of birth'), '01/02/1980');
    await user.click(within(person).getByLabelText('Birth name'));
    await user.click(screen.getByRole('button', { name: 'Add: Legal entity' }));

    await waitFor(() => expect(backend.bodies.length).toBeGreaterThanOrEqual(3));
    const pp = findByCatalogId(backend.draft.document.root, '/ds/personnes/pp')!;
    const civil = pp.children!.find((child) => child.catalog_id === '/ds/personnes/pp/etatCivil')!;
    expect(civil.fields?.['/ds/personnes/pp/etatCivil/nomNaissance']?.[0]).toMatchObject({
      kind: 'text',
      text: 'Martin',
    });
    expect(civil.fields?.['/ds/personnes/pp/etatCivil/dateNaissance']?.[0]).toMatchObject({ text: '01/02/1980' });

    // Legal entity.
    const entity = await screen.findByRole('region', { name: 'Legal entity no. 1' });
    await user.type(within(entity).getByLabelText('Involvement'), 'Gérant');
    await user.click(screen.getByRole('button', { name: 'Add: Non-customer person' }));

    // Non-customer person.
    const unknown = await screen.findByRole('region', { name: 'Non-customer person no. 1' });
    await user.type(within(unknown).getByLabelText('Identification elements'), 'Homme, 40 ans');
    await user.click(within(entity).getByLabelText('Involvement'));

    await waitFor(() => {
      const personnes = findByCatalogId(backend.draft.document.root, '/ds/personnes')!;
      const kinds = (personnes.children ?? []).map((child) => child.catalog_id);
      expect(kinds).toEqual(['/ds/personnes/pp', '/ds/personnes/pm', '/ds/personnes/pnc']);
      const pm = personnes.children!.find((child) => child.catalog_id === '/ds/personnes/pm')!;
      const pnc = personnes.children!.find((child) => child.catalog_id === '/ds/personnes/pnc')!;
      expect(pm.fields?.['/ds/personnes/pm/implication']?.[0]?.text).toBe('Gérant');
      expect(pnc.fields?.['/ds/personnes/pnc/elementsIdentification']?.[0]?.text).toBe('Homme, 40 ans');
    });
    // Only one /ds/personnes exists.
    expect(backend.draft.document.root.children?.filter((child) => child.catalog_id === '/ds/personnes')).toHaveLength(
      1,
    );
  });

  it('never renders calculated fields', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/personnes'));
    await user.click(screen.getByRole('button', { name: 'Add: Legal entity' }));
    const entity = await screen.findByRole('region', { name: 'Legal entity no. 1' });
    expect(within(entity).getByLabelText('Involvement')).toBeTruthy();
    // `/ds/personnes/pm/id` is calculated by the server.
    expect(within(entity).queryByLabelText('Id')).toBeNull();
  });

  it('removes a block after confirmation', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/personnes'));
    const person = screen.getByRole('region', { name: 'Natural person no. 1' });
    const personId = findByCatalogId(backend.draft.document.root, '/ds/personnes/pp')!.id;

    await user.click(within(person).getAllByRole('button', { name: 'Remove' })[0]!);
    await user.click(await screen.findByRole('button', { name: 'Remove', hidden: false }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([{ action: 'remove_block', block_id: personId }]);
  });
});

describe('field controls', () => {
  it('checks a decimal locally, keeps the text as typed and never sends a malformed one', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/operations'));

    const total = screen.getAllByLabelText('Montant total')[0]!;
    await user.type(total, '12,5');
    expect(screen.getByText(/Enter a decimal number with a dot/)).toBeTruthy();
    await user.tab();
    expect(backend.bodies).toHaveLength(0);
    expect((total as HTMLInputElement).value).toBe('12,5');

    await user.clear(total);
    await user.type(total, '12500.50');
    expect(screen.queryByText(/Enter a decimal number with a dot/)).toBeNull();
    await user.tab();

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toHaveLength(2);
    expect(backend.lastBody.changes.at(-1)?.value).toEqual({ kind: 'decimal', decimal: '12500.50' });
    expect(typeof backend.lastBody.changes.at(-1)?.value?.decimal).toBe('string');
  });

  it('keeps a malformed decimal pending-visible even though it is not sent', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/operations'));
    const total = screen.getAllByLabelText('Montant total')[0]!;
    await user.type(total, 'abc');
    await user.tab();
    expect((total as HTMLInputElement).value).toBe('abc');
    expect(backend.bodies).toHaveLength(0);
  });

  it('shows a tri-state boolean and clears it on purpose', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/context'));

    const group = screen.getByRole('radiogroup', { name: 'Clarifies an earlier report' });
    const saved = findByCatalogId(backend.draft.document.root, '/ds/context/general')!.fields![
      '/ds/context/general/estPrecisionSignalement'
    ]![0]!;
    expect(saved.kind).toBe('boolean');
    await user.click(within(group).getByRole('radio', { name: 'Yes' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      field: { field_id: '/ds/context/general/estPrecisionSignalement', value_id: saved.id },
      value: { kind: 'boolean', boolean: true },
    });

    await user.click(within(group).getByRole('radio', { name: 'Not filled in' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(2));
    expect(backend.lastBody.changes).toEqual([
      expect.objectContaining({
        action: 'clear_field',
        field: expect.objectContaining({ field_id: '/ds/context/general/estPrecisionSignalement', value_id: saved.id }),
      }),
    ]);
    expect(within(group).getByRole('radio', { name: 'Not filled in' }).getAttribute('aria-checked')).toBe('true');
  });

  it('adds occurrences of a multi-valued field up to the catalog maximum', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/context'));

    // cadreLegal is 1..5 and holds one value: four more can be added.
    const add = () => screen.getByRole('button', { name: 'Add: Legal framework of the suspicion' });
    expect(screen.getByText('1 / 5')).toBeTruthy();
    for (let index = 0; index < 4; index++) await user.click(add());
    expect(screen.getByText('5 / 5')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add: Legal framework of the suspicion' })).toBeNull();

    // An empty slot is not an edit.
    expect(screen.queryByText(/Unsaved changes/)).toBeNull();
    expect(backend.bodies).toHaveLength(0);

    const inputs = screen.getAllByRole('button', { name: 'Legal framework of the suspicion' });
    await user.click(inputs[1]!);
    await user.click(await screen.findByRole('option', { name: 'CL01 — Soupçon de blanchiment' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    // A new occurrence: no value_id.
    expect(backend.lastBody.changes).toEqual([
      expect.objectContaining({
        action: 'set_field',
        field: expect.not.objectContaining({ value_id: expect.anything() }),
        value: { kind: 'text', text: 'CL01' },
      }),
    ]);
  });

  it('shows free text with a note when a referenced code list is not available', async () => {
    const draft = cloneDraft();
    const root = draft.document.root;
    root.children!.push({
      id: 'pj',
      catalog_id: '/ds/pieceJointe',
      children: [{ id: 'piece-1', catalog_id: '/ds/pieceJointe/piece' }],
    } as TracfinBlock);
    const backend = new FakeDraftBackend(draft);
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/pieceJointe'));

    const mime = screen.getByLabelText('Type mime') as HTMLInputElement;
    expect(mime.tagName).toBe('INPUT');
    expect(screen.getAllByText(/code list is not available/).length).toBeGreaterThan(0);
    await user.type(mime, 'application/pdf');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes[0]?.value).toEqual({ kind: 'text', text: 'application/pdf' });
  });

  it('counts the characters of a long text against the catalog maximum', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor((draft) => (
      <TracfinBlockEditor
        address={{ kind: 'block', id: draft.document.root.id }}
        catalogId="/ds"
        include={(id) => id === '/ds/analyse'}
      />
    ));
    const analysis = screen.getByLabelText('Analysis') as HTMLTextAreaElement;
    expect(analysis.tagName).toBe('TEXTAREA');
    expect(screen.getByText(/\/ 23000 characters/)).toBeTruthy();
    await user.type(analysis, '!');
    expect(screen.getByText(`${analysis.value.length} / 23000 characters`)).toBeTruthy();
  });

  it('says that the data of the other alternative of a choice is kept but not exported', async () => {
    const draft = cloneDraft();
    const personnes = findByCatalogId(draft.document.root, '/ds/personnes')!;
    personnes.children!.push({
      id: 'pm-1',
      catalog_id: '/ds/personnes/pm',
      children: [
        {
          id: 'dir-1',
          catalog_id: '/ds/personnes/pm/dirigeant',
          active_branches: { '/ds/personnes/pm/dirigeant#identity': '/ds/personnes/pm/dirigeant/autreDirigeantP' },
          children: [{ id: 'dir-p', catalog_id: '/ds/personnes/pm/dirigeant/autreDirigeantP' }],
        },
      ],
    } as TracfinBlock);
    const backend = new FakeDraftBackend(draft);
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/personnes'));

    const group = screen.getByRole('radiogroup', { name: 'Only one alternative is exported' });
    const exported = within(group).getByRole('radio', { name: /^Executive \(natural person\)/ });
    expect(exported.getAttribute('aria-checked')).toBe('true');
    expect(within(group).getByText('(exported)')).toBeTruthy();

    await user.click(within(group).getByRole('radio', { name: /^Executive \(legal entity\)/ }));
    expect(screen.getByText(/data of the other alternative is kept, but it will not be exported/)).toBeTruthy();
    expect(screen.getByText(/exported as soon as a value is entered in it/)).toBeTruthy();
  });
});

describe('origin, references and the renderer registry', () => {
  function withPmDirector() {
    const draft = cloneDraft();
    const personnes = findByCatalogId(draft.document.root, '/ds/personnes')!;
    personnes.children!.push({
      id: 'pm-1',
      catalog_id: '/ds/personnes/pm',
      children: [
        {
          id: 'dir-1',
          catalog_id: '/ds/personnes/pm/dirigeant',
          active_branches: { '/ds/personnes/pm/dirigeant#identity': '/ds/personnes/pm/dirigeant/idPersonne' },
          fields: {
            '/ds/personnes/pm/dirigeant/idPersonne': [
              { id: 'ref-1', kind: 'reference', reference: { block_id: personnes.children![0]!.id } },
            ],
          },
        },
      ],
    } as TracfinBlock);
    return draft;
  }

  it('lists the sources of a value in the tooltip of its origin badge', async () => {
    const draft = cloneDraft();
    const value = findByCatalogId(draft.document.root, '/ds/organisme')!.fields!['/ds/organisme/libelle']![0]!;
    value.origin = {
      source: 'ingested',
      resolution: 'resolved',
      sources: [
        { kind: 'ingested', table: 'companies', record_id: 'company_302', field: 'name', decision_id: 'dec-9' },
      ],
    };
    const backend = new FakeDraftBackend(draft);
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/organisme'));

    await user.hover(screen.getByText('Customer data'));
    const tooltip = await screen.findByRole('tooltip');
    for (const expected of ['companies', 'company_302', 'name', 'dec-9'])
      expect(tooltip.textContent).toContain(expected);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
  });

  it('shows the current reference and where it is defined, with the generic renderer', async () => {
    const backend = new FakeDraftBackend(withPmDirector());
    connectBackend(mocks, backend);
    await renderWithEditor((draft) => (
      <TracfinFieldRenderersContext.Provider value={genericTracfinFieldRenderers}>
        <TracfinBlockEditor address={topLevelAddress(draft, '/ds/personnes')} catalogId="/ds/personnes" />
      </TracfinFieldRenderersContext.Provider>
    ));

    expect(screen.getByText(/Defined in the « Persons » section/)).toBeTruthy();
    expect(screen.getByText(/Natural person · /)).toBeTruthy();
  });

  it('lets a section plug its own renderer for a field id', async () => {
    const backend = new FakeDraftBackend(withPmDirector());
    connectBackend(mocks, backend);
    const Picker = vi.fn(() => <div>custom person picker</div>);
    await renderWithEditor((draft) => (
      <TracfinFieldRenderersContext.Provider
        value={{
          ...defaultTracfinFieldRenderers,
          byField: { '/ds/personnes/pm/dirigeant/idPersonne': Picker },
        }}
      >
        <TracfinBlockEditor address={topLevelAddress(draft, '/ds/personnes')} catalogId="/ds/personnes" />
      </TracfinFieldRenderersContext.Provider>
    ));

    expect(screen.getByText('custom person picker')).toBeTruthy();
    expect(screen.queryByText(/Defined in the/)).toBeNull();
    const props = (Picker.mock.calls[0] as unknown as [Record<string, unknown>])[0];
    expect(props).toMatchObject({ field: { id: '/ds/personnes/pm/dirigeant/idPersonne' }, disabled: false });
    expect(typeof props['onSet']).toBe('function');
  });

  it('offers to fill in an optional block that does not exist yet', async () => {
    const backend = new FakeDraftBackend(cloneDraft());
    connectBackend(mocks, backend);
    const { user } = await renderWithEditor(editorFor('/ds/personnes'));
    const person = screen.getByRole('region', { name: 'Natural person no. 1' });
    const fill = within(person).getByRole('button', { name: 'Fill in: Financial references' });
    await user.click(fill);
    expect(within(person).queryByRole('button', { name: 'Fill in: Financial references' })).toBeNull();
    // Opening a block creates nothing on the server.
    expect(backend.bodies).toHaveLength(0);
  });
});

// Keeps the draft body type in this file's imports meaningful.
export type { TracfinDraftInput };
