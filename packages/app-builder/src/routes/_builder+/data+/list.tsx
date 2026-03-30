import { CalloutV2, Page } from '@app-builder/components';
import { DataTabs } from '@app-builder/components/Data/DataTabs';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { ImportOrg } from '@app-builder/components/Data/ImportOrg';
import { SelectArchetype } from '@app-builder/components/Data/SelectArchetype';
import { CreateTableDrawer } from '@app-builder/components/Data/SemanticTables/CreateTable/CreateTableDrawer';
import {
  UploadDataDrawer,
  UploadDataDrawerContent,
} from '@app-builder/components/Data/SemanticTables/UploadData/Drawer';
import { TableDetails } from '@app-builder/components/Data/TableDetails';
import { useExportOrgMutation } from '@app-builder/queries/data/export-org';
import { useDataModel, useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export default function DataList() {
  const { t } = useTranslation(handle.i18n);
  const dataModel = useDataModel();
  const { isCreateDataModelTableAvailable } = useDataModelFeatureAccess();
  const exportOrgMutation = useExportOrgMutation();
  const [uploadDrawerData, setUploadDrawerData] = useState<unknown>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const isUploadDrawerOpen = uploadDrawerData !== null;

  const isEmpty = dataModel.length === 0;

  const handleImportSuccess = (data: unknown) => setUploadDrawerData(data);
  const handleOpenCreateDrawer = () => setIsCreateDrawerOpen(true);

  return (
    <div className="h-full">
      <Page.Container>
        <Page.Content>
          {isEmpty ? (
            <EmptyHeader onImportSuccess={handleImportSuccess} onCreateTable={handleOpenCreateDrawer} />
          ) : (
            <DataTabs
              actions={
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
                    <Button variant="primary" onClick={handleOpenCreateDrawer}>
                      <Icon icon="plus" className="size-5" />
                      {t('data:create_table.title')}
                    </Button>
                  ) : null}
                </div>
              }
            />
          )}
          <CalloutV2>{t('data:callout')}</CalloutV2>

          {isEmpty ? (
            <DataListEmptyState onImportSuccess={handleImportSuccess} onCreateTable={handleOpenCreateDrawer} />
          ) : (
            dataModel.map((table) => <TableDetails key={table.name} tableModel={table} dataModel={dataModel} />)
          )}
        </Page.Content>
      </Page.Container>
      <UploadDataDrawer open={isUploadDrawerOpen} data={uploadDrawerData} onClose={() => setUploadDrawerData(null)}>
        <UploadDataDrawerContent />
      </UploadDataDrawer>
      <CreateTableDrawer open={isCreateDrawerOpen} onClose={() => setIsCreateDrawerOpen(false)} />
    </div>
  );
}

function EmptyHeader({
  onImportSuccess,
  onCreateTable,
}: {
  onImportSuccess: (data: unknown) => void;
  onCreateTable: () => void;
}) {
  const { t } = useTranslation(['navigation']);

  return (
    <>
      <div className="flex gap-4">
        <h1 className="text-xl font-bold flex-1">{t('data:data-model')}</h1>
        <MenuCommand.Menu>
          <MenuCommand.Trigger>
            <Button type="button" size="default">
              {t('data:empty_state.create_table.title')}
              <Icon icon="plus" className=" size-4" />
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content>
            <MenuCommand.List>
              <MenuCommand.Item>
                <ImportOrg onImportSuccess={onImportSuccess}>
                  <button className="flex items-center gap-2">
                    <Icon icon="upload" className="size-4" />
                    {t('data:create_new_table.from_file')}
                  </button>
                </ImportOrg>
              </MenuCommand.Item>
              <MenuCommand.Item>
                <button className="flex items-center gap-2" onClick={onCreateTable}>
                  <Icon icon="edit" className="size-4" />
                  {t('data:create_new_table.manually')}
                </button>
              </MenuCommand.Item>
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
    </>
  );
}

function DataListEmptyState({
  onImportSuccess,
  onCreateTable,
}: {
  onImportSuccess: (data: unknown) => void;
  onCreateTable: () => void;
}) {
  const { t } = useTranslation(handle.i18n);

  return (
    <section className="px-v2-lg py-v2-xxl grid gap-4">
      <div className="grid py-xl w-full place-items-center gap-v2-lg">
        <header className="text-center">
          <p className="font-semibold">{t('data:empty_state.title')}</p>
          <p className="text-sm text-grey-secondary">{t('data:empty_state.description')}</p>
        </header>
        <div className="grid grid-cols-3 gap-v2-sm">
          <SelectArchetype>
            <Button type="button" appearance="stroked" size="default" className="w-full justify-center" disabled>
              <span>{t('data:empty_state.select_archetype.title')}</span>
              <Icon icon="category" className="size-4" />
            </Button>
          </SelectArchetype>
          <ImportOrg onImportSuccess={onImportSuccess}>
            <Button type="button" appearance="stroked" size="default" className="w-full justify-center">
              <span>{t('data:empty_state.import_org.title')}</span>
              <Icon icon="upload" className="size-4" />
            </Button>
          </ImportOrg>
          <Button
            type="button"
            appearance="stroked"
            size="default"
            className="w-full justify-center"
            onClick={onCreateTable}
          >
            {t('data:empty_state.create_table.title')}
            <Icon icon="plus" className=" size-4" />
          </Button>
        </div>
      </div>
    </section>
  );

  // return (
  //   <div className="flex items-center justify-center py-16">
  //     <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  //       <SelectArchetype>
  //         <button
  //           type="button"
  //           className="border-grey-border hover:border-purple-primary hover:bg-purple-background dark:hover:bg-purple-border flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
  //         >
  //           <Icon icon="category" className="text-purple-primary size-10" />
  //           <span className="text-l font-semibold text-grey-primary">
  //             {t('data:empty_state.select_archetype.title')}
  //           </span>
  //           <span className="text-s text-grey-secondary">{t('data:empty_state.select_archetype.description')}</span>
  //         </button>
  //       </SelectArchetype>
  //       <CreateTable>
  //         <button
  //           type="button"
  //           className="border-grey-border hover:border-purple-primary hover:bg-purple-background dark:hover:bg-purple-border flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
  //         >
  //           <Icon icon="plus" className="text-purple-primary size-10" />
  //           <span className="text-l font-semibold text-grey-primary">{t('data:empty_state.create_table.title')}</span>
  //           <span className="text-s text-grey-secondary">{t('data:empty_state.create_table.description')}</span>
  //         </button>
  //       </CreateTable>
  //       <ImportOrg>
  //         <button
  //           type="button"
  //           className="border-grey-border hover:border-purple-primary hover:bg-purple-background dark:hover:bg-purple-border flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors"
  //         >
  //           <Icon icon="upload" className="text-purple-primary size-10" />
  //           <span className="text-l font-semibold text-grey-primary">{t('data:empty_state.import_org.title')}</span>
  //           <span className="text-s text-grey-secondary">{t('data:empty_state.import_org.description')}</span>
  //         </button>
  //       </ImportOrg>
  //     </div>
  //   </div>
  // );
}
