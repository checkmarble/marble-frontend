import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DestroyDataModelReport, type Pivot } from '@app-builder/models/data-model';
import { useDeletePivotMutation } from '@app-builder/queries/data/delete-pivot';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { getPivotDisplayValue } from '@app-builder/services/data/pivot';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { dataI18n } from '../data-i18n';
import { DeleteDataModelContent } from './DeleteDataModelContent';

interface DeletePivotProps {
  pivot: Pivot;
  onDeleted?: () => void;
}

export function DeletePivot({ pivot, onDeleted }: DeletePivotProps) {
  const { t } = useTranslation(dataI18n);
  const { isDeleteDataModelPivotAvailable } = useDataModelFeatureAccess();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<DestroyDataModelReport | null>(null);
  const deletePivotMutation = useDeletePivotMutation();
  const revalidate = useLoaderRevalidator();

  if (!isDeleteDataModelPivotAvailable) {
    return null;
  }

  const pivotName = getPivotDisplayValue(pivot);

  const handleOpenModal = async () => {
    const result = await deletePivotMutation.mutateAsync({
      pivotId: pivot.id,
      perform: false,
    });

    if (result.success) {
      setReport(result.data);
      setOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    const result = await deletePivotMutation.mutateAsync({
      pivotId: pivot.id,
      perform: true,
    });

    if (result.success) {
      setOpen(false);
      setReport(null);
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
      <Button variant="destructive" onClick={handleOpenModal} disabled={deletePivotMutation.isPending}>
        <Icon icon="delete" className="size-5" />
        {t('common:delete')}
      </Button>
      <Modal.Content>
        <DeleteDataModelContent
          report={report}
          entityType="pivot"
          entityName={pivotName}
          confirmText="DELETE"
          onConfirm={handleConfirmDelete}
          onClose={handleClose}
          isPending={deletePivotMutation.isPending}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
