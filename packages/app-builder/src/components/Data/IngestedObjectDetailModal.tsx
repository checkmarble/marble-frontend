import { isNotFoundHttpError, type TableModel } from '@app-builder/models';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { DataFields } from './DataVisualisation/DataFields';

export function IngestedObjectDetailModal({
  dataModel,
  tableName,
  objectId,
  onClose,
}: {
  dataModel: TableModel[];
  tableName: string;
  objectId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(['data']);
  const { data: object, isPending, error } = useObjectDetailsQuery(tableName, objectId);

  if (isPending) {
    return null;
  }

  const noObjectFound = isNotFoundHttpError(error);

  return (
    <Modal.Root
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Content size="large">
        <Modal.Title>{tableName}</Modal.Title>
        <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
          {object && !noObjectFound ? (
            <DataFields table={tableName} object={object} options={{ hideLinks: true }} />
          ) : (
            <div className="p-4 text-center">{t('data:viewer.no_object_found', { tableName, objectId })}</div>
          )}
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
