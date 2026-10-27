import type { TracfinApiError, TracfinConfiguration, TracfinConfigurationInput } from '@app-builder/models/tracfin';
import {
  tracfinCatalogFixture,
  tracfinConfigurationFixture,
  tracfinDataModelFixture,
} from '@app-builder/models/tracfin/__fixtures__';
import '@app-builder/tests/setup/i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import i18next from 'i18next';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TracfinSettingsPage } from './TracfinSettingsPage';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getConfiguration: vi.fn(),
  putConfiguration: vi.fn(),
  getDataModel: vi.fn(),
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinConfigurationFn: mocks.getConfiguration,
  putTracfinConfigurationFn: mocks.putConfiguration,
}));
vi.mock('@app-builder/server-fns/data', () => ({ getDataModelFn: mocks.getDataModel }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.setConfig({ testTimeout: 30_000 });

const ok = <T,>(data: T) => ({ ok: true as const, data });
const failure = (error: TracfinApiError) => ({ ok: false as const, error });
const NOT_FOUND = failure({ kind: 'not_found', status: 404, message: 'not found' });

/** What the server answers to a PUT: the stored configuration at the next revision. */
function stored(input: TracfinConfigurationInput, base: TracfinConfiguration = tracfinConfigurationFixture) {
  return { ...base, revision: input.expected_revision + 1, mappings: input.mappings };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCatalog.mockResolvedValue(ok(tracfinCatalogFixture));
  mocks.getDataModel.mockResolvedValue({ dataModel: tracfinDataModelFixture });
  mocks.getConfiguration.mockResolvedValue(ok(tracfinConfigurationFixture));
  mocks.putConfiguration.mockImplementation(async ({ data }: { data: TracfinConfigurationInput }) => ok(stored(data)));
});
afterEach(cleanup);

async function renderPage() {
  const user = userEvent.setup();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18next}>
        <TracfinSettingsPage />
      </I18nextProvider>
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { name: 'TRACFIN configuration', level: 1 });
  return user;
}

type User = Awaited<ReturnType<typeof renderPage>>;

function lastPutBody(): TracfinConfigurationInput {
  const call = mocks.putConfiguration.mock.calls.at(-1) as [{ data: TracfinConfigurationInput }] | undefined;
  if (!call) throw new Error('No PUT was sent');
  return call[0].data;
}

const saveButton = () => screen.getByRole('button', { name: 'Save' });

async function choose(user: User, picker: string | RegExp, option: string | RegExp) {
  await user.click(screen.getByRole('button', { name: picker }));
  await user.click(await screen.findByRole('option', { name: option }));
}

const mappingRow = (id: string) => screen.getByRole('group', { name: new RegExp(`\\(${id}\\)$`) });

async function openMapping(user: User, id: string) {
  await user.click(within(mappingRow(id)).getAllByRole('button')[0]!);
}

/** Adds a mapping for a target field, which opens in the editor. */
async function addMapping(user: User, search: string, option: RegExp) {
  await user.click(screen.getByRole('button', { name: 'Add a mapping' }));
  await user.type(await screen.findByPlaceholderText('Search by name or path'), search);
  await user.click(await screen.findByRole('option', { name: option }));
}

async function editPostalCode(user: User, value: string) {
  const input = screen.getByLabelText('Postal code');
  await user.clear(input);
  await user.type(input, value);
}

