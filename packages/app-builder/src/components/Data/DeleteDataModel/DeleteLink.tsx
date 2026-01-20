import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type DestroyDataModelReport, type LinkToSingle } from '@app-builder/models/data-model';
import { useDeleteLinkMutation } from '@app-builder/queries/data/delete-link';
import { useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { dataI18n } from '../data-i18n';
import { DeleteDataModelContent } from './DeleteDataModelContent';

interface DeleteLinkProps {
  link: {
    id: string;
    name: string;
  };
}

export function DeleteLink({ link }: DeleteLinkProps) {
  const { t } = useTranslation(dataI18n);
  const { isDeleteDataModelLinkAvailable } = useDataModelFeatureAccess();
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<DestroyDataModelReport | null>(null);
  const deleteLinkMutation = useDeleteLinkMutation();
  const revalidate = useLoaderRevalidator();

  if (!isDeleteDataModelLinkAvailable) {
    return null;
  }

  const handleOpenModal = async () => {
    const result = await deleteLinkMutation.mutateAsync({
      linkId: link.id,
      perform: false,
    });

    if (result.success) {
      setReport(result.data);
      setOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    const result = await deleteLinkMutation.mutateAsync({
      linkId: link.id,
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
        variant="secondary"
        mode="icon"
        onClick={handleOpenModal}
        aria-label={t('data:delete_link.title', { name: link.name })}
        disabled={deleteLinkMutation.isPending}
        className="flex size-7"
      >
        <Icon icon="delete" className="size-6 text-purple-primary" />
      </ButtonV2>
      <Modal.Content>
        <DeleteDataModelContent
          report={report}
          entityType="link"
          entityName={link.name}
          onConfirm={handleConfirmDelete}
          onClose={handleClose}
          isPending={deleteLinkMutation.isPending}
        />
      </Modal.Content>
    </Modal.Root>
  );
}
