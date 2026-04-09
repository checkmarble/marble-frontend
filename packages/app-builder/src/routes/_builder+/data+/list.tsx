import { CalloutV2, Page } from '@app-builder/components';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { ImportOrg } from '@app-builder/components/Data/ImportOrg';
import { SelectArchetype } from '@app-builder/components/Data/SelectArchetype';
import { CreateTableDrawer } from '@app-builder/components/Data/SemanticTables/CreateTable/CreateTableDrawer';
import { adaptCreateTableValue } from '@app-builder/components/Data/SemanticTables/CreateTable/createTable-types';
import { dataModelFlowStyles, TableFlow } from '@app-builder/components/Data/SemanticTables/Flow/TableFlow';
import { DataPageHeader } from '@app-builder/components/Data/SemanticTables/Shared/DataPageHeader';
import {
  UploadDataDrawer,
  UploadDataDrawerContent,
} from '@app-builder/components/Data/SemanticTables/UploadData/UploadDataDrawer';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateTableMutation } from '@app-builder/queries/data/create-table';
import { useDataModel } from '@app-builder/services/data/data-model';
import { LinksFunction } from '@remix-run/server-runtime';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: dataModelFlowStyles }];

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export default function DataList() {
  const { t } = useTranslation(handle.i18n);
  const dataModel = useDataModel();
  const revalidate = useLoaderRevalidator();
  const createTableMutation = useCreateTableMutation();
  const [uploadDrawerData, setUploadDrawerData] = useState<unknown>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const isUploadDrawerOpen = uploadDrawerData !== null;

  const isEmpty = dataModel.length === 0;

  const handleImportSuccess = (data: unknown) => setUploadDrawerData(data);
  const handleOpenCreateDrawer = () => setIsCreateDrawerOpen(true);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Page.Container>
        <Page.Content>
          {isEmpty ? (
            <EmptyHeader onImportSuccess={handleImportSuccess} onCreateTable={handleOpenCreateDrawer} />
          ) : (
            <DataPageHeader handleOpenCreateDrawer={handleOpenCreateDrawer} />
          )}
          <CalloutV2>{t('data:callout')}</CalloutV2>

          {isEmpty ? (
            <DataListEmptyState onImportSuccess={handleImportSuccess} onCreateTable={handleOpenCreateDrawer} />
          ) : (
            <div className="flex w-full min-h-[min(600px,75vh)] flex-1 flex-col">
              <TableFlow dataModel={dataModel} />
            </div>
          )}
        </Page.Content>
      </Page.Container>
      <UploadDataDrawer open={isUploadDrawerOpen} data={uploadDrawerData} onClose={() => setUploadDrawerData(null)}>
        <UploadDataDrawerContent />
      </UploadDataDrawer>
      <CreateTableDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSave={async (values) => {
          const result = await createTableMutation.mutateAsync(adaptCreateTableValue(values));
          if (!result.success) return false;
          setIsCreateDrawerOpen(false);
          revalidate();
          return true;
        }}
      />
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
}
