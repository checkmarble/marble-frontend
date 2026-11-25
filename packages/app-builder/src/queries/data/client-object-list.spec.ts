import { type ClientObjectDetail } from '@app-builder/models/data-model';
import { type InfiniteData, QueryClient } from '@tanstack/react-query';
import { type GroupedAnnotations } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { type DataTableObjectListResource, setClientObjectListAnnotations } from './client-object-list';

type CachedList = InfiniteData<DataTableObjectListResource, string | number | null>;

const EMPTY_ANNOTATIONS: GroupedAnnotations = { comments: [], tags: [], files: [], risk_tags: [] };
const freshAnnotations: GroupedAnnotations = {
  ...EMPTY_ANNOTATIONS,
  comments: [
    {
      id: 'comment-1',
      case_id: 'case-1',
      object_type: 'transactions',
      object_id: 'tx-1',
      type: 'comment',
      payload: { text: 'Checked with the client' },
      annotated_by: 'user-1',
      created_at: '2026-11-20T10:00:00Z',
    },
  ],
};

function row(objectId: string): ClientObjectDetail {
  return {
    metadata: { objectType: 'transactions', canBeAnnotated: true },
    data: { object_id: objectId, updated_at: '2026-11-01T00:00:00Z' },
    relatedObjects: [],
    annotations: EMPTY_ANNOTATIONS,
  };
}

function list(...pages: string[][]): CachedList {
  return {
    pages: pages.map((objectIds) => ({
      clientDataListResponse: {
        data: objectIds.map(row),
        metadata: { fieldStatistics: {} },
        pagination: { hasNextPage: false },
      },
    })),
    pageParams: pages.map((_, index) => (index === 0 ? null : `cursor-${index}`)),
  };
}

const listKey = (tableName: string, filterFieldValue: string) => [
  'resources',
  'data-list-object',
  tableName,
  { sourceTableName: 'accounts', filterFieldName: 'account_id', filterFieldValue, orderingFieldName: 'updated_at' },
];

// The annotations of each row, page by page.
const annotationsOf = (data: CachedList | undefined) =>
  data?.pages.map((page) => page.clientDataListResponse.data.map((detail) => detail.annotations));

describe('setClientObjectListAnnotations', () => {
  it('updates the rows of the object on every page of every cached list of its table', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(listKey('transactions', 'acc-1'), list(['tx-1', 'tx-2'], ['tx-3', 'tx-1']));
    queryClient.setQueryData(listKey('transactions', 'acc-2'), list(['tx-4'], ['tx-1']));

    setClientObjectListAnnotations(queryClient, 'transactions', 'tx-1', freshAnnotations);

    const first = queryClient.getQueryData<CachedList>(listKey('transactions', 'acc-1'));
    expect(annotationsOf(first)).toEqual([
      [freshAnnotations, EMPTY_ANNOTATIONS],
      [EMPTY_ANNOTATIONS, freshAnnotations],
    ]);
    expect(annotationsOf(queryClient.getQueryData(listKey('transactions', 'acc-2')))).toEqual([
      [EMPTY_ANNOTATIONS],
      [freshAnnotations],
    ]);
    // Load more keeps paginating from the same cursors.
    expect(first?.pageParams).toEqual([null, 'cursor-1']);
  });

  it('leaves the other rows and the lists of other tables untouched', () => {
    const queryClient = new QueryClient();
    const transactions = list(['tx-1', 'tx-2']);
    const otherTable = list(['tx-1']);
    queryClient.setQueryData(listKey('transactions', 'acc-1'), transactions);
    queryClient.setQueryData(listKey('payments', 'acc-1'), otherTable);

    setClientObjectListAnnotations(queryClient, 'transactions', 'tx-1', freshAnnotations);

    const updated = queryClient.getQueryData<CachedList>(listKey('transactions', 'acc-1'));
    expect(updated?.pages[0]?.clientDataListResponse.data[1]).toBe(
      transactions.pages[0]?.clientDataListResponse.data[1],
    );
    expect(queryClient.getQueryData(listKey('payments', 'acc-1'))).toBe(otherTable);
  });

  it('writes again once a list fetch already in flight lands, since it stores the pages it read before', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(listKey('transactions', 'acc-1'), list(['tx-1']));
    let land: ((data: CachedList) => void) | undefined;
    // A "Load more" started before the change: it resolves with pages read before the write.
    const inFlight = queryClient.fetchQuery({
      queryKey: listKey('transactions', 'acc-1'),
      queryFn: () => new Promise<CachedList>((resolve) => (land = resolve)),
    });

    const done = setClientObjectListAnnotations(queryClient, 'transactions', 'tx-1', freshAnnotations);
    land?.(list(['tx-1'], ['tx-2']));
    await inFlight;
    await done;

    expect(annotationsOf(queryClient.getQueryData(listKey('transactions', 'acc-1')))).toEqual([
      [freshAnnotations],
      [EMPTY_ANNOTATIONS],
    ]);
  });

  it('does nothing when no list of the table is cached', () => {
    const queryClient = new QueryClient();

    setClientObjectListAnnotations(queryClient, 'transactions', 'tx-1', freshAnnotations);

    expect(queryClient.getQueryCache().getAll()).toEqual([]);
  });
});
