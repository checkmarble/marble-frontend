import { useExportOrgMutation } from '@app-builder/queries/data/export-org';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DataPageHeader({ handleOpenCreateDrawer }: { handleOpenCreateDrawer: () => void }) {
  const { t } = useTranslation(['navigation']);
  const { isCreateDataModelTableAvailable } = useDataModelFeatureAccess();
  const exportOrgMutation = useExportOrgMutation();

  return (
    <div className="flex items-center justify-between gap-v2-md">
      <h1 className="text-xl font-bold">{t('navigation:data')}</h1>
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
      </div>{' '}
    </div>
  );
}
