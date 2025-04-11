import { ClientObjectDataList } from '@app-builder/components/DataModelExplorer/ClientObjectDataList';
import { type TabItem } from '@app-builder/components/DataModelExplorer/DataModelExplorer';
import { type ClientObjectDetail, type DataModel } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';
import { cva, type VariantProps } from 'class-variance-authority';
import { type TFunction } from 'i18next';
import { Fragment, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function PivotsPanel({
  pivotObjects,
  dataModel,
  onExplore,
}: {
  pivotObjects: PivotObject[];
  dataModel: DataModel;
  onExplore: (tabItem: TabItem) => void;
}) {
  const { t } = useTranslation(['cases']);
  if (!pivotObjects[0]) {
    throw new Error('no pivot object');
  }

  const [currentPivotObject, setCurrentPivotObject] = useState(pivotObjects[0]);
  const currentTable = dataModel.find((t) => t.name === currentPivotObject.pivotObjectName);
  const pivotObjectData = currentPivotObject.pivotObjectData;

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-l font-semibold">{t('cases:case_detail.pivot_panel.title')}</h2>
      {pivotObjects.length > 1 ? (
        <div className="border-grey-90 flex gap-2 self-start rounded border p-1">
          {pivotObjects.map((pivotObject) => (
            <button
              key={pivotObject.pivotValue}
              className="aria-[current=true]:bg-purple-65 aria-[current=true]:text-grey-100 min-h-8 rounded p-1"
              aria-current={pivotObject.pivotValue === currentPivotObject.pivotValue}
              onClick={() => setCurrentPivotObject(pivotObject)}
            >
              {pivotObject.pivotObjectName}
            </button>
          ))}
        </div>
      ) : null}
      <PivotObjectDetails t={t} pivotObjectData={pivotObjectData} />
      {currentTable?.navigationOptions ? (
        <div className="grid grid-cols-[120px,_1fr] gap-3">
          {currentTable.navigationOptions.map((navigationOption) => (
            <Fragment key={`${navigationOption.targetTableId}_${navigationOption.filterFieldId}`}>
              <div>{navigationOption.targetTableName}</div>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  onExplore({
                    pivotObject: currentPivotObject,
                    sourceObject: pivotObjectData.data,
                    sourceTableName: currentTable.name,
                    sourceFieldName: navigationOption.sourceFieldName,
                    targetTableName: navigationOption.targetTableName,
                    filterFieldName: navigationOption.filterFieldName,
                    orderingFieldName: navigationOption.orderingFieldName,
                  });
                }}
                className="flex items-center gap-1"
              >
                {t('cases:case_detail.pivot_panel.explore')}
                <Icon icon="arrow-up-right" className="size-4" />
              </Button>
            </Fragment>
          ))}
        </div>
      ) : null}
      <DataCard borderless title={t('cases:case_detail.pivot_panel.case_history')}>
        <table className="w-full">
          <tr className="border-grey-90 border-y">
            <td className="border-grey-90 inline-flex justify-between gap-2 border-r p-2">
              <span className="line-clamp-1 shrink">
                Investigation name #1 with a very long name
              </span>
              <Button size="small" variant="secondary" className="shrink-0">
                Open
              </Button>
            </td>
            <td className="w-24 p-2">Something</td>
          </tr>
        </table>
      </DataCard>
    </div>
  );
}

type PivotObjectDetailsProps = {
  t: TFunction<['cases'], undefined>;
  pivotObjectData: ClientObjectDetail;
};
function PivotObjectDetails({ pivotObjectData, t }: PivotObjectDetailsProps) {
  const { data, relatedObjects } = pivotObjectData;

  return (
    <DataCard title={t('cases:case_detail.pivot_panel.informations')}>
      <div className="mt-3 flex flex-col gap-8">
        <ClientObjectDataList t={t} data={data} />
        {relatedObjects ? (
          <div className="">
            {relatedObjects.map((relatedObject) =>
              relatedObject.linkName && relatedObject.relatedObjectDetail ? (
                <Fragment key={relatedObject.linkName}>
                  <h4 className="border-grey-90 border-b text-right text-xs font-semibold">
                    Related object - {relatedObject.linkName}
                  </h4>
                  <ClientObjectDataList t={t} data={relatedObject.relatedObjectDetail.data} />
                </Fragment>
              ) : null,
            )}
          </div>
        ) : null}
      </div>
    </DataCard>
  );
}

const titleVariants = cva('text-s px-2 py-3 font-semibold', {
  variants: {
    borderless: {
      true: null,
      false: 'border-b border-grey-90',
    },
  },
  defaultVariants: {
    borderless: false,
  },
});

type DataCardProps = {
  title: string;
  children: ReactNode;
} & VariantProps<typeof titleVariants>;
function DataCard({ title, children, borderless }: DataCardProps) {
  return (
    <div>
      <h3 className={titleVariants({ borderless })}>{title}</h3>
      {children}
    </div>
  );
}
