import { ClientObjectDataList } from '@app-builder/components/DataModelExplorer/ClientObjectDataList';
import { useDataModelWithOptionsQuery } from '@app-builder/queries/data/get-data-model-with-options';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { match, P } from 'ts-pattern';

type ScreeningObjectDetailsProps = {
  objectType: string;
  objectId: string;
};

export const ScreeningObjectDetails = ({ objectType, objectId }: ScreeningObjectDetailsProps) => {
  const dataModelQuery = useDataModelWithOptionsQuery();
  const objectDetailsQuery = useObjectDetailsQuery(objectType, objectId);

  return (
    <div className="bg-grey-background-light p-v2-md rounded-v2-lg">
      {match([dataModelQuery, objectDetailsQuery])
        .with([{ isPending: true }, P.any], () => {
          return <div>Loading...</div>;
        })
        .with([P.any, { isPending: true }], () => {
          return <div>Loading...</div>;
        })
        .with([{ isError: true }, P.any], () => {
          return <div>Error loading data model</div>;
        })
        .with([P.any, { isError: true }], () => {
          return <div>Error loading object details</div>;
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