const ACCOUNTS_STEP = { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' };
const CARDS_STEP = { id: 'cards', parent_id: 'accounts', link: 'account', direction: 'inverse', table: 'cards' };

/** The first text of every field of the stored settings document, read without the production reader. */
function fixtureSettingTexts(): Record<string, string> {
  const texts: Record<string, string> = {};
  const visit = (block: { fields?: Record<string, { text?: string }[]>; children?: unknown[] }) => {
    for (const [fieldId, values] of Object.entries(block.fields ?? {})) texts[fieldId] = values[0]?.text ?? '';
    for (const child of (block.children ?? []) as (typeof block)[]) visit(child);
  };
  visit(tracfinConfigurationFixture.settings.root);
  return texts;
}

const MEMBERS = {
  mapping: ['discriminator', 'id', 'target_field', 'source', 'codes', 'unit', 'target_currency', 'currency'],
  source: ['unit_operation', 'kind', 'entity_type', 'table', 'field', 'historical_type', 'path'],
  step: ['id', 'parent_id', 'link', 'direction', 'table', 'record_id'],
};

/** The server refuses any member the contract does not name: nothing else may be in the body. */
function expectContractMembersOnly(body: TracfinConfigurationInput) {
  expect(Object.keys(body).sort()).toEqual(['expected_revision', 'mappings', 'settings']);
  for (const mapping of body.mappings) {
    expect(MEMBERS.mapping).toEqual(expect.arrayContaining(Object.keys(mapping)));
    expect(MEMBERS.source).toEqual(expect.arrayContaining(Object.keys(mapping.source)));
    for (const step of mapping.source.path ?? [])
      expect(MEMBERS.step).toEqual(expect.arrayContaining(Object.keys(step)));
    for (const code of mapping.codes ?? []) expect(Object.keys(code).sort()).toEqual(['source', 'target']);
  }
  for (const setting of body.settings) {
    expect(Object.keys(setting).sort()).toEqual(['field', 'value']);
    expect(Object.keys(setting.field)).toEqual(['field_id']);
  }
}

describe('loading', () => {
  it('shows a 403 as an error and never as an empty configuration', async () => {
    mocks.getConfiguration.mockResolvedValue(failure({ kind: 'forbidden', status: 403, message: 'forbidden' }));
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <I18nextProvider i18n={i18next}>
          <TracfinSettingsPage />
        </I18nextProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      expect.stringContaining('You do not have the rights required to view the TRACFIN configuration.'),
    );
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add a mapping' })).toBeNull();
  });

  it('starts an empty form when the organization has no configuration yet, and creates it at revision 0', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();

    expect(screen.getByText('No configuration saved yet: the first save creates it.')).toBeTruthy();
    expect((saveButton() as HTMLButtonElement).disabled).toBe(true);

    await user.type(screen.getByLabelText('Organisation name'), 'Banque Exemple');
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalledTimes(1));
    expect(lastPutBody()).toEqual({
      expected_revision: 0,
      settings: [{ field: { field_id: '/ds/organisme/libelle' }, value: { kind: 'text', text: 'Banque Exemple' } }],
      mappings: [],
    });
  });
});

describe('organisation and contact settings', () => {
  it('is driven by the catalog: organisme, address and contact, never the declarant', async () => {
    await renderPage();

    for (const label of ['Organisation name', 'Postal code', 'City', 'First name', 'Last name']) {
      expect(screen.getAllByLabelText(label).length).toBeGreaterThan(0);
    }
    // Every field of the form comes from organisme or contact: none from the declarant.
    const fieldIds = [...document.querySelectorAll('[id^="tracfin-setting-"]')].map((element) => element.id);
    expect(fieldIds.length).toBeGreaterThan(10);
    expect(fieldIds.every((id) => /^tracfin-setting-(organisme|contact)_/.test(id))).toBe(true);
    expect(screen.getAllByText('Expected by TRACFIN').length).toBeGreaterThan(0);
  });

  it('picks a code showing « value — label », with a search', async () => {
    const user = await renderPage();

    await user.click(screen.getByRole('button', { name: 'Organisation profession' }));
    await user.type(await screen.findByPlaceholderText('Search a code or a label'), 'Agence');
    expect(screen.queryByRole('option', { name: /Administrateur de justice/ })).toBeNull();
    await user.click(await screen.findByRole('option', { name: 'TPI52 — Agence de voyages' }));

    expect(screen.getByRole('button', { name: 'Organisation profession' }).textContent).toContain(
      'TPI52 — Agence de voyages',
    );
    await user.click(saveButton());
    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
    expect(lastPutBody().settings).toContainEqual({
      field: { field_id: '/ds/organisme/profession' },
      value: { kind: 'text', text: 'TPI52' },
    });
  });

  it('never sends a field that was emptied, nor an attribute whose owner was emptied', async () => {
    const user = await renderPage();

    await user.clear(screen.getByLabelText('Organisation name'));
    await user.click(screen.getByRole('button', { name: 'Clear the value of Country' }));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
    const sent = lastPutBody().settings.map(({ field }) => field.field_id);
    expect(sent).not.toContain('/ds/organisme/libelle');
    expect(sent).not.toContain('/ds/organisme/adresse/pays');
    expect(sent).not.toContain('/ds/organisme/adresse/pays/@type');
    expect(sent).toContain('/ds/organisme/adresse/ville');
  });

  it('keeps an attribute disabled until its owner has a value', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    await renderPage();

    expect((screen.getByLabelText('Country code type') as HTMLInputElement).disabled).toBe(true);
  });
});

