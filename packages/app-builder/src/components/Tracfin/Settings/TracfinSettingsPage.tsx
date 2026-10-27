import { Page } from '@app-builder/components/Page';
import { isTracfinRequestError, type TracfinConfiguration } from '@app-builder/models/tracfin';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useTracfinCatalogQuery } from '@app-builder/queries/tracfin/get-catalog';
import { useTracfinConfigurationQuery } from '@app-builder/queries/tracfin/get-configuration';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ErrorBanner } from './ErrorBanner';
import { TracfinConfigurationEditor } from './TracfinConfigurationEditor';

/**
 * Loads the catalog, the data model and the configuration, and mounts the editor once all three are
 * known. A failure (a 403 included) is an error state: it is never shown as an empty configuration,
 * which a save would then try to create over the real one.
 */
export function TracfinSettingsPage() {
  const { t } = useTranslation(['tracfin']);
  const catalogQuery = useTracfinCatalogQuery();
  const configurationQuery = useTracfinConfigurationQuery();
  const dataModelQuery = useDataModelQuery();

  // The editor starts from the first fresh answer; cached data is only a placeholder until it settles.
  const [loaded, setLoaded] = useState<{ configuration: TracfinConfiguration | null } | null>(null);
  useEffect(() => {
    if (loaded === null && configurationQuery.isSuccess && !configurationQuery.isFetching) {
      setLoaded({ configuration: configurationQuery.data });
    }
  }, [loaded, configurationQuery.isSuccess, configurationQuery.isFetching, configurationQuery.data]);

  const catalogIndex = useMemo(
    () => (catalogQuery.data ? getTracfinCatalogIndex(catalogQuery.data.profile) : null),
    [catalogQuery.data],
  );

  const failedQuery = [configurationQuery, catalogQuery, dataModelQuery].find(
    (query) => query.isError && query.data === undefined,
  );
  if (failedQuery) {
    const forbidden = isTracfinRequestError(failedQuery.error) && failedQuery.error.error.kind === 'forbidden';
    const message =
      !forbidden && failedQuery.error instanceof Error && failedQuery.error.message ? failedQuery.error.message : null;
    return (
      <Page.Content width="readable">
        <ErrorBanner>
          <p className="font-semibold">
            {forbidden ? t('tracfin:settings.load_forbidden') : t('tracfin:settings.load_failed')}
          </p>
          {message ? <p className="font-mono text-xs">{message}</p> : null}
          {forbidden ? null : (
            <Button
              variant="secondary"
              appearance="stroked"
              className="self-start"
              onClick={() => {
                for (const query of [configurationQuery, catalogQuery, dataModelQuery]) {
                  if (query.isError) void query.refetch();
                }
              }}
            >
              {t('tracfin:settings.retry')}
            </Button>
          )}
        </ErrorBanner>
      </Page.Content>
    );
  }

  if (loaded === null || catalogIndex === null || !dataModelQuery.data) {
    return (
      <Page.Content width="readable">
        <p className="text-s text-grey-secondary" role="status">
          {t('tracfin:settings.loading')}
        </p>
      </Page.Content>
    );
  }

  return (
    <TracfinConfigurationEditor
      initialConfiguration={loaded.configuration}
      catalogIndex={catalogIndex}
      dataModel={dataModelQuery.data.dataModel}
      reloadConfiguration={async () => {
        const result = await configurationQuery.refetch();
        if (result.isError) throw result.error;
        return result.data ?? null;
      }}
    />
  );
}
