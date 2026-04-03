import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DestroyDataModelReport, type TableModel } from '@app-builder/models/data-model';
import { useDeleteTableMutation } from '@app-builder/queries/data/delete-table';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { dataI18n } from '../data-i18n';
import { DeleteDataModelContent } from './DeleteDataModelContent';

interface DeleteTableProps {
  table: TableModel;
  onDeleted?: () => void;
  triggerVariant?: 'default' | 'destructive';
  triggerAppearance?: 'icon' | 'text' | 'icon-text';
}

export function DeleteTable({
  table,
  onDeleted,
  triggerVariant = 'default',
  triggerAppearance = 'icon',
}: DeleteTableProps) {
  const { t } = useTranslation(dataI18n);
  const { isDeleteDataModelTableAvailable } = useDataModelFeatureAccess();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<DestroyDataModelReport | null>(null);
  const deleteTableMutation = useDeleteTableMutation();
  const revalidate = useLoaderRevalidator();

  if (!isDeleteDataModelTableAvailable) {
    return null;
  }

  const handleOpenModal = async () => {
    const result = await deleteTableMutation.mutateAsync({
      tableId: table.id,
      perform: false,
    });

    if (result.success) {
      setReport(result.data);
      setOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    const result = await deleteTableMutation.mutateAsync({
      tableId: table.id,
      perform: true,
    });

    if (result.success && result.data.performed) {
      setOpen(false);
      revalidate();
      onDeleted?.();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReport(null);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Button
        variant={triggerVariant === 'destructive' ? 'destructive' : 'secondary'}
        mode={triggerAppearance === 'icon' ? 'icon' : 'normal'}
        onClick={handleOpenModal}
        aria-label={t('data:delete_table.title', { name: table.name })}
        disabled={deleteTableMutation.isPending}
        className="flex gap-v2-sm"
      >
        {(triggerAppearance === 'icon' || triggerAppearance === 'icon-text') && (
          <Icon
            icon="delete"
            className={cn(
              triggerVariant === 'destructive' ? 'text-white dark:text-grey-primary' : 'text-purple-primary',
              triggerAppearance === 'icon' ? 'size-6' : 'size-4',
            )}
          />
        )}
        {(triggerAppearance === 'text' || triggerAppearance === 'icon-text') && <span>{t('data:delete-table')}</span>}
      </Button>
      <Modal.Content>
        <DeleteDataModelContent
          report={report}
          entityType="table"
          entityName={table.name}
          onConfirm={handleConfirmDelete}
          onClose={handleClose}
          isPending={deleteTableMutation.isPending}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
