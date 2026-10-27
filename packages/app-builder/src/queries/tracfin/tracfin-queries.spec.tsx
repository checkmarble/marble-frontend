import {
  type TracfinApiError,
  type TracfinDraft,
  type TracfinResult,
  type TracfinSelection,
} from '@app-builder/models/tracfin';
import {
  tracfinCatalogFixture,
  tracfinConfigurationFixture,
  tracfinDraftFixture,
  tracfinExportFixture,
} from '@app-builder/models/tracfin/__fixtures__';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTracfinCreateDraftMutation } from './create-draft';
import { useTracfinExportMutation } from './export-draft';
import { useTracfinCatalogQuery } from './get-catalog';
import { useTracfinConfigurationQuery } from './get-configuration';
import { useTracfinDraftQuery } from './get-draft';
import { tracfinKeys } from './keys';
import { useTracfinNavigationQuery } from './navigate';
import { useTracfinPatchDraftMutation } from './patch-draft';

const mocks = vi.hoisted(() => ({
  getCatalog: vi.fn(),
  getConfiguration: vi.fn(),
  getDraft: vi.fn(),
  createDraft: vi.fn(),
  patchDraft: vi.fn(),
  exportDraft: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@app-builder/server-fns/tracfin', () => ({
  getTracfinCatalogFn: mocks.getCatalog,
  getTracfinConfigurationFn: mocks.getConfiguration,
  getTracfinDraftFn: mocks.getDraft,
  createTracfinDraftFn: mocks.createDraft,
  patchTracfinDraftFn: mocks.patchDraft,
  exportTracfinDraftFn: mocks.exportDraft,
  navigateTracfinFn: mocks.navigate,
}));
vi.mock('@tanstack/react-start', () => ({ useServerFn: (fn: unknown) => fn }));

const caseId = tracfinDraftFixture.case_id;
const ok = <T,>(data: T): TracfinResult<T> => ({ ok: true, data });
const failed = (error: Partial<TracfinApiError> & Pick<TracfinApiError, 'kind'>): TracfinResult<never> => ({
  ok: false,
  error: { status: null, message: null, ...error },
});

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
});

