import { FormatContext } from '@app-builder/contexts/FormatContext';
import type { CaseFile } from '@app-builder/models/cases';
import type { TracfinDraft } from '@app-builder/models/tracfin';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { mockResizeObserver } from 'jsdom-testing-mocks';
import type { ReactNode } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { PiecesSection } from '../sections/PiecesSection';
import { FakeDraftBackend } from '../test-utils/fake-backend';
import { connectPersons, type PersonsMocks } from '../test-utils/persons-harness';
import { personsTestIndex, reference, text } from '../test-utils/persons-test-data';
import { FILE, FILES, piece, piecesDiagnostic, piecesDraft, SHA } from '../test-utils/pieces-test-data';
import { renderWithEditor } from '../test-utils/render-page';
import { TracfinCaseFilesProvider } from './case-files-context';

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
vi.mock('@app-builder/server-fns/cases', () => ({ listCaseDecisionsFn: vi.fn() }));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Link: ({ children, to, target }: { children: ReactNode; to: string; target?: string }) => (
      <a href={to} target={target}>
        {children}
      </a>
    ),
  };
});

mockResizeObserver();
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
vi.setConfig({ testTimeout: 30_000 });

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

/** Shows the save state of the editor, to check that a refusal changes none of it. */
function EditorProbe() {
  const editor = useTracfinDraftEditorContext();
  return (
    <div>
      <output aria-label="probe">
        {editor.status}|{editor.pendingCount}|{editor.failure?.kind ?? 'none'}|{editor.draft.revision}
      </output>
      <button type="button" onClick={() => void editor.flush()}>
        probe flush
      </button>
    </div>
  );
}

async function renderSection(draft: TracfinDraft, files: CaseFile[] | null = FILES) {
  const backend = new FakeDraftBackend(draft);
  for (const file of FILES) {
    if (file.id === FILE.foreign) backend.foreignFiles.add(file.id);
    else backend.caseFiles.set(file.id, { sha256: SHA, size: 2048 });
  }
  connectPersons(mocks as unknown as PersonsMocks, backend);
  const body = (
    <FormatContext.Provider value={{ locale: 'en', timezone: 'UTC' }}>
      <PiecesSection />
      <EditorProbe />
    </FormatContext.Provider>
  );
  const rendered = await renderWithEditor(
    () => (files === null ? body : <TracfinCaseFilesProvider files={files}>{body}</TracfinCaseFilesProvider>),
    { catalogIndex: personsTestIndex },
  );
  return { ...rendered, backend };
}

const addButton = (name: string) => screen.getByRole('button', { name: `Add « ${name} » as an attachment` });
const probe = () => screen.getByLabelText('probe').textContent;
/** The refusal banner (a card can show its own alert about a missing file). */
const refusal = async (fragment: string) =>
  waitFor(() => {
    const found = screen.getAllByRole('alert').find((alert) => alert.textContent?.includes(fragment));
    if (!found) throw new Error(`no alert with: ${fragment}`);
    return found;
  });
const card = (index: number) => screen.getByRole('region', { name: `Attachment no. ${index}` });

