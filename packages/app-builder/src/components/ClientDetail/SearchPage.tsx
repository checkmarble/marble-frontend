import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { Client360SearchPayload } from '@app-builder/schemas/client360';
import { Client360Table } from 'marble-api';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'ui-design-system';
import { Icon } from 'ui-icons';
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
      <Page.Content className="gap-md">
        <div className="flex justify-between mb-md">
          <div className="text-h1 font-semibold">{t('client360:client_detail.search_page.breadcrumb')}</div>
          <AddConfigurationModal
            disabled={!dataModelQuery.isSuccess}
            tables={tables}
            dataModel={dataModelQuery.data?.dataModel ?? []}
          />
        </div>

        {/* TODO: Must change to Callout when new component is done */}
        {tables.length === 0 ? (
          <Card className="flex items-center gap-sm">
            <Icon icon="tip" className="size-5" />
            <span>{t('client360:client_detail.search_page.no_configuration')}</span>
          </Card>
        ) : (
          <div className="grid grid-cols-[1fr_40px_1fr] gap-lg border border-grey-border rounded-lg p-md bg-surface-card">
            {tables.map((table, idx) => {
              return (
                <Fragment key={table.id}>
                  <SearchForm table={table} />
                  {idx < tables.length - 1 && idx % 2 === 0 ? (
                    <div className="text-center self-center pt-lg">{t('common:or')}</div>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        )}
        {currentSearchPayload ? <SearchResults payload={currentSearchPayload} tables={tables} /> : null}
      </Page.Content>
    </Page.Main>
  );
};
