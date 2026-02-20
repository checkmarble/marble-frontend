import { type DataModelObject, type TableModel } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'ui-design-system';

import { IngestedObjectDetail } from '../Data/IngestedObjectDetail';

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
  const { load: fetcherLoad, data, state: fetchState } = useFetcher<{ object: DataModelObject | null }>();

  useEffect(() => {
    fetcherLoad(
      getRoute('/data/view/:tableName/:objectId', {
        tableName,
        objectId,
      }),
    );
  }, [fetcherLoad, tableName, objectId]);

  if (fetchState === 'loading' || !data) {
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
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
