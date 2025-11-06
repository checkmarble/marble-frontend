import { type TableModel } from '@app-builder/models';
import { useObjectDetails } from '@app-builder/queries/data/object-details';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';
import { IngestedObjectDetail } from '../Data/IngestedObjectDetail';

type IngestedObjectDetailModalProps = {
  dataModel: TableModel[];
  tableName: string;
  objectId: string;
  onClose: () => void;
};

export function IngestedObjectDetailModal({ dataModel, tableName, objectId, onClose }: IngestedObjectDetailModalProps) {
  const { t } = useTranslation(['data']);
  const objectDetailsQuery = useObjectDetails(tableName, objectId);

  if (!objectDetailsQuery.isSuccess || !objectDetailsQuery.data?.object) {
    return null;
  }

  const data = objectDetailsQuery.data;

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content size="large">
        <Modal.Title>{tableName}</Modal.Title>
        {data.object ? (
          <IngestedObjectDetail
            light
            bordered={false}
            withLinks={false}
            dataModel={dataModel}
            tableName={tableName}
            objectId={objectId}
            object={data.object}
          />
        ) : (
          <div className="p-4 text-center">{t('data:viewer.no_object_found', { tableName, objectId })}</div>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