describe('useTracfinCatalogQuery', () => {
  it('loads the catalog once and keeps it fresh forever', async () => {
    mocks.getCatalog.mockResolvedValue(ok(tracfinCatalogFixture));
    const { result } = renderHook(() => useTracfinCatalogQuery(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(tracfinCatalogFixture));
    expect(queryClient.getQueryCache().find({ queryKey: tracfinKeys.catalog() })?.isStale()).toBe(false);
  });
});

describe('useTracfinDraftQuery', () => {
  it('returns the draft', async () => {
    mocks.getDraft.mockResolvedValue(ok(tracfinDraftFixture));
    const { result } = renderHook(() => useTracfinDraftQuery(caseId), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(tracfinDraftFixture));
    expect(mocks.getDraft).toHaveBeenCalledWith({ data: { caseId } });
  });

  it('treats a 404 as "no draft yet", not as an error', async () => {
    mocks.getDraft.mockResolvedValue(failed({ kind: 'not_found', status: 404, message: 'not found' }));
    const { result } = renderHook(() => useTracfinDraftQuery(caseId), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fails with the API error for anything else', async () => {
    mocks.getDraft.mockResolvedValue(failed({ kind: 'forbidden', status: 403, message: 'no access' }));
    const { result } = renderHook(() => useTracfinDraftQuery(caseId), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      name: 'TracfinRequestError',
      error: { kind: 'forbidden', status: 403 },
    });
  });
});

describe('useTracfinConfigurationQuery', () => {
  it('returns null when the organization has no configuration yet', async () => {
    mocks.getConfiguration.mockResolvedValue(failed({ kind: 'not_found', status: 404 }));
    const { result } = renderHook(() => useTracfinConfigurationQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it('returns the configuration, and a forbidden user gets an error', async () => {
    mocks.getConfiguration.mockResolvedValueOnce(ok(tracfinConfigurationFixture));
    const { result } = renderHook(() => useTracfinConfigurationQuery(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(tracfinConfigurationFixture));

    queryClient.clear();
    mocks.getConfiguration.mockResolvedValueOnce(failed({ kind: 'forbidden', status: 403 }));
    const forbidden = renderHook(() => useTracfinConfigurationQuery(), { wrapper });
    await waitFor(() => expect(forbidden.result.current.isError).toBe(true));
  });
});

describe('draft mutations', () => {
  const nextDraft: TracfinDraft = { ...tracfinDraftFixture, revision: tracfinDraftFixture.revision + 1 };

  it('write the draft returned by a patch into the draft query cache', async () => {
    queryClient.setQueryData(tracfinKeys.draft(caseId), tracfinDraftFixture);
    mocks.patchDraft.mockResolvedValue(ok(nextDraft));
    const { result } = renderHook(() => useTracfinPatchDraftMutation(caseId), { wrapper });

    const body = {
      expected_revision: tracfinDraftFixture.revision,
      changes: [{ action: 'clear_field' as const, field: { block_id: 'b', field_id: '/ds/analyse' } }],
    };
    await act(() => result.current.mutateAsync(body));

    expect(mocks.patchDraft).toHaveBeenCalledWith({ data: { caseId, body } });
    expect(queryClient.getQueryData(tracfinKeys.draft(caseId))).toEqual(nextDraft);
  });

  it('keep the cached draft and throw the conflict when the revision is stale', async () => {
    queryClient.setQueryData(tracfinKeys.draft(caseId), tracfinDraftFixture);
    mocks.patchDraft.mockResolvedValue(failed({ kind: 'conflict', status: 409, message: 'stale revision' }));
    const { result } = renderHook(() => useTracfinPatchDraftMutation(caseId), { wrapper });

    await act(async () => {
      await expect(
        result.current.mutateAsync({ expected_revision: 1, changes: [{ action: 'refresh_configuration' }] }),
      ).rejects.toMatchObject({ error: { kind: 'conflict', status: 409 } });
    });
    expect(queryClient.getQueryData(tracfinKeys.draft(caseId))).toEqual(tracfinDraftFixture);
  });

  it('write the created draft into the draft query cache', async () => {
    queryClient.setQueryData(tracfinKeys.draft(caseId), null);
    mocks.createDraft.mockResolvedValue(ok(tracfinDraftFixture));
    const { result } = renderHook(() => useTracfinCreateDraftMutation(caseId), { wrapper });

    await act(() => result.current.mutateAsync({ declarant_is_actor: false }));

    expect(mocks.createDraft).toHaveBeenCalledWith({ data: { caseId, body: { declarant_is_actor: false } } });
    expect(queryClient.getQueryData(tracfinKeys.draft(caseId))).toEqual(tracfinDraftFixture);
  });

  it('record the new export as the last export of the cached draft', async () => {
    queryClient.setQueryData(tracfinKeys.draft(caseId), tracfinDraftFixture);
    mocks.exportDraft.mockResolvedValue(ok(tracfinExportFixture));
    const { result } = renderHook(() => useTracfinExportMutation(caseId), { wrapper });

    await act(() => result.current.mutateAsync({ expected_revision: tracfinDraftFixture.revision }));

    expect(queryClient.getQueryData<TracfinDraft>(tracfinKeys.draft(caseId))).toEqual({
      ...tracfinDraftFixture,
      last_export: tracfinExportFixture,
    });
  });

  it.each(['timeout', 'server', 'network'] as const)(
    're-reads the draft after an export that failed with %s, since the outcome is uncertain',
    async (kind) => {
      mocks.getDraft.mockResolvedValue(ok(tracfinDraftFixture));
      const draft = renderHook(() => useTracfinDraftQuery(caseId), { wrapper });
      await waitFor(() => expect(draft.result.current.data).toBeDefined());
      expect(mocks.getDraft).toHaveBeenCalledTimes(1);

      mocks.exportDraft.mockResolvedValue(failed({ kind, status: kind === 'network' ? null : 504 }));
      const { result } = renderHook(() => useTracfinExportMutation(caseId), { wrapper });
      await act(async () => {
        await expect(result.current.mutateAsync({ expected_revision: 3 })).rejects.toMatchObject({ error: { kind } });
      });

      await waitFor(() => expect(mocks.getDraft).toHaveBeenCalledTimes(2));
    },
  );

  it('does not re-read the draft after an export the server refused', async () => {
    mocks.getDraft.mockResolvedValue(ok(tracfinDraftFixture));
    const draft = renderHook(() => useTracfinDraftQuery(caseId), { wrapper });
    await waitFor(() => expect(draft.result.current.data).toBeDefined());

    mocks.exportDraft.mockResolvedValue(failed({ kind: 'unprocessable', status: 422, message: 'forbidden character' }));
    const { result } = renderHook(() => useTracfinExportMutation(caseId), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync({ expected_revision: 3 })).rejects.toMatchObject({
        error: { kind: 'unprocessable' },
      });
    });

    expect(mocks.getDraft).toHaveBeenCalledTimes(1);
  });
});

describe('useTracfinNavigationQuery', () => {
  const selection: TracfinSelection = {
    mapping_id: 'map-employer-name',
    root: { id: 'root', table: 'users', record_id: 'user_8841' },
  };
  const page = (ids: string[], next?: string) => ({
    objects: ids.map((id) => ({ data: { object_id: id }, metadata: {} })),
    has_next_page: next !== undefined,
    ...(next === undefined ? {} : { next_cursor: next }),
    diagnostics: null,
  });

  it('exposes the pages as returned and follows the cursor', async () => {
    mocks.navigate.mockResolvedValueOnce(ok(page(['c1', 'c2'], 'cursor-1'))).mockResolvedValueOnce(ok(page(['c3'])));
    const { result } = renderHook(() => useTracfinNavigationQuery(caseId, selection, 'employer'), { wrapper });

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
    expect(result.current.hasNextPage).toBe(true);
    expect(mocks.navigate).toHaveBeenNthCalledWith(1, { data: { caseId, body: { selection, step_id: 'employer' } } });

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(mocks.navigate).toHaveBeenNthCalledWith(2, {
      data: { caseId, body: { selection, step_id: 'employer', cursor: 'cursor-1' } },
    });
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.data?.pages.map((p) => p.objects.map((o) => o.data['object_id']))).toEqual([
      ['c1', 'c2'],
      ['c3'],
    ]);
  });

  it('sends the page size when one is requested', async () => {
    mocks.navigate.mockResolvedValue(ok(page(['c1'])));
    const { result } = renderHook(() => useTracfinNavigationQuery(caseId, selection, 'employer', { limit: 50 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.navigate).toHaveBeenCalledWith({
      data: { caseId, body: { selection, step_id: 'employer', limit: 50 } },
    });
  });

  it('fails instead of ending the list when a page announces a next page without a cursor', async () => {
    mocks.navigate.mockResolvedValue(ok({ ...page(['c1']), has_next_page: true }));
    const { result } = renderHook(() => useTracfinNavigationQuery(caseId, selection, 'employer'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('reports an unavailable navigation index (422) as an error', async () => {
    mocks.navigate.mockResolvedValue(failed({ kind: 'unprocessable', status: 422, message: 'index unavailable' }));
    const { result } = renderHook(() => useTracfinNavigationQuery(caseId, selection, 'employer'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ error: { kind: 'unprocessable' } });
  });
});
