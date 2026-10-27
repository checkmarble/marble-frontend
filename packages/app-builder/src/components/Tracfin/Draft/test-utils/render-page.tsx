import type { TracfinDraft, TracfinDraftInput, TracfinResult } from '@app-builder/models/tracfin';
import { useTracfinDraftQuery } from '@app-builder/queries/tracfin/get-draft';
import '@app-builder/tests/setup/i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import i18next from 'i18next';
import { type ReactNode, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Tooltip } from 'ui-design-system';
import { vi } from 'vitest';
import { TracfinDraftEditorProvider } from '../editor/TracfinDraftEditorContext';
import type { TracfinSectionId } from '../model/sections';
import { TracfinDraftPage } from '../TracfinDraftPage';
import { draftTestCatalog, draftTestIndex } from './draft-test-data';
import type { FakeDraftBackend } from './fake-backend';

export const CASE_ID = '2c1f0a9e-84b4-4f3c-9a55-0d6a8f6a8c11';

/** The mocked server functions every draft spec registers with `vi.mock('@app-builder/server-fns/tracfin', ...)`. */
export const makeServerMocks = () => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
});

export type ServerMocks = ReturnType<typeof makeServerMocks>;

/** A promise settled from outside, to hold a PATCH in flight. */
export function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

export const ok = <T,>(data: T): TracfinResult<T> => ({ ok: true, data });

/** Wires the mocks to an in-memory backend (reads return its draft, PATCH goes through its rules). */
export function connectBackend(mocks: ServerMocks, backend: FakeDraftBackend) {
  mocks.getCatalog.mockResolvedValue(ok(draftTestCatalog));
  mocks.getDraft.mockImplementation(async () => ok(structuredClone(backend.draft)));
  mocks.patchDraft.mockImplementation(async ({ data }: { data: { body: TracfinDraftInput } }) =>
    backend.patch(data.body),
  );
}

export async function renderDraftPage({
  initialSection = 'declaration',
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
}: {
  initialSection?: TracfinSectionId;
  queryClient?: QueryClient;
} = {}) {
  const user = userEvent.setup();
  let currentSection: TracfinSectionId = initialSection;

  function Harness() {
    const [section, setSection] = useState<TracfinSectionId>(initialSection);
    currentSection = section;
    return <TracfinDraftPage caseId={CASE_ID} section={section} onSectionChange={setSection} />;
  }

  render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18next}>
        <Tooltip.Provider delayDuration={0}>
          <Harness />
        </Tooltip.Provider>
      </I18nextProvider>
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { level: 1 });
  return { user, queryClient, section: () => currentSection };
}

/** Renders some UI under the editor provider, without the page shell (to exercise a block editor on its own). */
export async function renderWithEditor(
  ui: (draft: TracfinDraft) => ReactNode,
  {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }),
  } = {},
) {
  const user = userEvent.setup();

  function Harness() {
    const draftQuery = useTracfinDraftQuery(CASE_ID);
    if (!draftQuery.data) return <p>loading</p>;
    return (
      <TracfinDraftEditorProvider caseId={CASE_ID} draft={draftQuery.data} catalogIndex={draftTestIndex}>
        <h1>editor</h1>
        {ui(draftQuery.data)}
      </TracfinDraftEditorProvider>
    );
  }

  render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18next}>
        <Tooltip.Provider delayDuration={0}>
          <Harness />
        </Tooltip.Provider>
      </I18nextProvider>
    </QueryClientProvider>,
  );
  await screen.findByRole('heading', { name: 'editor', hidden: true });
  return { user, queryClient };
}

export type { TracfinDraft };
