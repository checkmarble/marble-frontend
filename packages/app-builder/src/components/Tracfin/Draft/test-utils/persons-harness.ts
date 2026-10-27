import type {
  TracfinApiError,
  TracfinContextRoot,
  TracfinDraftInput,
  TracfinNavigateInput,
  TracfinNavigationPage,
  TracfinResult,
} from '@app-builder/models/tracfin';
import { tracfinDataModelFixture } from '@app-builder/models/tracfin/__fixtures__';
import { vi } from 'vitest';
import type { FakeDraftBackend } from './fake-backend';
import { personsTestCatalog } from './persons-test-data';
import { ok } from './render-page';

/** The server functions the persons section calls, to register with `vi.mock` (see the specs). */
export const makePersonsMocks = () => ({
  getCatalog: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  getContext: vi.fn(),
  navigate: vi.fn(),
  getDataModel: vi.fn(),
  getObjectDetails: vi.fn(),
});

export type PersonsMocks = ReturnType<typeof makePersonsMocks>;

export const unprocessable: TracfinApiError = { kind: 'unprocessable', status: 422, message: 'no navigation index' };

/** What the navigation endpoint answers, by step and by the records already chosen. */
export type NavigationAnswer = TracfinNavigationPage | TracfinApiError;

export type PersonsWorld = {
  roots?: TracfinContextRoot[];
  /** Answers a navigate request; the default is « no object ». */
  navigation?: (body: TracfinNavigateInput) => NavigationAnswer;
  /** Data of the records the object details are asked for (`table/id`). */
  records?: Record<string, Record<string, unknown>>;
};

const isError = (answer: NavigationAnswer): answer is TracfinApiError => 'kind' in answer;

export function page(
  ids: string[],
  { next, extra }: { next?: string; extra?: (id: string) => Record<string, unknown> } = {},
): TracfinNavigationPage {
  return {
    objects: ids.map((id) => ({ data: { object_id: id, ...extra?.(id) }, metadata: {} })),
    has_next_page: next !== undefined,
    ...(next !== undefined ? { next_cursor: next } : {}),
    diagnostics: [],
  };
}

/** Wires every mocked server function to an in-memory backend and a scripted client base. */
export function connectPersons(mocks: PersonsMocks, backend: FakeDraftBackend, world: PersonsWorld = {}) {
  mocks.getCatalog.mockResolvedValue(ok(personsTestCatalog));
  mocks.getDraft.mockImplementation(async () => ok(structuredClone(backend.draft)));
  mocks.patchDraft.mockImplementation(async ({ data }: { data: { body: TracfinDraftInput } }) =>
    backend.patch(data.body),
  );
  mocks.getContext.mockResolvedValue(ok({ roots: world.roots ?? [], diagnostics: [] }));
  mocks.navigate.mockImplementation(async ({ data }: { data: { body: TracfinNavigateInput } }) => {
    const answer = world.navigation?.(data.body) ?? page([]);
    return isError(answer) ? ({ ok: false, error: answer } satisfies TracfinResult<never>) : ok(answer);
  });
  mocks.getDataModel.mockResolvedValue({ dataModel: tracfinDataModelFixture });
  mocks.getObjectDetails.mockImplementation(async ({ data }: { data: { objectType: string; objectId: string } }) => ({
    data: world.records?.[`${data.objectType}/${data.objectId}`] ?? { object_id: data.objectId },
    metadata: { validFrom: '2026-01-01' },
  }));
}
