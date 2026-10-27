import type { TracfinBlock, TracfinContextRoot, TracfinDraft } from '@app-builder/models/tracfin';
import { tracfinDataModelFixture } from '@app-builder/models/tracfin/__fixtures__';
import { cleanup, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PersonsSection } from '../sections/PersonsSection';
import { draftWithout, findByCatalogId } from '../test-utils/draft-test-data';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { connectPersons, type PersonsMocks } from '../test-utils/persons-harness';
import { block, personsDraft, personsTestIndex, reference, text } from '../test-utils/persons-test-data';
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

const connect = (backend: FakeDraftBackend, roots: TracfinContextRoot[] = [], records = {}) =>
  connectPersons(mocks as unknown as PersonsMocks, backend, { roots, records });

const renderSection = () => renderWithEditor(() => <PersonsSection />, { catalogIndex: personsTestIndex });

const link = (id: string, targetId: string) =>
  block(
    '/ds/personnes/pnc/lienAutrePersonneDejaDeclaree',
    {
      fields: { '/ds/personnes/pnc/lienAutrePersonneDejaDeclaree/idPersonne': [reference(`${id}-ref`, targetId)] },
      children: [
        block('/ds/personnes/pnc/lienAutrePersonneDejaDeclaree/typeRelation', {
          fields: {
            '/ds/personnes/pnc/lienAutrePersonneDejaDeclaree/typeRelation/categorieRelation': [
              text(`${id}-cat`, 'TLP54'),
            ],
          },
        }),
      ],
    },
    id,
  );

/** pp-1 (Jeanne Martin), a legal entity run by pp-1, and a non-customer person linked to pp-1. */
function withSeveralRoles(): TracfinDraft {
  return personsDraft((_, persons) => {
    persons.children!.push(
      block(
        '/ds/personnes/pm',
        {
          children: [
            block('/ds/personnes/pm/activiteCoordonnee', {
              fields: { '/ds/personnes/pm/activiteCoordonnee/denominationSociale': [text('pm-name', 'ACME SAS')] },
            }),
            block('/ds/personnes/pm/dirigeant', {
              active_branches: { '/ds/personnes/pm/dirigeant#identity': '/ds/personnes/pm/dirigeant/idPersonne' },
              fields: { '/ds/personnes/pm/dirigeant/idPersonne': [reference('dir-ref', 'pp-1')] },
            }),
          ],
        },
        'pm-1',
      ),
      block(
        '/ds/personnes/pnc',
        {
          fields: { '/ds/personnes/pnc/implication': [text('pnc-impl', 'Témoin')] },
          children: [link('link-1', 'pp-1')],
        },
        'pnc-1',
      ),
    );
  });
}

const person = (name: string) => screen.getByRole('region', { name });

describe('a person with several roles appears once (e)', () => {
  it('shows the natural person once, with its two roles computed from the document', async () => {
    connect(new FakeDraftBackend(withSeveralRoles()));
    await renderSection();

    expect(await screen.findAllByRole('region', { name: 'Jeanne Martin' })).toHaveLength(1);
    const roles = within(person('Jeanne Martin')).getByRole('list', { name: 'Roles in the declaration' });
    const labels = within(roles)
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(labels).toEqual(['Executive of ACME SAS', 'Link declared by Témoin']);
    // The other two people are cards of their own, with no role of their own.
    expect(person('ACME SAS')).toBeTruthy();
    expect(person('Témoin')).toBeTruthy();
    expect(screen.getAllByText('Jeanne Martin')).toHaveLength(1);
  });

  it('names the person by its computed name in the pickers that reference it, never a duplicate', async () => {
    const backend = new FakeDraftBackend(withSeveralRoles());
    connect(backend);
    const { user } = await renderSection();
    await user.click(within(person('ACME SAS')).getByRole('button', { name: 'Open' }));
    const entity = person('ACME SAS');
    // The manager is picked among the declared people, not typed again.
    const choice = within(entity).getByRole('radiogroup', { name: 'Only one alternative is exported' });
    expect(
      within(choice)
        .getAllByRole('radio')
        .map((radio) => radio.textContent?.replace(/\(exported\)/, '').trim()),
    ).toEqual(['Person already declared', 'Executive (natural person)', 'Executive (legal entity)']);
    expect(within(entity).getByRole('button', { name: 'Person already declared' }).textContent).toContain(
      'Jeanne Martin',
    );
  });
});

