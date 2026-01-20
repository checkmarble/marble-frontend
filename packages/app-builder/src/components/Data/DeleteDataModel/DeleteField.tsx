import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DataModelField, type DestroyDataModelReport } from '@app-builder/models/data-model';
import { useDeleteFieldMutation } from '@app-builder/queries/data/delete-field';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { dataI18n } from '../data-i18n';
import { DeleteDataModelContent } from './DeleteDataModelContent';

interface DeleteFieldProps {
  field: {
    id: string;
    name: string;
  };
}

export function DeleteField({ field }: DeleteFieldProps) {
  const { t } = useTranslation(dataI18n);
  const { isDeleteDataModelFieldAvailable } = useDataModelFeatureAccess();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<DestroyDataModelReport | null>(null);
  const deleteFieldMutation = useDeleteFieldMutation();
  const revalidate = useLoaderRevalidator();

  if (!isDeleteDataModelFieldAvailable) {
    return null;
  }

  const handleOpenModal = async () => {
    const result = await deleteFieldMutation.mutateAsync({
      fieldId: field.id,
      perform: false,
    });

    if (result.success) {
      setReport(result.data);
      setOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    const result = await deleteFieldMutation.mutateAsync({
      fieldId: field.id,
      perform: true,
    });

    if (result.success && result.data.performed) {
      setOpen(false);
      revalidate();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReport(null);
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <button
        onClick={handleOpenModal}
        className="group-hover:text-grey-primary group-hover:bg-grey-background-light group-hover:border-grey-placeholder hover:group-hover:bg-grey-background active:group-hover:bg-grey-border relative cursor-pointer rounded-sm border p-2 text-transparent transition-colors ease-in-out"
        aria-label={t('data:delete_field.title', { name: field.name })}
        disabled={deleteFieldMutation.isPending}
      >
        <Icon icon="delete" className="size-6" />
      </button>
      <Modal.Content>
        <DeleteDataModelContent
          report={report}
          entityType="field"
          entityName={field.name}
          onConfirm={handleConfirmDelete}
          onClose={handleClose}
          isPending={deleteFieldMutation.isPending}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
