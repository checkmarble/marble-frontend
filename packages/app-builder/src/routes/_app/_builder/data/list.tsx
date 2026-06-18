import { CalloutV2, Page } from '@app-builder/components';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { ImportOrg } from '@app-builder/components/Data/ImportOrg';
import { SelectArchetype } from '@app-builder/components/Data/SelectArchetype';
import { CreateTableDrawer } from '@app-builder/components/Data/SemanticTables/CreateTable/CreateTableDrawer';
import { adaptCreateTableValue } from '@app-builder/components/Data/SemanticTables/CreateTable/createTable-types';
import { dataModelFlowStyles, TableFlow } from '@app-builder/components/Data/SemanticTables/Flow/TableFlow';
import { DataPageHeader } from '@app-builder/components/Data/SemanticTables/Shared/DataPageHeader';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateTableMutation } from '@app-builder/queries/data/create-table';
import { useDataModel } from '@app-builder/services/data/data-model';
import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const Route = createFileRoute('/_app/_builder/data/list')({
  staticData: {
    i18n: dataI18n satisfies Namespace,
  },
  component: DataList,
  head: () => ({
    links: [{ rel: 'stylesheet', href: dataModelFlowStyles }],
  }),
});

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

function DataList() {
  const { t } = useTranslation(handle.i18n);
  const dataModel = useDataModel();
  const revalidate = useLoaderRevalidator();
  const createTableMutation = useCreateTableMutation();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const isEmpty = dataModel.length === 0;

  const handleOpenCreateDrawer = () => setIsCreateDrawerOpen(true);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Page.Content className="min-h-0 flex-1">
        {isEmpty ? (
          <EmptyHeader onCreateTable={handleOpenCreateDrawer} />
        ) : (
          <DataPageHeader handleOpenCreateDrawer={handleOpenCreateDrawer} />
        )}
        <CalloutV2>{t('data:callout')}</CalloutV2>

        {isEmpty ? (
          <DataListEmptyState onCreateTable={handleOpenCreateDrawer} />
        ) : (
          <div className="flex h-[min(600px,75vh)] w-full min-h-[min(600px,75vh)] flex-1 flex-col">
            <ClientOnly
              fallback={
                <div className="flex size-full items-center justify-center">
                  <Spinner className="size-8" />
                </div>
              }
            >
              <TableFlow dataModel={dataModel} />
            </ClientOnly>
          </div>
        )}
      </Page.Content>

      <CreateTableDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSave={async (values) => {
          try {
            await createTableMutation.mutateAsync(adaptCreateTableValue(values));
            setIsCreateDrawerOpen(false);
            revalidate();
            return true;
          } catch {
            return false;
          }
        }}
      />
    </div>
  );
}

function EmptyHeader({ onCreateTable }: { onCreateTable: () => void }) {
  const { t } = useTranslation(['navigation', 'data']);

  return (
    <>
      <div className="flex gap-md">
        <Typo variant="title1" className="flex-1">
          {t('data:data-model')}
        </Typo>
        <MenuCommand.Menu>
          <MenuCommand.Trigger>
            <Button type="button" size="medium">
              {t('data:empty_state.create_table.title')}
              <Icon icon="plus" className=" size-4" />
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content>
            <MenuCommand.List>
              <MenuCommand.Item>
                <ImportOrg>
                  <div className="flex items-center gap-sm cursor-pointer">
                    <Icon icon="upload" className="size-4" />
                    {t('data:create_new_table.from_file')}
                  </div>
                </ImportOrg>
              </MenuCommand.Item>
              <MenuCommand.Item>
                <button className="flex items-center gap-sm" onClick={onCreateTable}>
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

function DataListEmptyState({ onCreateTable }: { onCreateTable: () => void }) {
  const { t } = useTranslation(handle.i18n);

  return (
    <section className="px-lg py-2xl grid gap-md">
      <div className="grid py-xl w-full place-items-center gap-lg">
        <header className="text-center">
          <p className="font-semibold">{t('data:empty_state.title')}</p>
          <p className="text-sm text-grey-secondary">{t('data:empty_state.description')}</p>
        </header>
        <div className="grid grid-cols-3 gap-sm">
          <SelectArchetype>
            <Button type="button" appearance="stroked" size="medium" className="w-full justify-center">
              <span>{t('data:empty_state.select_archetype.title')}</span>
              <Icon icon="category" className="size-4" />
            </Button>
          </SelectArchetype>
          <ImportOrg>
            <Button type="button" appearance="stroked" size="medium" className="w-full justify-center">
              <span>{t('data:empty_state.import_org.title')}</span>
              <Icon icon="upload" className="size-4" />
            </Button>
          </ImportOrg>
          <Button
            type="button"
            appearance="stroked"
            size="medium"
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