describe('adding a case file as a piece', () => {
  it('(a) sends the container and the first piece in ONE PATCH with source_file_id exactly as listed', async () => {
    const { user, backend } = await renderSection(piecesDraft());
    expect(screen.getByText('0 / 15')).toBeTruthy();

    await user.click(addButton('passport.pdf'));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));

    const { changes, expected_revision: expected } = backend.lastBody;
    expect(expected).toBe(backend.bodies[0]!.expected_revision);
    expect(changes.map((change) => change.action)).toEqual(['add_block', 'add_block']);
    const [container, added] = changes;
    expect(container).toMatchObject({ parent_block_id: backend.draft.document.root.id, catalog_id: '/ds/pieceJointe' });
    expect(container!.block_id).toBeTruthy();
    // The piece hangs under the container's alias and carries the file id byte for byte; no other key.
    expect(added!.parent_block_id).toBe(container!.block_id);
    expect(added!.source_file_id).toBe(FILE.one);
    expect(Object.keys(added!).sort()).toEqual([
      'action',
      'block_id',
      'catalog_id',
      'parent_block_id',
      'source_file_id',
    ]);
    expect(added!.catalog_id).toBe('/ds/pieceJointe/piece');

    // The aliases were replaced by server ids and the response carries the proof of the file.
    const pieces = backend.draft.document.root.children!.find((child) => child.catalog_id === '/ds/pieceJointe')!;
    expect(pieces.children).toHaveLength(1);
    expect(pieces.children![0]!.attachment).toEqual({ source_file_id: FILE.one, sha256: SHA, size: 2048 });

    const first = await screen.findByRole('region', { name: 'Attachment no. 1' });
    expect(within(first).getByText('passport.pdf')).toBeTruthy();
    expect(within(first).getByText('2 KiB')).toBeTruthy();
    expect(within(first).getByText(`${SHA.slice(0, 12)}…`)).toBeTruthy();
    expect(screen.getByText('Already added — attachment no. 1')).toBeTruthy();
    expect(screen.getByText('1 / 15')).toBeTruthy();
    // The file cannot be taken twice: no button left for it.
    expect(screen.queryByRole('button', { name: 'Add « passport.pdf » as an attachment' })).toBeNull();
  });

  it('adds the next piece under the existing container with a single add_block', async () => {
    const { user, backend } = await renderSection(piecesDraft({ pieces: [piece('p1', FILE.one)] }));
    await user.click(addButton('invoice-march.pdf'));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'add_block',
        parent_block_id: 'pieces-1',
        catalog_id: '/ds/pieceJointe/piece',
        block_id: backend.lastBody.changes[0]!.block_id,
        source_file_id: FILE.two,
      },
    ]);
    expect(await screen.findByRole('region', { name: 'Attachment no. 2' })).toBeTruthy();
  });

  it('(b) refuses the 16th piece before sending anything', async () => {
    const fifteen = Array.from({ length: 15 }, (_, index) =>
      piece(`p${index}`, `0a1b2c3d-0000-4000-8000-${String(index).padStart(12, '0')}`),
    );
    const { user, backend } = await renderSection(piecesDraft({ pieces: fifteen }));
    expect(screen.getByText('15 / 15')).toBeTruthy();
    expect(screen.getByText(/Maximum of 15 attachments reached/)).toBeTruthy();

    const button = addButton('passport.pdf');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    await user.click(button);

    await refusal('Maximum of 15 attachments reached: « passport.pdf » was not added');
    expect(backend.bodies).toHaveLength(0);
    expect(probe()).toBe('idle|0|none|3');
  });

  it('marks the files already taken and explains that the list is missing without the case files', async () => {
    const { user } = await renderSection(piecesDraft({ pieces: [piece('p1', FILE.one)] }));
    const row = screen.getByText('passport.pdf', { selector: 'span' }).closest('li')!;
    expect(within(row).getByText('Already added — attachment no. 1')).toBeTruthy();
    expect(within(row).queryByRole('button')).toBeNull();
    expect(within(row).getByText(/Added to the case on/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Add a file to the case' }).getAttribute('target')).toBe('_blank');
    expect(user).toBeTruthy();
    cleanup();

    await renderSection(piecesDraft(), null);
    expect(screen.getByText('The list of case files is not available on this screen.')).toBeTruthy();
  });
});

