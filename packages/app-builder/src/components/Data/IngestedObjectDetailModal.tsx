import { type DataModelObject, type TableModel } from '@app-builder/models';
import { useQuery } from '@tanstack/react-query';
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
  const { data, isPending } = useQuery<{ object: DataModelObject | null }>({
    queryKey: ['data', 'view', tableName, objectId],
    queryFn: async () => {
      const response = await fetch(`/data/view/${tableName}/${objectId}`);
      return response.json();
    },
  });

  if (isPending || !data) {
    return null;
  }

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
          {data.object ? (
            <DataFields table={tableName} object={data.object} options={{ hideLinks: true }} />
          ) : (
            <div className="p-4 text-center">{t('data:viewer.no_object_found', { tableName, objectId })}</div>
          )}
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
