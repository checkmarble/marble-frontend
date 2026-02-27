import { Page } from '@app-builder/components';
import { CreateTable } from '@app-builder/components/Data/CreateTable';
import { DataTabs } from '@app-builder/components/Data/DataTabs';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { ImportOrg } from '@app-builder/components/Data/ImportOrg';
import { SelectArchetype } from '@app-builder/components/Data/SelectArchetype';
import { TableDetails } from '@app-builder/components/Data/TableDetails';
import { useExportOrgMutation } from '@app-builder/queries/data/export-org';
import { useDataModel, useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export default function DataList() {
  const { t } = useTranslation(handle.i18n);
  const dataModel = useDataModel();
  const { isCreateDataModelTableAvailable } = useDataModelFeatureAccess();
  const exportOrgMutation = useExportOrgMutation();

  const isEmpty = dataModel.length === 0;

  return (
    <Page.Container>
      <Page.Content>
        <DataTabs
          actions={
            !isEmpty ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  appearance="stroked"
                  onClick={() => exportOrgMutation.mutate()}
                  disabled={exportOrgMutation.isPending}
                >
                  {exportOrgMutation.isPending ? (
                    <Icon icon="spinner" className="size-5 animate-spin" />
                  ) : (
                    <Icon icon="download" className="size-5" />
                  )}
                  {t('data:export_org.button')}
                </Button>
                {isCreateDataModelTableAvailable ? (
                  <CreateTable>
                    <Button variant="primary">
                      <Icon icon="plus" className="size-5" />
                      {t('data:create_table.title')}
                    </Button>
                  </CreateTable>
                ) : null}
              </div>
            ) : undefined
          }
        />
        {isEmpty ? (
          <DataListEmptyState />
        ) : (
          dataModel.map((table) => <TableDetails key={table.name} tableModel={table} dataModel={dataModel} />)
        )}
      </Page.Content>
    </Page.Container>
  );
}

function DataListEmptyState() {
  const { t } = useTranslation(handle.i18n);

  return (
    <div className="flex items-center justify-center py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectArchetype>
          <button
            type="button"
            className="border-grey-border hover:border-purple-primary hover:bg-purple-background flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
          >
            <Icon icon="category" className="text-purple-primary size-10" />
            <span className="text-l font-semibold text-grey-primary">
              {t('data:empty_state.select_archetype.title')}
            </span>
            <span className="text-s text-grey-secondary">{t('data:empty_state.select_archetype.description')}</span>
          </button>
        </SelectArchetype>
        <CreateTable>
          <button
            type="button"
            className="border-grey-border hover:border-purple-primary hover:bg-purple-background flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
          >
            <Icon icon="plus" className="text-purple-primary size-10" />
            <span className="text-l font-semibold text-grey-primary">{t('data:empty_state.create_table.title')}</span>
            <span className="text-s text-grey-secondary">{t('data:empty_state.create_table.description')}</span>
          </button>
        </CreateTable>
        <ImportOrg>
          <button
            type="button"
            className="border-grey-border hover:border-purple-primary hover:bg-purple-background flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
          >
            <Icon icon="upload" className="text-purple-primary size-10" />
            <span className="text-l font-semibold text-grey-primary">{t('data:empty_state.import_org.title')}</span>
            <span className="text-s text-grey-secondary">{t('data:empty_state.import_org.description')}</span>
          </button>
        </ImportOrg>
      </div>
    </div>
  );
}
