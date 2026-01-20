import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { useDeleteFieldMutation } from '@app-builder/queries/data/delete-field';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
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
      <ButtonV2
        mode="icon"
        variant="primary"
        appearance="stroked"
        onClick={handleOpenModal}
        className="size-7 border-purple-border-light bg-white p-0 hover:bg-purple-background-light dark:bg-grey-background dark:border-grey-border dark:hover:bg-purple-background"
        aria-label={t('data:delete_field.title', { name: field.name })}
        disabled={deleteFieldMutation.isPending}
      >
        <Icon icon="delete" className="size-4 dark:text-grey-secondary" />
      </ButtonV2>
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