describe('(a) a loaded configuration round-trips unchanged', () => {
  it('sends the same mappings and the same settings, guarded by the revision that was read', async () => {
    const user = await renderPage();

    // The only edit: everything else must come back exactly as it was stored.
    await editPostalCode(user, '75008');
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalledTimes(1));
    const body = lastPutBody();
    expect(body.expected_revision).toBe(tracfinConfigurationFixture.revision);
    expect(body.mappings).toEqual(tracfinConfigurationFixture.mappings);
    expect(Object.fromEntries(body.settings.map(({ field, value }) => [field.field_id, value.text]))).toEqual({
      ...fixtureSettingTexts(),
      '/ds/organisme/adresse/codePostal': '75008',
    });
    expect(body.settings.every(({ value }) => value.kind === 'text')).toBe(true);
    expectContractMembersOnly(body);
  });

  it('keeps both links to the same Company table, and the block fed by several tables, as stored', async () => {
    await renderPage();

    const employer = within(mappingRow('map-employer-name'));
    const affiliated = within(mappingRow('map-affiliated-name'));
    expect(employer.getByText('Person · users › companies · name')).toBeTruthy();
    expect(affiliated.getByText('Person · users › companies · name')).toBeTruthy();
    // Two mappings with the same target field, from two different tables, are both kept.
    expect(within(mappingRow('map-user-employer-name')).getByText('Person · users · employer_name')).toBeTruthy();
    expect(within(mappingRow('map-employer-name')).getByText('denominationSociale')).toBeTruthy();
    expect(within(mappingRow('map-user-employer-name')).getByText('denominationSociale')).toBeTruthy();
  });

  it('adopts the returned configuration: new revision, nothing left unsaved', async () => {
    const user = await renderPage();
    await editPostalCode(user, '75008');
    expect(screen.getByText('Unsaved changes')).toBeTruthy();

    await user.click(saveButton());

    await waitFor(() => expect(screen.queryByText('Unsaved changes')).toBeNull());
    expect(screen.getByText('Saved revision 4')).toBeTruthy();
    expect((saveButton() as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('(b) path steps of an ingested mapping', () => {
  const CARD_NUMBER = /@numeroCarteBancaire$/;

  async function buildCardMapping(user: User, search: string, option: RegExp, sourceField: string) {
    await addMapping(user, search, option);
    await choose(user, 'Root table', 'users');
    await choose(user, 'Add a step from the table users', /^user → accounts/);
    await choose(user, 'Add a step from the table accounts', /^account → cards/);
    await choose(user, 'Source field', sourceField);
  }

  it('builds User → Account → Card with the exact steps, and reuses their ids in a second mapping of the same root', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();

    await buildCardMapping(user, 'numeroCarteBancaire', CARD_NUMBER, 'number');
    // The hops are offered in words, and the one without navigation option is flagged.
    expect(screen.getAllByText('towards the children').length).toBeGreaterThan(0);

    await buildCardMapping(user, 'lien', /@lien$/, 'account_id');
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalledTimes(1));
    const body = lastPutBody();
    expect(body.expected_revision).toBe(0);
    expect(body.mappings).toHaveLength(2);
    expect(body.mappings.map((mapping) => mapping.source.path)).toEqual([
      [ACCOUNTS_STEP, CARDS_STEP],
      [ACCOUNTS_STEP, CARDS_STEP],
    ]);
    expect(body.mappings[0]).toMatchObject({
      id: expect.stringMatching(/-[a-z0-9]{4}$/),
      target_field:
        '/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire/@numeroCarteBancaire',
      source: { kind: 'ingested', entity_type: 'Person', table: 'users', field: 'number' },
    });
    expect(body.mappings[0]?.id).not.toBe(body.mappings[1]?.id);
    expectContractMembersOnly(body);
  });

  it('reuses the step ids of a stored mapping of the same root table', async () => {
    const user = await renderPage();

    await addMapping(user, 'numeroCarteBancaire', CARD_NUMBER);
    await choose(user, 'Root table', 'users');
    await choose(user, 'Add a step from the table users', /^user → accounts/);
    await choose(user, 'Add a step from the table accounts', /^account → cards/);
    await choose(user, 'Source field', 'object_id');
    await editPostalCode(user, '75008');
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
    const added = lastPutBody().mappings.at(-1);
    expect(added?.source.path).toEqual([ACCOUNTS_STEP, CARDS_STEP]);
    // The stored mapping of the fixture defines the same two steps under the same ids.
    expect(lastPutBody().mappings.find(({ id }) => id === 'map-card-number')?.source.path).toEqual([
      ACCOUNTS_STEP,
      CARDS_STEP,
    ]);
  });

  it('flags an inverse hop that has no valid navigation option', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();

    await addMapping(user, 'numeroCarteBancaire', CARD_NUMBER);
    await choose(user, 'Root table', 'users');
    await user.click(screen.getByRole('button', { name: 'Add a step from the table users' }));
    expect(await screen.findByRole('option', { name: /^borrower → loans.*navigation not indexed/ })).toBeTruthy();
    expect(screen.getByRole('option', { name: /^user → accounts(?!.*not indexed)/ })).toBeTruthy();
    await user.click(screen.getByRole('option', { name: /^borrower → loans/ }));

    expect(screen.getAllByText('navigation not indexed').length).toBeGreaterThan(0);
    // A warning, not a block: the mapping can still be saved.
    await user.click(saveButton());
    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
  });
});

describe('(c) code correspondences', () => {
  it('saves a configured correspondence next to the stored ones', async () => {
    const user = await renderPage();

    await openMapping(user, 'map-user-gender');
    await user.click(screen.getByRole('button', { name: 'Add a correspondence' }));
    await user.type(screen.getByLabelText('Source value of row 3'), 'X');
    await choose(user, 'TRACFIN code of row 3', 'SEX3 — Inconnu');
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
    expect(lastPutBody().mappings.find(({ id }) => id === 'map-user-gender')?.codes).toEqual([
      { source: 'M', target: 'SEX1' },
      { source: 'F', target: 'SEX2' },
      { source: 'X', target: 'SEX3' },
    ]);
  });

  it('does not offer a code the referential excludes', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();

    await addMapping(user, 'piece/type', /\/ds\/pieceJointe\/piece\/type$/);
    await user.click(screen.getByRole('button', { name: 'Add a correspondence' }));
    await user.click(screen.getByRole('button', { name: 'TRACFIN code of row 1' }));

    // TA17 starts the CSV and is excluded by the profile; the codes around it are offered.
    expect(await screen.findByRole('option', { name: /^TA1 — / })).toBeTruthy();
    expect(screen.getByRole('option', { name: /^TA2 — / })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /TA17/ })).toBeNull();
  });

  it('shows the correspondences only for a target that has a code list', async () => {
    const user = await renderPage();

    await openMapping(user, 'map-user-first-name');
    expect(screen.queryByRole('button', { name: 'Add a correspondence' })).toBeNull();
    await openMapping(user, 'map-user-gender');
    expect(screen.getByRole('button', { name: 'Add a correspondence' })).toBeTruthy();
  });
});

