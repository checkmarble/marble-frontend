import { ClientObjectDataList } from '@app-builder/components/DataModelExplorer/ClientObjectDataList';
import { Spinner } from '@app-builder/components/Spinner';
import { useDataModelWithOptionsQuery } from '@app-builder/queries/data/get-data-model-with-options';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { cn } from 'ui-design-system';

type ScreeningObjectDetailsProps = {
  objectType: string;
  objectId: string;
  className?: string;
};

export const ScreeningObjectDetails = ({ objectType, objectId, className }: ScreeningObjectDetailsProps) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const dataModelQuery = useDataModelWithOptionsQuery();
  const objectDetailsQuery = useObjectDetailsQuery(objectType, objectId);

  return (
    <div className={cn('p-v2-md rounded-v2-lg flex flex-col gap-v2-sm', className)}>
      <div className="font-medium">{t('continuousScreening:review.object_details_subtitle')}</div>
      {match([dataModelQuery, objectDetailsQuery])
        .with([{ isPending: true }, P.any], () => {
          return <Spinner className="size-6" />;
        })
        .with([P.any, { isPending: true }], () => {
          return <Spinner className="size-6" />;
        })
        .with([{ isError: true }, P.any], () => {
          return <div>{t('common:generic_fetch_data_error')}</div>;
        })
        .with([P.any, { isError: true }], () => {
          return <div>{t('common:generic_fetch_data_error')}</div>;
        })
        .with([{ isSuccess: true }, { isSuccess: true }], ([dmQuery, objQuery]) => {
          const tableModel = dmQuery.data.dataModel.find((t) => t.name === objectType);
          if (!tableModel) return null;

          return <ClientObjectDataList displayObjectType tableModel={tableModel} data={objQuery.data.data} />;
        })
        .exhaustive()}
    </div>
  );
};