describe('relations show their direction and can be reversed (f)', () => {
  it('writes « owner → target : category » for a link between declared people', async () => {
    connect(new FakeDraftBackend(withSeveralRoles()));
    const { user } = await renderSection();
    await user.click(within(person('Témoin')).getByRole('button', { name: 'Open' }));
    const card = person('Link with an already declared person no. 1');
    expect(within(card).getByTestId('relation-direction').textContent).toBe('Témoin → Jeanne Martin : Lien familial');
  });

  it('removes the link, recreates it on the target and points it back to the owner, in one PATCH', async () => {
    const backend = new FakeDraftBackend(withSeveralRoles());
    connect(backend);
    const { user } = await renderSection();
    await user.click(within(person('Témoin')).getByRole('button', { name: 'Open' }));
    const card = person('Link with an already declared person no. 1');

    await user.click(within(card).getByRole('button', { name: 'Reverse the direction' }));
    // The consequence is spelled out before anything is sent.
    const dialog = await screen.findByRole('dialog');
    expect(dialog.textContent).toContain('« Témoin → Jeanne Martin »');
    expect(dialog.textContent).toContain('« Jeanne Martin → Témoin »');
    expect(backend.bodies).toHaveLength(0);
    await user.click(within(dialog).getByRole('button', { name: 'Reverse' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    const changes = backend.lastBody.changes;
    expect(changes[0]).toEqual({ action: 'remove_block', block_id: 'link-1' });
    const added = changes[1]!;
    expect(added).toMatchObject({
      action: 'add_block',
      parent_block_id: 'pp-1',
      catalog_id: '/ds/personnes/pp/lienAutrePersonneDejaDeclaree',
    });
    expect(added.block_id).toMatch(/^tracfin-new-block-/);
    expect(changes.at(-1)).toEqual({
      action: 'set_relation',
      field: { block_id: added.block_id, field_id: '/ds/personnes/pp/lienAutrePersonneDejaDeclaree/idPersonne' },
      relation: { block_id: 'pnc-1' },
    });
    // The relation type came along.
    expect(changes.some((change) => change.action === 'set_field' && change.value?.text === 'TLP54')).toBe(true);

    // Afterwards the link belongs to Jeanne Martin and points to the non-customer person.
    const pnc = findByCatalogId(backend.draft.document.root, '/ds/personnes/pnc')!;
    expect(pnc.children ?? []).toHaveLength(0);
    const pp = findByCatalogId(backend.draft.document.root, '/ds/personnes/pp')!;
    const created = pp.children!.find(
      (child) => child.catalog_id === '/ds/personnes/pp/lienAutrePersonneDejaDeclaree',
    )!;
    expect(created.fields!['/ds/personnes/pp/lienAutrePersonneDejaDeclaree/idPersonne']![0]!.reference).toEqual({
      block_id: 'pnc-1',
    });
  });

  it('offers the declared people but the owner itself for the other end of a link', async () => {
    connect(new FakeDraftBackend(withSeveralRoles()));
    const { user } = await renderSection();
    await user.click(within(person('Témoin')).getByRole('button', { name: 'Open' }));
    const card = person('Link with an already declared person no. 1');
    await user.click(within(card).getByRole('button', { name: 'Person already declared' }));
    const options = (await screen.findAllByRole('option')).map((option) => option.textContent);
    expect(options.some((label) => label?.includes('Jeanne Martin'))).toBe(true);
    expect(options.some((label) => label?.includes('ACME SAS'))).toBe(true);
    expect(options.some((label) => label?.includes('Témoin'))).toBe(false);
  });

  it('shows a link to an undeclared person with the name typed for it', async () => {
    const draft = personsDraft((_, persons) => {
      persons.children![0]!.children!.push(
        block('/ds/personnes/pp/lienAutrePm', {
          fields: { '/ds/personnes/pp/lienAutrePm/denominationSociale': [text('d', 'Globex')] },
          children: [
            block('/ds/personnes/pp/lienAutrePm/typeRelation', {
              fields: { '/ds/personnes/pp/lienAutrePm/typeRelation/categorieRelation': [text('c', 'TLP57')] },
            }),
          ],
        }),
      );
    });
    connect(new FakeDraftBackend(draft));
    const { user } = await renderSection();
    await user.click(within(person('Jeanne Martin')).getByRole('button', { name: 'Open' }));
    expect(screen.getAllByTestId('relation-direction').map((line) => line.textContent)).toContain(
      'Jeanne Martin → Globex : Economique ou financier',
    );
    // There is no way to reverse a link to somebody who is not declared.
    expect(screen.queryByRole('button', { name: 'Reverse the direction' })).toBeNull();
  });
});

describe('a non-customer person is added by hand (g)', () => {
  it('creates /ds/personnes and the person in one PATCH, without asking for a root or a selection', async () => {
    const backend = new FakeDraftBackend(draftWithout('/ds/personnes'));
    connect(backend, [{ table: 'users', record_id: 'user_8841', origins: ['case_manual_entity'] }]);
    const { user } = await renderSection();

    // A non-customer person has no « from the case context » way in.
    expect(screen.queryByRole('button', { name: /From the case context \(NC\)/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Add a non-customer person' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes.map((change) => [change.action, change.catalog_id])).toEqual([
      ['add_block', '/ds/personnes'],
      ['add_block', '/ds/personnes/pnc'],
    ]);
    expect(mocks.getContext).not.toHaveBeenCalled();

    // The new card opens on its fields; typing in them names the person.
    const card = await screen.findByRole('region', { name: 'Person without a name' });
    await user.type(within(card).getByLabelText('Identification elements'), 'Homme, 40 ans');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(2));
    expect(await screen.findByRole('region', { name: 'Homme, 40 ans' })).toBeTruthy();
    expect(backend.lastBody.changes.map((change) => change.action)).toEqual(['set_field']);
  });

  it('stops adding at the cardinality of the catalog', async () => {
    const draft = personsDraft((_, persons) => {
      for (let index = 0; index < 30; index++) persons.children!.push(block('/ds/personnes/pnc', {}, `pnc-${index}`));
    });
    connect(new FakeDraftBackend(draft));
    await renderSection();
    expect((await screen.findByRole('button', { name: 'Add a non-customer person' })).hasAttribute('disabled')).toBe(
      true,
    );
    expect(screen.getByText('Maximum reached (30).')).toBeTruthy();
  });
});

describe('a person is declared from the case context (h)', () => {
  const roots: TracfinContextRoot[] = [
    { table: 'users', record_id: 'user_8841', origins: ['case_manual_entity', 'decision_pivot'] },
    { table: 'companies', record_id: 'company_302', origins: ['decision_pivot'] },
  ];

  it('shows both origins of a root that is the entity of the case and the pivot of a decision', async () => {
    connect(new FakeDraftBackend(personsDraft()), roots, {
      'users/user_8841': { object_id: 'user_8841', last_name: 'Martin' },
    });
    const { user } = await renderSection();
    await user.click(screen.getByRole('button', { name: 'From the case context (NP)' }));
    const dialog = await screen.findByRole('dialog');

    const userRoot = (await within(dialog).findByText('user_8841', { exact: false })).closest('li')!;
    expect(within(userRoot).getByText('case entity')).toBeTruthy();
    expect(within(userRoot).getByText('decision pivot')).toBeTruthy();
    const companyRoot = within(dialog).getByText('company_302', { exact: false }).closest('li')!;
    expect(within(companyRoot).getByText('decision pivot')).toBeTruthy();
    expect(within(companyRoot).queryByText('case entity')).toBeNull();
    // Already declared: Jeanne Martin is attached to this record.
    expect(userRoot.textContent).toContain('Already declared.');
  });

  it('labels a root with the caption of its table, read through the object details', async () => {
    connect(new FakeDraftBackend(personsDraft()), roots, {
      'users/user_8841': { object_id: 'user_8841', last_name: 'Martin-Lefèvre' },
    });
    mocks.getDataModel.mockResolvedValue({
      dataModel: tracfinDataModelFixture.map((table) =>
        table.name === 'users' ? { ...table, captionField: 'last_name' } : table,
      ),
    });
    const { user } = await renderSection();
    await user.click(screen.getByRole('button', { name: 'From the case context (NP)' }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText('Martin-Lefèvre')).toBeTruthy();
    expect(mocks.getObjectDetails).toHaveBeenCalledWith({ data: { objectType: 'users', objectId: 'user_8841' } });
    // A table without a caption field of its own is shown by its id.
    expect(within(dialog).getByText('companies · company_302')).toBeTruthy();
  });

  it('adds the person and sets the selection on its civil status with a compatible mapping, in one PATCH', async () => {
    const backend = new FakeDraftBackend(personsDraft());
    connect(backend, roots);
    const { user } = await renderSection();
    await user.click(screen.getByRole('button', { name: 'From the case context (NP)' }));
    await user.click(await screen.findByRole('button', { name: 'Add users user_8841' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    const [person, civil, selection] = backend.lastBody.changes;
    expect(person).toMatchObject({ action: 'add_block', catalog_id: '/ds/personnes/pp' });
    expect(civil).toMatchObject({
      action: 'add_block',
      parent_block_id: person!.block_id,
      catalog_id: '/ds/personnes/pp/etatCivil',
    });
    expect(selection).toEqual({
      action: 'set_selection',
      block_id: civil!.block_id,
      selection: { mapping_id: 'map-user-last-name', root: { id: 'root', table: 'users', record_id: 'user_8841' } },
    });
  });

  it('adds a legal entity from a company on the block that owns the mapped identity fields', async () => {
    const backend = new FakeDraftBackend(personsDraft());
    connect(backend, roots);
    const { user } = await renderSection();
    await user.click(screen.getByRole('button', { name: 'From the case context (LE)' }));
    await user.click(await screen.findByRole('button', { name: 'Add companies company_302' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes.map((change) => change.catalog_id ?? change.action)).toEqual([
      '/ds/personnes/pm',
      '/ds/personnes/pm/activiteCoordonnee',
      'set_selection',
    ]);
  });

  it('adds the person without a selection, and says so, when no mapping fits the root', async () => {
    const backend = new FakeDraftBackend(personsDraft());
    connect(backend, roots);
    const { user } = await renderSection();
    await user.click(screen.getByRole('button', { name: 'From the case context (LE)' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/No mapping starts from the « users » table/)).toBeTruthy();
    await user.click(await within(dialog).findByRole('button', { name: 'Add users user_8841' }));

    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes.map((change) => change.action)).toEqual(['add_block']);
    expect((await screen.findByRole('status')).textContent).toContain('« users »');
  });

  it('says the context holds nothing, and keeps adding by hand possible', async () => {
    connect(new FakeDraftBackend(personsDraft()), []);
    const { user } = await renderSection();
    await user.click(screen.getByRole('button', { name: 'From the case context (NP)' }));
    expect(await screen.findByText(/holds no entity/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add a natural person', hidden: true }).hasAttribute('disabled')).toBe(
      false,
    );
  });
});

describe('supports', () => {
  it('lists the twelve types with their cardinality and adds one by hand under the person', async () => {
    const backend = new FakeDraftBackend(personsDraft());
    connect(backend);
    const { user } = await renderSection();
    await user.click(within(person('Jeanne Martin')).getByRole('button', { name: 'Open' }));
    const supports = screen.getByRole('region', { name: 'Financial references (supports)' });

    expect(
      within(supports)
        .getAllByRole('listitem')
        .filter((item) => item.querySelector('button[aria-label^="Add a support"]')),
    ).toHaveLength(12);
    expect(within(supports).getAllByText('0 / 20')).toHaveLength(12);
    await user.click(within(supports).getByRole('button', { name: 'Add a support: IBAN' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes.map((change) => change.catalog_id)).toEqual([
      '/ds/personnes/pp/referencesFinancieres',
      '/ds/personnes/pp/referencesFinancieres/referenceFinanciereIban',
    ]);

    // The IBAN is typed in its own block; the calculated id is not a question.
    const iban = await screen.findByRole('region', { name: 'IBAN no. 1' });
    expect(within(iban).getByLabelText('IBAN')).toBeTruthy();
    expect(within(iban).queryByLabelText(/^Id$/i)).toBeNull();
    await user.type(within(iban).getByLabelText('IBAN'), 'FR7630006000011234567890189');
    await user.tab();
    await waitFor(() => expect(backend.bodies).toHaveLength(2));
    expect(
      within(await screen.findByRole('region', { name: 'IBAN no. 1' })).getByText('FR7630006000011234567890189'),
    ).toBeTruthy();
  });

  it('cannot read a support from the client base when no mapping targets its type', async () => {
    connect(new FakeDraftBackend(personsDraft()));
    const { user } = await renderSection();
    await user.click(within(person('Jeanne Martin')).getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'From the client base: IBAN' }).hasAttribute('disabled')).toBe(true);
    expect(
      screen.getByRole('button', { name: 'From the client base: Bank card number' }).hasAttribute('disabled'),
    ).toBe(false);
  });
});

describe('reference pickers', () => {
  const operation = (fields: Record<string, ReturnType<typeof reference>[]>): TracfinBlock =>
    block('/ds/operations/operation', { fields }, 'op-1');

  function withOperation(fields: Record<string, ReturnType<typeof reference>[]> = {}) {
    return personsDraft((draft, persons) => {
      const pp = persons.children![0]!;
      pp.children!.push(
        block('/ds/personnes/pp/referencesFinancieres', {
          children: [
            block(
              '/ds/personnes/pp/referencesFinancieres/referenceFinanciereIban',
              {
                fields: {
                  '/ds/personnes/pp/referencesFinancieres/referenceFinanciereIban/@iban': [text('i', 'FR76-PP')],
                },
              },
              'support-pp',
            ),
          ],
        }),
      );
      persons.children!.push(
        block(
          '/ds/personnes/pnc',
          {
            children: [
              block('/ds/personnes/pnc/referencesFinancieres', {
                children: [
                  block(
                    '/ds/personnes/pnc/referencesFinancieres/referenceFinanciereIban',
                    {
                      fields: {
                        '/ds/personnes/pnc/referencesFinancieres/referenceFinanciereIban/@iban': [
                          text('j', 'FR76-PNC'),
                        ],
                      },
                    },
                    'support-pnc',
                  ),
                ],
              }),
            ],
            fields: { '/ds/personnes/pnc/implication': [text('n', 'Témoin')] },
          },
          'pnc-1',
        ),
      );
      draft.document.root.children!.push(block('/ds/operations', { children: [operation(fields)] }));
    });
  }

  async function renderOperation(draft: TracfinDraft) {
    const backend = new FakeDraftBackend(draft);
    connect(backend);
    const { TracfinBlockEditor } = await import('../fields/TracfinBlockEditor');
    const { blockAddress } = await import('../model/block-address');
    const rendered = await renderWithEditor(
      () => <TracfinBlockEditor address={blockAddress('op-1')} catalogId="/ds/operations/operation" />,
      { catalogIndex: personsTestIndex },
    );
    return { ...rendered, backend };
  }

  it('picks a declared person for the issuer of an operation, with its type badge, or accepts free text', async () => {
    const { user, backend } = await renderOperation(withOperation());
    await user.click(screen.getByRole('button', { name: 'Issuer' }));
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['NPJeanne Martin', 'NCTémoin']);
    await user.click(options[1]!);
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      field: { block_id: 'op-1', field_id: '/ds/operations/operation/emetteurTypeEmetteur' },
      value: { kind: 'reference', reference: { block_id: 'pnc-1' } },
    });
  });

  it('offers only the supports of the person named in the same operation, and sends the person with the reference', async () => {
    const { user, backend } = await renderOperation(
      withOperation({ '/ds/operations/operation/emetteurTypeEmetteur': [reference('em', 'pnc-1')] }),
    );
    await user.click(screen.getByRole('button', { name: 'Financial reference of the issuance' }));
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['IBAN · FR76-PNC']);
    await user.click(options[0]!);
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes[0]?.value).toEqual({
      kind: 'reference',
      reference: { block_id: 'support-pnc', person_block_id: 'pnc-1' },
    });
  });

  it('asks for the person first when the operation names none', async () => {
    await renderOperation(withOperation());
    expect(screen.getAllByText(/Choose the person first/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Financial reference of the issuance' }).hasAttribute('disabled')).toBe(
      true,
    );
  });

  async function renderCivilStatus(draft: TracfinDraft) {
    const backend = new FakeDraftBackend(draft);
    connect(backend);
    const { TracfinBlockEditor } = await import('../fields/TracfinBlockEditor');
    const { blockAddress } = await import('../model/block-address');
    const rendered = await renderWithEditor(
      () => <TracfinBlockEditor address={blockAddress('civil-1')} catalogId="/ds/personnes/pp/etatCivil" />,
      { catalogIndex: personsTestIndex },
    );
    return { ...rendered, backend };
  }

  it('says there is no piece to choose from when the declaration has none', async () => {
    const { user } = await renderCivilStatus(personsDraft());
    await user.click(screen.getByRole('button', { name: 'Add: Supporting document' }));
    expect(await screen.findByText(/No piece — see the « Attachments » section\./)).toBeTruthy();
  });

  it('lists the pieces of the declaration for a piece reference', async () => {
    const draft = personsDraft((root) => {
      root.document.root.children!.push(
        block('/ds/pieceJointe', {
          children: [
            block(
              '/ds/pieceJointe/piece',
              { fields: { '/ds/pieceJointe/piece/libelle': [text('l', 'Passeport')] } },
              'piece-1',
            ),
            block('/ds/pieceJointe/piece', {}, 'piece-2'),
          ],
        }),
      );
    });
    const { user, backend } = await renderCivilStatus(draft);
    await user.click(screen.getByRole('button', { name: 'Add: Supporting document' }));
    await user.click(await screen.findByRole('button', { name: 'Supporting document' }));
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Passeport', 'Piece no. 2']);
    await user.click(options[0]!);
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes[0]).toMatchObject({
      action: 'set_field',
      field: { block_id: 'civil-1', field_id: '/ds/personnes/pp/etatCivil/idPieceJointe' },
      value: { kind: 'reference', reference: { block_id: 'piece-1' } },
    });
  });

  it('shows a reference to something that was removed as such, and lets it be replaced', async () => {
    const draft = personsDraft((root) => {
      const civil = findByCatalogId(root.document.root, '/ds/personnes/pp/etatCivil')!;
      civil.fields!['/ds/personnes/pp/etatCivil/idPieceJointe'] = [reference('gone', 'piece-gone')];
    });
    await renderCivilStatus(draft);
    expect(screen.getByText('Removed item')).toBeTruthy();
  });
});

describe('the identity of an executive (dirigeant)', () => {
  it('keeps the data of the branches that are not exported and says so', async () => {
    const draft = withSeveralRoles();
    const dirigeant = findByCatalogId(draft.document.root, '/ds/personnes/pm/dirigeant')!;
    dirigeant.children = [
      block('/ds/personnes/pm/dirigeant/autreDirigeantP', {
        fields: { '/ds/personnes/pm/dirigeant/autreDirigeantP/nom': [text('n', 'Dupont')] },
      }),
    ];
    connect(new FakeDraftBackend(draft));
    const { user } = await renderSection();
    await user.click(within(person('ACME SAS')).getByRole('button', { name: 'Open' }));
    expect(
      within(person('ACME SAS')).getByText(/data of the other alternative is kept, but it will not be exported/),
    ).toBeTruthy();
  });
});
