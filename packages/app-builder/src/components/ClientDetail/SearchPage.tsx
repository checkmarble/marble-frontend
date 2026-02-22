import { Client360SearchPayload } from '@app-builder/queries/client360/search';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { Client360Table } from 'marble-api';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { BreadCrumbs } from '../Breadcrumbs';
import { Page } from '../Page';
import { AddConfigurationModal } from './AddConfigurationModal';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';

export const ClientDetailSearchPage = ({
  tables,
  payload,
}: {
  tables: Client360Table[];
  payload: Client360SearchPayload | null;
}) => {
  const { t } = useTranslation(['common', 'client360']);
  const [currentSearchPayload, setCurrentSearchPayload] = useState<Client360SearchPayload | null>(payload);
  const dataModelQuery = useDataModelQuery();

  useEffect(() => {
    setCurrentSearchPayload(payload);
  }, [payload]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <AddConfigurationModal
          disabled={!dataModelQuery.isSuccess}
          tables={tables}
          dataModel={dataModelQuery.data?.dataModel ?? []}
        />
      </Page.Header>
      <Page.Container>
        <Page.ContentV2 paddingLess={tables.length === 0}>
          {/* TODO: Must change to Callout when new component is done */}
          {tables.length === 0 ? (
            <div className="bg-background-light border-b border-grey-border px-v2-xl py-v2-md flex items-center gap-v2-sm">
              <Icon icon="tip" className="size-5" />
              <span>{t('client360:client_detail.search_page.no_configuration')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_40px_1fr] gap-v2-lg border border-grey-border rounded-lg p-v2-md bg-surface-card">
              {tables.map((table, idx) => {
                return (
                  <Fragment key={table.id}>
                    <SearchForm table={table} />
                    {idx < tables.length - 1 && idx % 2 === 0 ? (
                      <div className="text-center self-center pt-6">{t('common:or')}</div>
                    ) : null}
                  </Fragment>
                );
              })}
            </div>
          )}
          {currentSearchPayload ? <SearchResults payload={currentSearchPayload} tables={tables} /> : null}
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