describe('(d) a 400 listing codes', () => {
  const rejection = failure({
    kind: 'bad_request',
    status: 400,
    message:
      'invalid TRACFIN configuration: UNKNOWN_CATALOG_CODE /ds/personnes/pp/etatCivil/sexe; INVALID_MAPPING_PATH /ds/personnes/pp/lienAutrePm/numIdentPro: bad parameter',
  });

  it('shows each code on the mappings of its target and keeps the unsaved edits', async () => {
    mocks.putConfiguration.mockResolvedValue(rejection);
    const user = await renderPage();
    await editPostalCode(user, '99999');

    await user.click(saveButton());

    const gender = within(mappingRow('map-user-gender'));
    expect(
      await gender.findByText('A chosen TRACFIN code does not exist in the referential of the field.'),
    ).toBeTruthy();
    const registration = within(mappingRow('map-affiliated-registration'));
    expect(
      registration.getByText(
        'The path is invalid: a step without a unique id, link or direction, or more than 20 steps.',
      ),
    ).toBeTruthy();
    // The other mappings carry no error, and each code sits on its own target only.
    expect(gender.queryByText(/path is invalid/)).toBeNull();
    expect(registration.queryByText(/does not exist in the referential/)).toBeNull();
    expect(within(mappingRow('map-user-first-name')).queryByRole('list')).toBeNull();
    // Nothing the administrator typed is lost.
    expect((screen.getByLabelText('Postal code') as HTMLInputElement).value).toBe('99999');
    expect(screen.getByText('Unsaved changes')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('Configuration rejected');
  });

  it('attaches a code to every mapping that shares the target field', async () => {
    mocks.putConfiguration.mockResolvedValue(
      failure({
        kind: 'bad_request',
        status: 400,
        message: 'invalid TRACFIN configuration: INVALID_MAPPING_SOURCE /ds/personnes/pp/activite/denominationSociale',
      }),
    );
    const user = await renderPage();
    await editPostalCode(user, '99999');
    await user.click(saveButton());

    for (const id of ['map-employer-name', 'map-user-employer-name']) {
      expect(await within(mappingRow(id)).findByText(/The source is incomplete/)).toBeTruthy();
    }
  });

  it('shows a code on the setting field it names, and a code without field in the page-level list', async () => {
    mocks.putConfiguration.mockResolvedValue(
      failure({
        kind: 'bad_request',
        status: 400,
        message: 'invalid TRACFIN configuration: SOMETHING_NEW /ds/organisme/libelle; INCOMPATIBLE_PROFILE',
      }),
    );
    const user = await renderPage();
    await editPostalCode(user, '99999');
    await user.click(saveButton());

    // An unknown code is shown as it is.
    expect(await screen.findByRole('list', { name: 'Errors of Organisation name' })).toHaveProperty(
      'textContent',
      'SOMETHING_NEW',
    );
    const general = screen.getByRole('list', { name: 'Errors without a specific field' });
    expect(general.textContent).toContain('The TRACFIN profile version of the configuration does not match the server');
  });

  it('shows the raw message of a bare 400, as invalid settings name nothing, and keeps the form', async () => {
    mocks.putConfiguration.mockResolvedValue(failure({ kind: 'bad_request', status: 400, message: 'bad parameter' }));
    const user = await renderPage();
    await editPostalCode(user, '99999');

    await user.click(saveButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('bad parameter');
    expect((screen.getByLabelText('Postal code') as HTMLInputElement).value).toBe('99999');
  });

  it('reports a 413 as a technical limit', async () => {
    mocks.putConfiguration.mockResolvedValue(failure({ kind: 'too_large', status: 413, message: 'too large' }));
    const user = await renderPage();
    await editPostalCode(user, '99999');

    await user.click(saveButton());

    expect((await screen.findByRole('alert')).textContent).toContain('Configuration too large (technical limit)');
  });
});

describe('(e) a 409 revision conflict', () => {
  const serverVersion: TracfinConfiguration = {
    ...tracfinConfigurationFixture,
    revision: 4,
    mappings: [
      ...(tracfinConfigurationFixture.mappings ?? []).filter(({ id }) => id !== 'map-user-first-name'),
      {
        id: 'map-added-elsewhere',
        target_field: '/ds/personnes/pp/etatCivil/dateNaissance',
        source: { kind: 'ingested', entity_type: 'Person', table: 'users', field: 'birth_date' },
      },
    ],
  };

  beforeEach(() => {
    mocks.putConfiguration.mockResolvedValue(failure({ kind: 'conflict', status: 409, message: 'conflict' }));
  });

  it('keeps the edits and offers to reload the server version', async () => {
    const user = await renderPage();
    await editPostalCode(user, '99999');

    await user.click(saveButton());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('The configuration changed in the meantime');
    expect(within(alert).getByRole('button', { name: 'Reload the server version' })).toBeTruthy();
    expect((screen.getByLabelText('Postal code') as HTMLInputElement).value).toBe('99999');
    expect(screen.getByText('Unsaved changes')).toBeTruthy();
    expect(mocks.putConfiguration).toHaveBeenCalledTimes(1);
  });

  it('compares with the server version before anything is re-applied, then re-applies on request', async () => {
    const user = await renderPage();
    await editPostalCode(user, '99999');
    await user.click(saveButton());

    mocks.getConfiguration.mockResolvedValue(
      ok({
        ...serverVersion,
        settings: tracfinConfigurationFixture.settings,
      }),
    );
    await user.click(await screen.findByRole('button', { name: 'Reload the server version' }));

    const panel = await screen.findByRole('region', { name: 'Server version (revision 4)' });
    expect(within(panel).getByText('map-added-elsewhere')).toBeTruthy();
    expect(within(panel).getByText('map-user-first-name')).toBeTruthy();
    expect(within(panel).getByText('/ds/organisme/adresse/codePostal')).toBeTruthy();
    // Looking at the differences writes nothing.
    expect(mocks.putConfiguration).toHaveBeenCalledTimes(1);
    expect((screen.getByLabelText('Postal code') as HTMLInputElement).value).toBe('99999');

    await user.click(within(panel).getByRole('button', { name: 'Re-apply my changes' }));
    expect(screen.queryByRole('region', { name: 'Server version (revision 4)' })).toBeNull();
    expect(screen.getByText('Saved revision 4')).toBeTruthy();

    mocks.putConfiguration.mockResolvedValue(
      ok(stored({ expected_revision: 4, settings: [], mappings: [] }, serverVersion)),
    );
    await user.click(saveButton());
    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalledTimes(2));
    expect(lastPutBody().expected_revision).toBe(4);
    expect(lastPutBody().settings).toContainEqual({
      field: { field_id: '/ds/organisme/adresse/codePostal' },
      value: { kind: 'text', text: '99999' },
    });
  });

  it('can give up the edits for the server version', async () => {
    const user = await renderPage();
    await editPostalCode(user, '99999');
    await user.click(saveButton());
    mocks.getConfiguration.mockResolvedValue(ok(serverVersion));
    await user.click(await screen.findByRole('button', { name: 'Reload the server version' }));

    const panel = await screen.findByRole('region', { name: 'Server version (revision 4)' });
    await user.click(within(panel).getByRole('button', { name: 'Discard my changes' }));

    expect((screen.getByLabelText('Postal code') as HTMLInputElement).value).toBe('75002');
    expect(screen.queryByText('Unsaved changes')).toBeNull();
    expect(screen.getByText('Saved revision 4')).toBeTruthy();
    expect(mocks.putConfiguration).toHaveBeenCalledTimes(1);
  });
});

describe('(g) root tables', () => {
  it('offers the person tables for a Person and the company tables for a Company, never a partner', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();
    await addMapping(user, 'prenom', /etatCivil\/prenom$/);

    await user.click(screen.getByRole('button', { name: 'Root table' }));
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual(['users']);
    await user.keyboard('{Escape}');

    await choose(user, 'Entity type', 'Company');
    await user.click(screen.getByRole('button', { name: 'Root table' }));
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual(['companies']);
    expect(screen.queryByRole('option', { name: 'partners' })).toBeNull();
  });

  it('keeps and flags a stored root table that is no longer valid, instead of replacing it', async () => {
    const [first] = tracfinConfigurationFixture.mappings ?? [];
    mocks.getConfiguration.mockResolvedValue(
      ok({
        ...tracfinConfigurationFixture,
        mappings: [{ ...first!, source: { ...first!.source, table: 'partners' } }],
      }),
    );
    const user = await renderPage();

    await openMapping(user, first!.id);

    expect(screen.getByRole('button', { name: 'Root table' }).textContent).toContain('partners');
    expect(screen.getByText(/The table partners is not a valid root table/)).toBeTruthy();
  });
});

