import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { type DataModel, type TableModel } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';

type PivotObjectDetailsProps = {
  tableModel: TableModel;
  dataModel: DataModel;
  pivotObject: PivotObject;
};
export function PivotObjectDetails({ tableModel, dataModel, pivotObject }: PivotObjectDetailsProps) {
  const { t } = useTranslation(['common', 'cases']);
  const { data, relatedObjects } = pivotObject.pivotObjectData;
  const filteredRelatedObjects = relatedObjects.filter((r) => !!r.relatedObjectDetail?.metadata);

  return (
    <>
      <div className="flex flex-col gap-xl">
        <DataFields table={tableModel.name} object={{ data }} />

        {filteredRelatedObjects.length > 0 ? (
          <div className="">
            {filteredRelatedObjects.map((relatedObject) => {
              if (!relatedObject.relatedObjectDetail?.metadata) return null;

              const relatedObjectType = relatedObject.relatedObjectDetail.metadata.objectType;
              const relatedObjectTable = dataModel.find((tm) => tm.name === relatedObjectType);
              if (!relatedObjectTable) return null;
              const tableName = relatedObject.linkName ?? relatedObjectType;

              return (
                <Fragment key={relatedObjectType}>
                  <Typo
                    variant="subtitle2"
                    className="border-grey-border mb-md border-b text-right text-xs font-semibold"
                  >
                    {t('cases:case_detail.pivot_panel.related_object', {
                      tableName,
                    })}
                  </Typo>
                  <DataFields table={relatedObjectType} object={{ data: relatedObject.relatedObjectDetail.data }} />
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
