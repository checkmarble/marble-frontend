import { Client360Table } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BreadCrumbs } from '../Breadcrumbs';
import { Page } from '../Page';

export const ClientDetailSearchPage = ({ tables }: { tables: Client360Table[] }) => {
  const { t } = useTranslation(['common']);
  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <Modal.Root>
          <Modal.Trigger asChild>
            <ButtonV2 variant="primary" size="small" appearance={tables.length > 0 ? 'stroked' : 'filled'}>
              <Icon icon="plus" className="size-4" />
              Add configuration
            </ButtonV2>
          </Modal.Trigger>
          <Modal.Content>
            <Modal.Title>Configuration</Modal.Title>
            <div className="p-v2-md">
              <div className="grid grid-cols-2 gap-y-v2-sm gap-x-v2-md p-v2-sm bg-grey-background-light rounded-lg border border-grey-border text-small">
                <div className="flex items-center gap-v2-sm">
                  <span>Table:</span>
                  <span>TABLE_SELECTOR</span>
                </div>
                <div className="flex items-center gap-v2-sm col-start-1">
                  <span>Type:</span>
                  <span>TYPE_SELECTOR</span>
                </div>
                <div className="flex items-center gap-v2-sm">
                  <span>Name:</span>
                  <span>NAME_SELECTOR</span>
                </div>
                <div className="flex items-center gap-v2-sm col-start-2">
                  <span>Alias:</span>
                  <span>ALIAS_INPUT</span>
                </div>
              </div>
            </div>
            <Modal.Footer>
              <div className="flex items-center gap-v2-sm justify-end p-v2-md">
                <Modal.Close asChild>
                  <ButtonV2 variant="secondary" size="small">
                    {t('common:cancel')}
                  </ButtonV2>
                </Modal.Close>
                <ButtonV2 variant="primary" size="small">
                  {t('common:save')}
                </ButtonV2>
              </div>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </Page.Header>
      <Page.Container>
        <Page.ContentV2 paddingLess={tables.length === 0}>
          {/* TODO: Must change to Callout when new component is done */}
          {tables.length === 0 ? (
            <div className="bg-background-light border-b border-grey-border px-v2-xl py-v2-md flex items-center gap-v2-sm">
              <Icon icon="tip" className="size-5" />
              <span>
                Vous n’avez pas encore de configuration active. Pour effectuer une recherche, vous devez d’abord
                configurer les types d’entités sur lesquelles vous pourrez effectuer des recherches.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_40px_1fr] gap-v2-lg border border-grey-border rounded-lg p-v2-md bg-surface-card">
              {tables.map((table) => {
                return (
                  <form key={table.id} className="flex flex-col gap-v2-sm">
                    <label htmlFor={`search_${table.id}`} className="font-medium capitalize">
                      Search by {(table.alias ?? table.name).toLowerCase()}
                    </label>
                    <div className="flex items-center gap-v2-sm">
                      <Input
                        startAdornment="search"
                        placeholder={`${table.alias ?? table.name}...`}
                        id={`search_${table.id}`}
                        className="grow"
                        disabled={!table.ready}
                      />
                      <ButtonV2 variant="primary" size="default" className="shrink-0">
                        Search
                      </ButtonV2>
                    </div>
                  </form>
                );
              })}
            </div>
          )}
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