describe('mapping editor', () => {
  it('lists mappings grouped by the block that owns their target, and adds, duplicates and removes them', async () => {
    const user = await renderPage();

    expect(screen.getByRole('region', { name: '/ds/personnes/pp/etatCivil' })).toBeTruthy();
    expect(screen.getByRole('region', { name: '/ds/personnes/pp/lienAutrePm' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /^Duplicate mapping prenom \(map-user-first-name\)$/ }));
    expect(screen.getAllByRole('group', { name: /^Mapping prenom \(/ })).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /^Remove mapping prenom \(map-user-first-name\)$/ }));
    expect(screen.getAllByRole('group', { name: /^Mapping prenom \(/ })).toHaveLength(1);

    await user.click(saveButton());
    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
    const ids = lastPutBody().mappings.map(({ id }) => id);
    expect(ids).toHaveLength(10);
    expect(ids).not.toContain('map-user-first-name');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not list calculated or excluded fields as targets', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();

    await user.click(screen.getByRole('button', { name: 'Add a mapping' }));
    await screen.findByPlaceholderText('Search by name or path');
    const names = screen.getAllByRole('option').map((option) => option.textContent ?? '');
    expect(names.some((name) => name.includes('/ds/personnes/pp/etatCivil/prenom'))).toBe(true);
    expect(names.some((name) => name.includes('/ds/pieceJointe/piece/contenu'))).toBe(false);
    expect(names.some((name) => name.includes('@id'))).toBe(false);
    expect(names.some((name) => name.includes('/ds/operationstdf'))).toBe(false);
    expect(names.some((name) => name.includes('/ds/declarant'))).toBe(true);
  });

  it('offers the unit-operation toggle for the principal operation count only', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();

    await addMapping(user, 'nombreOperations', /nombreOperations$/);
    await choose(user, 'Source of the value', 'Decision snapshot');
    await user.click(screen.getByRole('switch', { name: 'Count one operation per decision' }));
    await user.type(screen.getByLabelText('Decision object type'), 'transactions');
    await user.type(screen.getByLabelText('Snapshot field'), 'id');
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
    expect(lastPutBody().mappings[0]?.source).toEqual({
      kind: 'decision_snapshot',
      unit_operation: true,
      historical_type: 'transactions',
      field: 'id',
    });
  });

  it('configures an amount: unit, the currency the profile proves, and exactly one currency evidence', async () => {
    mocks.getConfiguration.mockResolvedValue(NOT_FOUND);
    const user = await renderPage();

    await addMapping(user, 'montantEuro', /operationEnCours\/montantEuro$/);
    await choose(user, 'Source of the value', 'Decision snapshot');
    await user.type(screen.getByLabelText('Decision object type'), 'transactions');
    await user.type(screen.getByLabelText('Snapshot field'), 'amount');
    await choose(user, 'Unit of the source amount', 'Minor unit (cents)');
    expect((screen.getByRole('button', { name: 'Declaration currency' }) as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Constant currency' }));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.putConfiguration).toHaveBeenCalled());
    expect(lastPutBody().mappings[0]).toMatchObject({
      target_field: '/ds/operations/operationEnCours/montantEuro',
      unit: 'minor',
      target_currency: 'EUR',
      currency: { constant: 'EUR' },
    });
    expect(lastPutBody().mappings[0]?.currency).not.toHaveProperty('field');
  });

  it('keeps a stored settings source and shows it read-only', async () => {
    const [first] = tracfinConfigurationFixture.mappings ?? [];
    mocks.getConfiguration.mockResolvedValue(
      ok({
        ...tracfinConfigurationFixture,
        mappings: [{ ...first!, source: { kind: 'settings', field: '/ds/organisme/libelle' } }],
      }),
    );
    const user = await renderPage();

    expect(within(mappingRow(first!.id)).getByText('Settings source (read-only)')).toBeTruthy();
    await openMapping(user, first!.id);
    expect(screen.getByText(/Settings" source \(field \/ds\/organisme\/libelle\)/)).toBeTruthy();
  });
});