describe('the file of a piece disappeared or changed', () => {
  const guidance = /remove this attachment, then add the case file again/;

  it('(c) shows ATTACHMENT_MISSING from the last export with the remove / re-add guidance', async () => {
    await renderSection(
      piecesDraft({
        pieces: [piece('p1', FILE.one)],
        exportDiagnostics: [piecesDiagnostic('ATTACHMENT_MISSING', 'p1')],
      }),
    );
    const first = card(1);
    expect(within(first).getByText(/no longer in the case: it will be left out of the export/)).toBeTruthy();
    expect(within(first).getByText(/Found during the export of revision 3/)).toBeTruthy();
    const text = within(first).getByText(guidance).textContent!;
    expect(text).toContain('enter its details and the references to it from the persons again');
  });

  it('(c) also shows a file the case no longer lists, and a piece with no file at all', async () => {
    await renderSection(
      piecesDraft({ pieces: [piece('p1', '0a1b2c3d-5555-4555-8555-000000000005'), piece('p2', null)] }),
    );
    expect(within(card(1)).getByText(/no longer in the case/)).toBeTruthy();
    expect(within(card(1)).getByText('This file no longer appears in the list of case files.')).toBeTruthy();
    expect(within(card(2)).getByText(/No case file is linked to this attachment/)).toBeTruthy();
    expect(within(card(2)).getByText(guidance)).toBeTruthy();
  });

  it('(d) shows ATTACHMENT_CHANGED, from the draft diagnostics or from the export report', async () => {
    await renderSection(
      piecesDraft({
        pieces: [piece('p1', FILE.one), piece('p2', FILE.two)],
        diagnostics: [piecesDiagnostic('ATTACHMENT_CHANGED', 'p1')],
        exportDiagnostics: [piecesDiagnostic('ATTACHMENT_CHANGED', 'p2')],
      }),
    );
    for (const index of [1, 2]) {
      expect(within(card(index)).getByText(/changed since it was added \(content or location\)/)).toBeTruthy();
      expect(within(card(index)).getByText(guidance)).toBeTruthy();
    }
  });

  it('shows no alert on a healthy piece', async () => {
    await renderSection(piecesDraft({ pieces: [piece('p1', FILE.one)] }));
    expect(within(card(1)).queryByText(guidance)).toBeNull();
  });
});

