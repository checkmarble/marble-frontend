import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { Spinner } from '@app-builder/components/Spinner';
import { Case } from '@app-builder/models/cases';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { ObjectRelatedCases } from './ObjectRelatedCases';

type ObjectDetailsProps = {
  objectType: string;
  objectId: string;
  currentCase: Case;
};

export const ObjectDetails = ({ objectType, objectId, currentCase }: ObjectDetailsProps) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const dataModelQuery = useDataModelQuery();
  const objectDetailsQuery = useObjectDetailsQuery(objectType, objectId);

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-col gap-sm">
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

            return <DataFields table={tableModel.name} object={{ data: objQuery.data.data }} />;
          })
          .exhaustive()}
      </div>
      <ObjectRelatedCases
        objectType={objectType}
        objectId={objectId}
        currentCase={currentCase}
        className="bg-grey-background-light border border-grey-border"
      />
    </div>
  );
};
