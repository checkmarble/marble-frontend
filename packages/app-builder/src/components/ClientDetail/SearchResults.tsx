import { Client360SearchPayload, useSearchClient360Query } from '@app-builder/queries/client360/search';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { getRoute } from '@app-builder/utils/routes';
import { Link } from '@remix-run/react';
import { Client360Table } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Tag } from 'ui-design-system';
import { Highlight } from '../Highlight';
import { Spinner } from '../Spinner';

export const SearchResults = ({ payload, tables }: { payload: Client360SearchPayload; tables: Client360Table[] }) => {
  const { t } = useTranslation(['common']);
  const searchQuery = useSearchClient360Query(payload);
  const metadata = tables.find((table) => table.name === payload.table);

  if (!metadata) {
    return <div>Could not find metadata for table {payload.table}</div>;
  }

  return match(searchQuery)
    .with({ isPending: true }, () => (
      <div className="mt-v2-lg h-50 flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="mt-v2-lg h-50 flex items-center justify-center">
        <span className="text-center">{t('common:generic_fetch_data_error')}</span>
        <Button variant="secondary" onClick={() => searchQuery.refetch()}>
          {t('common:retry')}
        </Button>
      </div>
    ))
    .with({ isSuccess: true }, ({ data }) => {
      return (
        <div className="flex flex-col gap-v2-sm mt-v2-lg">
          {data.pages
            .flatMap((page) => page.items)
            .map((item) => {
              return (
                <Link
                  to={getRoute('/client-detail/:objectType/:objectId', {
                    objectType: payload.table,
                    objectId: item['object_id'] as string,
                  })}
                  key={item['object_id'] as string}
                  className="p-v2-md flex items-center border border-grey-border rounded-v2-md bg-surface-card hover:shadow-md dark:hover:border-purple-primary"
                >
                  <Highlight
                    text={item[metadata.caption_field] as string}
                    query={payload.terms}
                    markClassName="bg-yellow-background dark:bg-yellow-primary/30 text-grey-primary"
                    className="min-w-100"
                  />
                  <span className="py-v2-xs px-v2-sm font-mono text-tiny border border-grey-border rounded-v2-md">
                    {item['object_id'] as string}
                  </span>
                  <EntityTags objectType={payload.table} objectId={item['object_id'] as string} />
                </Link>
              );
            })}
          {searchQuery.hasNextPage ? (
            <div>
              <Button variant="secondary" size="small" onClick={() => searchQuery.fetchNextPage()}>
                {t('common:load_more_results')}
              </Button>
            </div>
          ) : null}
        </div>
      );
    })
    .exhaustive();
};

const EntityTags = ({ objectType, objectId }: { objectType: string; objectId: string }) => {
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId);
  const { orgObjectTags } = useOrganizationObjectTags();

  return match(annotationsQuery)
    .with({ isPending: true }, () => <div>Loading...</div>)
    .with({ isError: true }, () => <div>Error</div>)
    .with({ isSuccess: true }, ({ data }) => {
      return (
        <div className="flex items-center gap-v2-sm ml-10">
          {data.annotations.tags.map((tagAnnotation) => {
            const tag = orgObjectTags.find((t) => t.id === tagAnnotation.payload.tag_id);
            return tag ? <Tag key={tag.id}>{tag.name}</Tag> : null;
          })}
        </div>
      );
    })
    .exhaustive();
};
