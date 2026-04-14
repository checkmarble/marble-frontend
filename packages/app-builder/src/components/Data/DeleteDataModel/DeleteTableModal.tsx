import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DestroyDataModelReport, type TableModel } from '@app-builder/models/data-model';
import { useDeleteTableMutation } from '@app-builder/queries/data/delete-table';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useEffect, useState } from 'react';
import { Modal } from 'ui-design-system';
import { DeleteDataModelContent } from './DeleteDataModelContent';

interface DeleteTableModalProps {
  table: TableModel;
  onDeleted?: () => void;
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTableModal({ table, onDeleted, children, open, onOpenChange }: DeleteTableModalProps) {
  const { isDeleteDataModelTableAvailable } = useDataModelFeatureAccess();
  const [report, setReport] = useState<DestroyDataModelReport | null>(null);
  const deleteTableMutation = useDeleteTableMutation();
  const revalidate = useLoaderRevalidator();

  if (!isDeleteDataModelTableAvailable) {
    return null;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReport(null);
    onOpenChange(nextOpen);
  };

  const handleOpenModal = async () => {
    const result = await deleteTableMutation.mutateAsync({
      tableId: table.id,
      perform: false,
    });

    if (result.success) {
      setReport(result.data);
      onOpenChange(true);
      return;
    }

    onOpenChange(false);
  };

  const handleConfirmDelete = async () => {
    const result = await deleteTableMutation.mutateAsync({
      tableId: table.id,
      perform: true,
    });

    if (result.success && result.data.performed) {
      handleOpenChange(false);
      revalidate();
      onDeleted?.();
    }
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      handleOpenChange(false);
      return;
    }

    void handleOpenModal();
  }, [open, table.id]);

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      {children ? <Modal.Trigger onClick={handleOpenModal}>{children}</Modal.Trigger> : null}
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