describe('server refusals', () => {
  async function withPendingEdit() {
    const rendered = await renderSection(piecesDraft({ pieces: [piece('p1', FILE.one)] }));
    const name = within(card(1)).getByRole('textbox', { name: 'Nom' });
    await rendered.user.type(name, 'Scan');
    expect(probe()).toBe('idle|1|none|3');
    return { ...rendered, name };
  }

  it('(e) 403 on a foreign file: explicit message, nothing changes, every other pending edit is kept', async () => {
    const { user, backend, name } = await withPendingEdit();

    // fireEvent: no blur, so the typed edit is still unsent when the click happens.
    fireEvent.click(addButton('stranger.pdf'));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    // The refused PATCH carried the pending edit first, then the piece.
    expect(backend.bodies[0]!.changes.map((change) => change.action)).toEqual(['set_field', 'add_block']);
    expect(backend.bodies[0]!.changes[1]!.source_file_id).toBe(FILE.foreign);

    const banner = await refusal('« stranger.pdf » does not belong to this case');
    expect(banner.textContent).toContain('Nothing was changed and your other unsaved edits are kept');
    // No state change: same revision, no piece, editor idle with its pending edit and no failure.
    expect(backend.draft.revision).toBe(3);
    expect(probe()).toBe('idle|1|none|3');
    expect((name as HTMLInputElement).value).toBe('Scan');
    expect(screen.getAllByRole('region', { name: /^Attachment no\./ })).toHaveLength(1);

    // The pending edit is still sent later, alone, on the same revision; the foreign file is never resent.
    await user.click(screen.getByRole('button', { name: 'probe flush' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(2));
    expect(backend.bodies[1]!.changes).toHaveLength(1);
    expect(backend.bodies[1]!.changes[0]).toMatchObject({ action: 'set_field', value: { kind: 'text', text: 'Scan' } });
    expect(backend.bodies[1]!.expected_revision).toBe(3);
    await waitFor(() => expect(probe()).toBe('idle|0|none|4'));
  });

  it('413 is the technical limit, not a regulatory one, and changes nothing either', async () => {
    const { backend } = await withPendingEdit();
    backend.failures.push({ kind: 'too_large', status: 413, message: 'TRACFIN_ATTACHMENT_SIZE_LIMIT' });

    fireEvent.click(addButton('invoice-march.pdf'));
    const alert = await refusal('technical size');
    expect(alert.textContent).toContain('technical size limit of attachments (64 MiB of cumulated files)');
    expect(alert.textContent).toContain('not a regulatory rule');
    expect(probe()).toBe('idle|1|none|3');
    expect(backend.draft.revision).toBe(3);
  });

  it('404 on a file that is gone says so and changes nothing', async () => {
    const { user, backend } = await renderSection(piecesDraft());
    backend.caseFiles.delete(FILE.one);
    await user.click(addButton('passport.pdf'));
    await refusal('no longer exists in the case');
    expect(probe()).toBe('idle|0|none|3');
  });

  it('an uncertain failure (5xx) goes through the editor failure path, with retry', async () => {
    const { user, backend } = await renderSection(piecesDraft());
    backend.failures.push({ kind: 'server', status: 503, message: 'down' });
    await user.click(addButton('passport.pdf'));
    await waitFor(() => expect(probe()).toMatch(/^failed\|/));
    expect(screen.queryByText(/does not belong to this case/)).toBeNull();
  });
});

describe('piece card', () => {
  it('edits the metadata with the generic editor and never shows the calculated fields', async () => {
    const { user, backend } = await renderSection(piecesDraft({ pieces: [piece('p1', FILE.one)] }));
    const first = card(1);
    expect(within(first).queryByText('Contenu')).toBeNull();
    expect(within(first).getByText(/never prefilled/)).toBeTruthy();
    // The MIME list does not ship with the backend: free text, with the note, nothing invented.
    expect(within(first).getByRole('textbox', { name: 'Type mime' })).toBeTruthy();
    expect(within(first).getByText(/code list is not available: type the value directly/)).toBeTruthy();

    await user.type(within(first).getByRole('textbox', { name: 'Libelle' }), 'Passeport');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'probe flush' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([
      {
        action: 'set_field',
        field: { block_id: 'p1', field_id: '/ds/pieceJointe/piece/libelle' },
        value: { kind: 'text', text: 'Passeport' },
      },
    ]);
    expect(await screen.findByRole('heading', { name: 'Passeport' })).toBeTruthy();
  });

  it('lists who uses the piece', async () => {
    await renderSection(
      piecesDraft({
        pieces: [piece('p1', FILE.one), piece('p2', FILE.two)],
        mutate: (draft) => {
          const civil = draft.document.root
            .children!.find((child) => child.catalog_id === '/ds/personnes')!
            .children![0]!.children!.find((child) => child.id === 'civil-1')!;
          civil.fields!['/ds/personnes/pp/etatCivil/idPieceJointe'] = [reference('r1', 'p1')];
        },
      }),
    );
    expect(within(card(1)).getByText('Referenced by')).toBeTruthy();
    expect(within(card(1)).getByText('Jeanne Martin')).toBeTruthy();
    expect(within(card(2)).getByText(/No person references this attachment/)).toBeTruthy();
  });

  it('removes a piece after a confirmation, with one remove_block', async () => {
    const { user, backend } = await renderSection(piecesDraft({ pieces: [piece('p1', FILE.one)] }));
    await user.click(within(card(1)).getByRole('button', { name: /Delete|Remove/ }));
    await user.click(await screen.findByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(backend.bodies).toHaveLength(1));
    expect(backend.lastBody.changes).toEqual([{ action: 'remove_block', block_id: 'p1' }]);
    // The file is free again.
    expect(await screen.findByRole('button', { name: 'Add « passport.pdf » as an attachment' })).toBeTruthy();
  });
});

// Used by the type checker: `text` is part of the shared test vocabulary.
void text;
